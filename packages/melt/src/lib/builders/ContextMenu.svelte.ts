import { Synced } from "$lib/Synced.svelte";
import type { MaybeGetter } from "$lib/types";
import { dataAttr } from "$lib/utils/attribute";
import { extract } from "$lib/utils/extract";
import { createBuilderMetadata } from "$lib/utils/identifiers";
import { isHtmlElement } from "$lib/utils/is";
import { kbd } from "$lib/utils/keyboard";
import { createVirtualAnchor, MenuNavigation } from "$lib/utils/menu";
import { computeConvexHullFromElements, type Point } from "$lib/utils/polygon";
import { useFloating, type UseFloatingConfig } from "$lib/utils/use-floating.svelte";
import type { VirtualElement } from "@floating-ui/dom";
import { on } from "svelte/events";
import { createAttachmentKey, type Attachment } from "svelte/attachments";
import type { HTMLAttributes } from "svelte/elements";

const { dataAttrs, dataSelectors, createIds } = createBuilderMetadata("context-menu", [
	"trigger",
	"content",
	"item",
	"separator",
	"label",
	"sub-trigger",
	"sub-content",
]);

// Submenu hover delay in ms
const SUBMENU_OPEN_DELAY = 100;
const SUBMENU_CLOSE_DELAY = 300;

export type ContextMenuProps = {
	/**
	 * Whether the context menu is open.
	 *
	 * When passing a getter, it will be used as source of truth,
	 * meaning that the value only changes when the getter returns a new value.
	 *
	 * Otherwise, if passing a static value, it'll serve as the default value.
	 *
	 * @default false
	 */
	open?: MaybeGetter<boolean | undefined>;

	/**
	 * Called when the open state changes.
	 */
	onOpenChange?: (open: boolean) => void;

	/**
	 * Whether pressing Escape closes the menu.
	 *
	 * @default true
	 */
	closeOnEscape?: MaybeGetter<boolean | undefined>;

	/**
	 * Whether clicking outside the menu closes it.
	 *
	 * @default true
	 */
	closeOnOutsideClick?: MaybeGetter<boolean | undefined>;

	/**
	 * Floating UI configuration for positioning.
	 */
	floatingConfig?: UseFloatingConfig;
};

export type ContextMenuItemProps = {
	/**
	 * Called when the item is selected.
	 */
	onSelect?: () => void;

	/**
	 * Whether the item is disabled.
	 */
	disabled?: MaybeGetter<boolean | undefined>;
};

export type ContextMenuSubProps = {
	/**
	 * Whether the submenu is open.
	 */
	open?: MaybeGetter<boolean | undefined>;

	/**
	 * Called when the submenu open state changes.
	 */
	onOpenChange?: (open: boolean) => void;
};

/**
 * A context menu that appears on right-click.
 *
 * @example
 * ```svelte
 * <script>
 *   const menu = new ContextMenu();
 * </script>
 *
 * <div {...menu.trigger}>Right-click here</div>
 *
 * <div {...menu.content}>
 *   <button {...menu.getItem({ onSelect: () => console.log('copy') })}>Copy</button>
 *   <button {...menu.getItem({ onSelect: () => console.log('paste') })}>Paste</button>
 *   <hr {...menu.separator} />
 *   <span {...menu.label}>Actions</span>
 * </div>
 * ```
 */
export class ContextMenu {
	/* Props */
	#props!: ContextMenuProps;
	readonly closeOnEscape = $derived(extract(this.#props.closeOnEscape, true));
	readonly closeOnOutsideClick = $derived(extract(this.#props.closeOnOutsideClick, true));

	/* State */
	#open: Synced<boolean>;
	ids = $state(createIds());
	#virtualAnchor: VirtualElement | null = $state(null);
	#contentEl: HTMLElement | null = $state(null);
	#triggerEl: HTMLElement | null = $state(null);
	#itemIndexMap = new Map<object, number>();
	#itemCount = 0;
	#children = new Set<ContextMenuSub>();
	#closeTimeout: ReturnType<typeof setTimeout> | null = null;

	/* Pointer direction tracking for grace intent */
	#lastPointerX = 0;
	#pointerDir: "left" | "right" = "right";
	#graceIntent: { area: Point[]; side: "left" | "right" } | null = null;

	/* Navigation */
	#navigation: MenuNavigation;

	constructor(props: ContextMenuProps = {}) {
		this.#props = props;
		this.#open = new Synced({
			value: props.open,
			onChange: props.onOpenChange,
			defaultValue: false,
		});

		this.#navigation = new MenuNavigation({
			getItems: () => this.#getItems(),
			onHighlight: (_index) => {
				// Highlighting is handled via $derived in getItem
			},
			onSelect: (index) => {
				const items = this.#getItems();
				const el = items[index];
				if (el) el.click();
			},
			onClose: () => this.close(),
		});
	}

	#getItems(): HTMLElement[] {
		if (!this.#contentEl) return [];
		return [...this.#contentEl.querySelectorAll(dataSelectors.item)].filter(isHtmlElement);
	}

	/**
	 * Whether the context menu is open.
	 */
	get open() {
		return this.#open.current;
	}

	set open(value: boolean) {
		this.#open.current = value;
		if (!value) {
			// Close all children when parent closes
			for (const child of this.#children) {
				child.open = false;
			}
			this.#navigation.reset();
			this.#graceIntent = null;
			this.#clearCloseTimeout();
		}
	}

	/**
	 * Close the context menu.
	 */
	close() {
		this.open = false;
	}

	#clearCloseTimeout() {
		if (this.#closeTimeout) {
			clearTimeout(this.#closeTimeout);
			this.#closeTimeout = null;
		}
	}

	#scheduleClose() {
		this.#clearCloseTimeout();
		this.#closeTimeout = setTimeout(() => {
			// Don't close if pointer is moving toward an open child submenu
			if (this.#isMovingTowardChild()) {
				this.#scheduleClose(); // Reschedule check
				return;
			}
			this.close();
		}, SUBMENU_CLOSE_DELAY);
	}

	#isMovingTowardChild(): boolean {
		if (!this.#graceIntent) return false;
		// Check if any child submenu is open and pointer is moving toward it
		for (const child of this.#children) {
			if (child.open) {
				return this.#pointerDir === this.#graceIntent.side;
			}
		}
		return false;
	}

	/**
	 * Create a submenu.
	 */
	createSub(props: ContextMenuSubProps = {}): ContextMenuSub {
		const sub = new ContextMenuSub(this, props);
		this.#children.add(sub);
		return sub;
	}

	/* Trigger attachment */
	#triggerAttachmentKey = createAttachmentKey();
	#triggerAttachment: Attachment<HTMLElement> = (node) => {
		this.#triggerEl = node;
		return () => {
			if (this.#triggerEl === node) {
				this.#triggerEl = null;
			}
		};
	};

	/**
	 * The spread attributes for the trigger element.
	 */
	get trigger() {
		return {
			[dataAttrs.trigger]: "",
			"aria-haspopup": "menu",
			oncontextmenu: (e: MouseEvent) => {
				e.preventDefault();
				this.#virtualAnchor = createVirtualAnchor(e.clientX, e.clientY);
				this.open = true;
			},
			[this.#triggerAttachmentKey]: this.#triggerAttachment,
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	/* Content attachment */
	#contentAttachmentKey = createAttachmentKey();
	#contentAttachment: Attachment<HTMLElement> = (node) => {
		this.#contentEl = node;

		// Floating UI positioning
		$effect(() => {
			if (!this.open || !this.#virtualAnchor || !this.#contentEl) return;

			useFloating({
				node: () => this.#virtualAnchor!,
				floating: () => this.#contentEl!,
				config: () => ({
					computePosition: {
						placement: "bottom-start",
					},
					...this.#props.floatingConfig,
				}),
			});
		});

		// Show/hide popover
		$effect(() => {
			if (this.open) {
				node.showPopover();
				// Focus content when opened
				node.focus();
				// Highlight first item
				this.#navigation.highlightFirst();
			} else {
				node.hidePopover();
			}
		});

		// Event listeners
		const offs = [
			// Close on escape
			on(document, "keydown", (e) => {
				if (!this.open || !this.closeOnEscape) return;
				if (e.key === kbd.ESCAPE) {
					e.preventDefault();
					this.close();
				}
			}),

			// Close on outside click
			on(document, "pointerdown", (e) => {
				if (!this.open || !this.closeOnOutsideClick) return;
				const target = e.target as Node;
				if (
					!this.#contentEl?.contains(target) &&
					!this.#triggerEl?.contains(target) &&
					!this.#isInsideSubmenu(target)
				) {
					this.close();
				}
			}),
		];

		return () => {
			if (this.#contentEl === node) {
				this.#contentEl = null;
			}
			offs.forEach((off) => off());
		};
	};

	#isInsideSubmenu(target: Node): boolean {
		for (const child of this.#children) {
			if (child.containsTarget(target)) return true;
		}
		return false;
	}

	/**
	 * The spread attributes for the content element.
	 */
	get content() {
		return {
			[dataAttrs.content]: "",
			id: this.ids.content,
			role: "menu",
			tabindex: -1,
			popover: "manual",
			"data-state": this.open ? "open" : "closed",
			onkeydown: this.#navigation.handleKeydown,
			onpointermove: (e: PointerEvent) => {
				// Track pointer direction for grace intent
				if (e.pointerType !== "mouse") return;
				if (e.clientX !== this.#lastPointerX) {
					this.#pointerDir = e.clientX > this.#lastPointerX ? "right" : "left";
					this.#lastPointerX = e.clientX;
				}
			},
			onpointerenter: () => {
				// Cancel any pending close when entering content
				this.#clearCloseTimeout();
				this.#graceIntent = null;
			},
			onpointerleave: () => {
				// Build grace intent if we have open children
				const hasOpenChild = [...this.#children].some((child) => child.open);
				if (hasOpenChild && this.#contentEl) {
					const area = computeConvexHullFromElements([this.#contentEl]);
					this.#graceIntent = { area, side: "right" };
				}
				this.#scheduleClose();
			},
			[this.#contentAttachmentKey]: this.#contentAttachment,
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	/**
	 * Get the spread attributes for a menu item.
	 */
	getItem(props: ContextMenuItemProps = {}) {
		// Use props object as key for stable index across re-renders
		let index = this.#itemIndexMap.get(props);
		if (index === undefined) {
			index = this.#itemCount++;
			this.#itemIndexMap.set(props, index);
		}
		const itemIndex = index;
		const disabled = extract(props.disabled, false);

		return {
			[dataAttrs.item]: "",
			role: "menuitem",
			tabindex: this.#navigation.getTabIndex(itemIndex),
			"data-highlighted": dataAttr(this.#navigation.highlightedIndex === itemIndex),
			"data-disabled": dataAttr(disabled),
			onclick: (e: MouseEvent) => {
				if (extract(props.disabled, false)) {
					e.preventDefault();
					return;
				}
				props.onSelect?.();
				this.close();
			},
			onpointerenter: () => {
				if (!extract(props.disabled, false)) {
					this.#navigation.highlight(itemIndex, false);
				}
			},
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	/**
	 * The spread attributes for a separator element.
	 */
	get separator() {
		return {
			[dataAttrs.separator]: "",
			role: "separator",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	/**
	 * The spread attributes for a label element.
	 */
	get label() {
		return {
			[dataAttrs.label]: "",
			role: "group",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}
}

/**
 * A submenu within a context menu.
 * Created via `menu.createSub()`.
 */
export class ContextMenuSub {
	#parent: ContextMenu | ContextMenuSub;
	#props: ContextMenuSubProps;
	#open: Synced<boolean>;
	#contentEl: HTMLElement | null = $state(null);
	#triggerEl: HTMLElement | null = $state(null);
	#itemIndexMap = new Map<object, number>();
	#itemCount = 0;
	#children = new Set<ContextMenuSub>();
	#openTimeout: ReturnType<typeof setTimeout> | null = null;
	#closeTimeout: ReturnType<typeof setTimeout> | null = null;

	/* Pointer direction tracking for grace intent */
	#lastPointerX = 0;
	#pointerDir: "left" | "right" = "right";
	#graceIntent: { area: Point[]; side: "left" | "right" } | null = null;

	ids = $state(createIds());

	/* Navigation */
	#navigation: MenuNavigation;

	constructor(parent: ContextMenu | ContextMenuSub, props: ContextMenuSubProps = {}) {
		this.#parent = parent;
		this.#props = props;
		this.#open = new Synced({
			value: props.open,
			onChange: props.onOpenChange,
			defaultValue: false,
		});

		this.#navigation = new MenuNavigation({
			getItems: () => this.#getItems(),
			onHighlight: (_index) => {
				// Highlighting is handled via $derived in getItem
			},
			onSelect: (index) => {
				const items = this.#getItems();
				const el = items[index];
				if (el) el.click();
			},
			onClose: () => this.#closeToParent(),
		});
	}

	#getItems(): HTMLElement[] {
		if (!this.#contentEl) return [];
		return [...this.#contentEl.querySelectorAll(dataSelectors.item)].filter(isHtmlElement);
	}

	#closeToParent() {
		this.open = false;
		// Focus parent's content/trigger
		if (this.#parent instanceof ContextMenuSub) {
			this.#parent.#contentEl?.focus();
		}
	}

	/**
	 * Whether the submenu is open.
	 */
	get open() {
		return this.#open.current;
	}

	set open(value: boolean) {
		this.#open.current = value;
		if (!value) {
			// Close all children when parent closes
			for (const child of this.#children) {
				child.open = false;
			}
			this.#navigation.reset();
			this.#graceIntent = null;
		}
	}

	/**
	 * Close the submenu.
	 */
	close() {
		this.open = false;
	}

	/**
	 * Check if a target is inside this submenu or its children.
	 */
	containsTarget(target: Node): boolean {
		if (this.#contentEl?.contains(target)) return true;
		if (this.#triggerEl?.contains(target)) return true;
		for (const child of this.#children) {
			if (child.containsTarget(target)) return true;
		}
		return false;
	}

	/**
	 * Create a nested submenu.
	 */
	createSub(props: ContextMenuSubProps = {}): ContextMenuSub {
		const sub = new ContextMenuSub(this, props);
		this.#children.add(sub);
		return sub;
	}

	#clearTimeouts() {
		if (this.#openTimeout) {
			clearTimeout(this.#openTimeout);
			this.#openTimeout = null;
		}
		if (this.#closeTimeout) {
			clearTimeout(this.#closeTimeout);
			this.#closeTimeout = null;
		}
	}

	#scheduleOpen() {
		this.#clearTimeouts();
		this.#openTimeout = setTimeout(() => {
			this.open = true;
		}, SUBMENU_OPEN_DELAY);
	}

	#scheduleClose() {
		this.#clearTimeouts();
		this.#closeTimeout = setTimeout(() => {
			// Don't close if pointer is moving toward an open child submenu
			if (this.#isMovingTowardChild()) {
				this.#scheduleClose(); // Reschedule check
				return;
			}
			this.open = false;
		}, SUBMENU_CLOSE_DELAY);
	}

	#isMovingTowardChild(): boolean {
		if (!this.#graceIntent) return false;
		// Check if any child submenu is open and pointer is moving toward it
		for (const child of this.#children) {
			if (child.open) {
				return this.#pointerDir === this.#graceIntent.side;
			}
		}
		return false;
	}

	/* Trigger attachment */
	#triggerAttachmentKey = createAttachmentKey();
	#triggerAttachment: Attachment<HTMLElement> = (node) => {
		this.#triggerEl = node;
		return () => {
			if (this.#triggerEl === node) {
				this.#triggerEl = null;
			}
		};
	};

	/**
	 * The spread attributes for the submenu trigger element.
	 */
	get trigger() {
		return {
			[dataAttrs["sub-trigger"]]: "",
			role: "menuitem",
			"aria-haspopup": "menu",
			"aria-expanded": this.open,
			"data-state": this.open ? "open" : "closed",
			tabindex: -1,
			onpointerenter: () => {
				// Clear any pending close
				this.#clearTimeouts();
				this.#graceIntent = null;
				this.#scheduleOpen();
			},
			onpointerleave: () => {
				// Build grace intent between trigger and content
				if (this.open && this.#triggerEl && this.#contentEl) {
					const area = computeConvexHullFromElements([this.#triggerEl, this.#contentEl]);
					this.#graceIntent = { area, side: "right" };
				}
				this.#scheduleClose();
			},
			onkeydown: (e: KeyboardEvent) => {
				if (e.key === kbd.ARROW_RIGHT) {
					e.preventDefault();
					this.open = true;
					// Focus first item in submenu after opening
					setTimeout(() => {
						this.#navigation.highlightFirst();
						this.#contentEl?.focus();
					});
				}
			},
			onclick: () => {
				this.open = !this.open;
			},
			[this.#triggerAttachmentKey]: this.#triggerAttachment,
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	/* Content attachment */
	#contentAttachmentKey = createAttachmentKey();
	#contentAttachment: Attachment<HTMLElement> = (node) => {
		this.#contentEl = node;

		// Floating UI positioning (relative to trigger)
		$effect(() => {
			if (!this.open || !this.#triggerEl || !this.#contentEl) return;

			useFloating({
				node: () => this.#triggerEl!,
				floating: () => this.#contentEl!,
				config: () => ({
					computePosition: {
						placement: "right-start",
					},
					offset: { mainAxis: -4, crossAxis: 0 },
				}),
			});
		});

		// Show/hide popover
		$effect(() => {
			if (this.open) {
				node.showPopover();
			} else {
				node.hidePopover();
			}
		});

		return () => {
			if (this.#contentEl === node) {
				this.#contentEl = null;
			}
		};
	};

	/**
	 * The spread attributes for the submenu content element.
	 */
	get content() {
		return {
			[dataAttrs["sub-content"]]: "",
			id: this.ids.content,
			role: "menu",
			tabindex: -1,
			popover: "manual",
			"data-state": this.open ? "open" : "closed",
			onkeydown: (e: KeyboardEvent) => {
				// ArrowLeft closes submenu
				if (e.key === kbd.ARROW_LEFT) {
					e.preventDefault();
					this.#closeToParent();
					return;
				}
				this.#navigation.handleKeydown(e);
			},
			onpointermove: (e: PointerEvent) => {
				// Track pointer direction for grace intent
				if (e.pointerType !== "mouse") return;
				if (e.clientX !== this.#lastPointerX) {
					this.#pointerDir = e.clientX > this.#lastPointerX ? "right" : "left";
					this.#lastPointerX = e.clientX;
				}
			},
			onpointerenter: () => {
				// Cancel any pending close when entering content
				this.#clearTimeouts();
				this.#graceIntent = null;
			},
			onpointerleave: () => {
				// Build grace intent if we have open children
				const hasOpenChild = [...this.#children].some((child) => child.open);
				if (hasOpenChild && this.#triggerEl && this.#contentEl) {
					const area = computeConvexHullFromElements([this.#triggerEl, this.#contentEl]);
					this.#graceIntent = { area, side: "right" };
				}
				this.#scheduleClose();
			},
			[this.#contentAttachmentKey]: this.#contentAttachment,
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	/**
	 * Get the spread attributes for a menu item.
	 */
	getItem(props: ContextMenuItemProps = {}) {
		// Use props object as key for stable index across re-renders
		let index = this.#itemIndexMap.get(props);
		if (index === undefined) {
			index = this.#itemCount++;
			this.#itemIndexMap.set(props, index);
		}
		const itemIndex = index;
		const disabled = extract(props.disabled, false);

		return {
			[dataAttrs.item]: "",
			role: "menuitem",
			tabindex: this.#navigation.getTabIndex(itemIndex),
			"data-highlighted": dataAttr(this.#navigation.highlightedIndex === itemIndex),
			"data-disabled": dataAttr(disabled),
			onclick: (e: MouseEvent) => {
				if (extract(props.disabled, false)) {
					e.preventDefault();
					return;
				}
				props.onSelect?.();
				// Close the entire menu tree
				this.#closeRoot();
			},
			onpointerenter: () => {
				if (!extract(props.disabled, false)) {
					this.#navigation.highlight(itemIndex, false);
				}
			},
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	#closeRoot() {
		// Walk up the parent chain to find the root menu
		let current: ContextMenu | ContextMenuSub = this;
		while (current instanceof ContextMenuSub) {
			current = current.#parent;
		}
		current.close();
	}

	/**
	 * The spread attributes for a separator element.
	 */
	get separator() {
		return {
			[dataAttrs.separator]: "",
			role: "separator",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	/**
	 * The spread attributes for a label element.
	 */
	get label() {
		return {
			[dataAttrs.label]: "",
			role: "group",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}
}
