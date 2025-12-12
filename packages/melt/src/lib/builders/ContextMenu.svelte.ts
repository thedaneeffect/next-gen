import { Synced } from "$lib/Synced.svelte";
import type { MaybeGetter } from "$lib/types";
import { dataAttr } from "$lib/utils/attribute";
import { extract } from "$lib/utils/extract";
import { createBuilderMetadata } from "$lib/utils/identifiers";
import { kbd } from "$lib/utils/keyboard";
import { createVirtualAnchor } from "$lib/utils/menu";
import { computeConvexHullFromElements, type Point } from "$lib/utils/polygon";
import { findScrollableAncestor } from "$lib/utils/scroll";
import { letterRegex } from "$lib/utils/typeahead.svelte";
import { useFloating, type UseFloatingConfig } from "$lib/utils/use-floating.svelte";
import type { VirtualElement } from "@floating-ui/dom";
import { useDebounce } from "runed";
import { tick } from "svelte";
import { createAttachmentKey, type Attachment } from "svelte/attachments";
import type { HTMLAttributes } from "svelte/elements";
import { on } from "svelte/events";

const { dataAttrs, createIds } = createBuilderMetadata("context-menu", [
	"trigger",
	"content",
	"item",
	"separator",
	"label",
	"sub-trigger",
	"sub-content",
]);

// Menu timing constants
const SUBMENU_OPEN_DELAY = 100;
const MENU_CLOSE_DELAY = 300;
const POINTER_MOVE_THRESHOLD = 8;
const MENU_GRACE_AREA = 16;

// Typeahead timeout
const TYPEAHEAD_TIMEOUT = 500;

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
	 * Whether keyboard navigation should loop at boundaries.
	 *
	 * @default true
	 */
	loop?: MaybeGetter<boolean | undefined>;

	/**
	 * Floating UI configuration for positioning.
	 */
	floatingConfig?: UseFloatingConfig;

	/**
	 * Behavior when scrolling while the menu is open.
	 * - `'close'`: Closes the menu when scrolling outside of it (default)
	 * - `'prevent'`: Prevents page scroll when scrolling outside of it
	 * - `'allow'`: Allows normal page scrolling (no intervention)
	 *
	 * Scrolling inside the menu content is always allowed.
	 *
	 * @default 'close'
	 */
	scrollBehavior?: MaybeGetter<"close" | "prevent" | "allow" | undefined>;

	/**
	 * Whether the menu closes when the pointer leaves the content area.
	 * When false (default), the menu stays open until explicitly closed.
	 * The "close on moving away before entering" behavior is unaffected.
	 *
	 * @default false
	 */
	closeOnPointerLeave?: MaybeGetter<boolean | undefined>;
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

// =============================================================================
// ContextMenuItem - Reactive item class for main menu
// =============================================================================

class ContextMenuItem {
	#menu!: ContextMenu;
	#props!: ContextMenuItemProps;
	#el: HTMLElement | null = null;

	disabled = $derived(extract(this.#props.disabled, false));
	highlighted = $derived(this.#menu.highlightedEl === this.#el && this.#el !== null);

	constructor(menu: ContextMenu, props: ContextMenuItemProps) {
		this.#menu = menu;
		this.#props = props;
	}

	// Attachment created once per instance, spread into attrs
	#attachment = {
		[createAttachmentKey()]: (node: HTMLElement) => {
			this.#el = node;
			this.#menu.registerItem(this);
			return () => {
				this.#el = null;
				this.#menu.unregisterItem(this);
			};
		},
	};

	attrs = $derived.by(() => ({
		[dataAttrs.item]: "",
		role: "menuitem" as const,
		tabindex: -1 as const,
		"data-disabled": dataAttr(this.disabled),
		"data-highlighted": dataAttr(this.highlighted),
		...this.#attachment,
		onclick: (e: MouseEvent) => {
			if (this.disabled) {
				e.preventDefault();
				return;
			}
			this.#props.onSelect?.();
			this.#menu.close();
		},
		onpointermove: (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			if (this.disabled) return;
			this.#menu.highlightedEl = this.#el;
		},
	}));

	get el() {
		return this.#el;
	}
}

// =============================================================================
// ContextMenuSubItem - Reactive item class for submenus
// =============================================================================

class ContextMenuSubItem {
	#menu!: ContextMenuSub;
	#props!: ContextMenuItemProps;
	#el: HTMLElement | null = null;

	disabled = $derived(extract(this.#props.disabled, false));
	highlighted = $derived(this.#menu.highlightedEl === this.#el && this.#el !== null);

	constructor(menu: ContextMenuSub, props: ContextMenuItemProps) {
		this.#menu = menu;
		this.#props = props;
	}

	// Attachment created once per instance, spread into attrs
	#attachment = {
		[createAttachmentKey()]: (node: HTMLElement) => {
			this.#el = node;
			this.#menu.registerItem(this);
			return () => {
				this.#el = null;
				this.#menu.unregisterItem(this);
			};
		},
	};

	attrs = $derived.by(() => ({
		[dataAttrs.item]: "",
		role: "menuitem" as const,
		tabindex: -1 as const,
		"data-disabled": dataAttr(this.disabled),
		"data-highlighted": dataAttr(this.highlighted),
		...this.#attachment,
		onclick: (e: MouseEvent) => {
			if (this.disabled) {
				e.preventDefault();
				return;
			}
			this.#props.onSelect?.();
			this.#menu.closeRoot();
		},
		onpointermove: (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			if (this.disabled) return;
			this.#menu.highlightedEl = this.#el;
		},
	}));

	get el() {
		return this.#el;
	}
}

// =============================================================================
// ContextMenuSubTrigger - Reactive trigger class for submenus
// =============================================================================

class ContextMenuSubTrigger {
	#parentMenu!: ContextMenu | ContextMenuSub;
	#subMenu!: ContextMenuSub;
	#el: HTMLElement | null = null;

	highlighted = $derived(this.#parentMenu.highlightedEl === this.#el && this.#el !== null);

	constructor(parentMenu: ContextMenu | ContextMenuSub, subMenu: ContextMenuSub) {
		this.#parentMenu = parentMenu;
		this.#subMenu = subMenu;
	}

	// Attachment created once per instance, spread into attrs
	#attachment = {
		[createAttachmentKey()]: (node: HTMLElement) => {
			this.#el = node;
			this.#subMenu.setTriggerEl(node);
			this.#parentMenu.registerSubTrigger(this);
			return () => {
				this.#el = null;
				this.#subMenu.setTriggerEl(null);
				this.#parentMenu.unregisterSubTrigger(this);
			};
		},
	};

	attrs = $derived.by(() => ({
		id: `${this.#subMenu.ids.content}-trigger`,
		[dataAttrs["sub-trigger"]]: "",
		role: "menuitem" as const,
		"aria-haspopup": "menu" as const,
		"aria-expanded": this.#subMenu.open,
		"data-state": this.#subMenu.open ? ("open" as const) : ("closed" as const),
		"data-highlighted": dataAttr(this.highlighted),
		tabindex: -1 as const,
		...this.#attachment,
		onpointerenter: () => {
			this.#parentMenu.closeAllSubmenus(this.#subMenu);

			this.#subMenu.clearTimeouts();
			if (!this.#subMenu.open) {
				this.#subMenu.clearGraceIntent();
			}
			this.#subMenu.scheduleOpen();
		},
		onpointerleave: () => {
			this.#parentMenu.highlightedEl = null;
			this.#subMenu.buildGraceIntent();
			this.#subMenu.scheduleClose();
		},
		onpointermove: (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			this.#parentMenu.highlightedEl = this.#el;
		},
		onkeydown: (e: KeyboardEvent) => {
			if (e.key === kbd.ARROW_RIGHT) {
				e.preventDefault();
				this.#subMenu.open = true;
				tick().then(() => {
					this.#subMenu.highlightFirst();
					this.#subMenu.focusContent();
				});
			}
		},
		onclick: () => {
			this.#subMenu.open = !this.#subMenu.open;
		},
	}));

	get el() {
		return this.#el;
	}

	get subMenu() {
		return this.#subMenu;
	}
}

// =============================================================================
// ContextMenu - Main context menu class
// =============================================================================

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
 *   {@const cutItem = menu.getItem({ onSelect: () => console.log('cut') })}
 *   <button {...cutItem.attrs}>Cut</button>
 *
 *   {@const copyItem = menu.getItem({ onSelect: () => console.log('copy') })}
 *   <button {...copyItem.attrs}>Copy</button>
 * </div>
 * ```
 */
export class ContextMenu {
	/* Props */
	#props!: ContextMenuProps;
	readonly closeOnEscape = $derived(extract(this.#props.closeOnEscape, true));
	readonly closeOnOutsideClick = $derived(extract(this.#props.closeOnOutsideClick, true));
	readonly loop = $derived(extract(this.#props.loop, true));
	readonly scrollBehavior = $derived(extract(this.#props.scrollBehavior, "close" as const));
	readonly closeOnPointerLeave = $derived(extract(this.#props.closeOnPointerLeave, false));

	/* State */
	#open: Synced<boolean>;
	ids = $state(createIds());
	#virtualAnchor: VirtualElement | null = $state(null);
	#contentEl: HTMLElement | null = $state(null);
	#triggerEl: HTMLElement | null = $state(null);
	#children = new Set<ContextMenuSub>();
	#closeTimeout: ReturnType<typeof setTimeout> | null = null;

	/* Item tracking */
	#items: ContextMenuItem[] = [];
	#subTriggers: ContextMenuSubTrigger[] = [];
	#highlightedEl: HTMLElement | null = $state(null);
	#autoOpenTimeout: ReturnType<typeof setTimeout> | null = null;

	/* Pointer tracking */
	#lastPointerX = 0;
	#pointerDir: "left" | "right" = "right";
	#graceIntent: { area: Point[]; side: "left" | "right" } | null = null;
	#hasEnteredContent = $state(false);
	#pointerMoveAccumulator = 0;

	/* Typeahead */
	#typeaheadValue = $state("");
	#debounceClearTypeahead: ReturnType<typeof useDebounce>;

	constructor(props: ContextMenuProps = {}) {
		this.#props = props;
		this.#open = new Synced({
			value: props.open,
			onChange: props.onOpenChange,
			defaultValue: false,
		});

		this.#debounceClearTypeahead = useDebounce(
			() => {
				this.#typeaheadValue = "";
			},
			() => TYPEAHEAD_TIMEOUT,
		);
	}

	// -------------------------------------------------------------------------
	// Item registration
	// -------------------------------------------------------------------------

	registerItem(item: ContextMenuItem) {
		this.#items.push(item);
	}

	unregisterItem(item: ContextMenuItem) {
		this.#items = this.#items.filter((i) => i !== item);
		if (this.#highlightedEl === item.el) {
			this.#highlightedEl = null;
		}
	}

	registerSubTrigger(trigger: ContextMenuSubTrigger) {
		this.#subTriggers.push(trigger);
	}

	unregisterSubTrigger(trigger: ContextMenuSubTrigger) {
		this.#subTriggers = this.#subTriggers.filter((t) => t !== trigger);
		if (this.#highlightedEl === trigger.el) {
			this.#highlightedEl = null;
		}
	}

	// -------------------------------------------------------------------------
	// Highlighted element (reactive)
	// -------------------------------------------------------------------------

	get highlightedEl() {
		return this.#highlightedEl;
	}

	set highlightedEl(el: HTMLElement | null) {
		this.#highlightedEl = el;
	}

	// -------------------------------------------------------------------------
	// Navigation
	// -------------------------------------------------------------------------

	#getAllNavigableEls(): HTMLElement[] {
		// Get all items and sub-triggers in DOM order
		const allItems = [...this.#items, ...this.#subTriggers];
		return allItems
			.map((item) => item.el)
			.filter((el): el is HTMLElement => el !== null)
			.sort((a, b) => {
				const pos = a.compareDocumentPosition(b);
				if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
				if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
				return 0;
			});
	}

	#getEnabledEls(): HTMLElement[] {
		return this.#getAllNavigableEls().filter((el) => !el.hasAttribute("data-disabled"));
	}

	#clearAutoOpenTimeout() {
		if (this.#autoOpenTimeout) {
			clearTimeout(this.#autoOpenTimeout);
			this.#autoOpenTimeout = null;
		}
	}

	#openSubmenu(subTrigger: ContextMenuSubTrigger) {
		this.#clearAutoOpenTimeout();
		subTrigger.subMenu.open = true;
		tick().then(() => {
			subTrigger.subMenu.highlightFirst();
			subTrigger.subMenu.focusContent();
		});
	}

	#handleHighlightChange(prevEl: HTMLElement | null, newEl: HTMLElement | null) {
		this.#clearAutoOpenTimeout();

		// Close submenu if we navigated away from its trigger
		const prevSubTrigger = this.#subTriggers.find((t) => t.el === prevEl);
		if (prevSubTrigger && prevSubTrigger.subMenu.open) {
			prevSubTrigger.subMenu.open = false;
		}

		// Schedule submenu open if we navigated to its trigger (just show, don't enter)
		const newSubTrigger = this.#subTriggers.find((t) => t.el === newEl);
		if (newSubTrigger) {
			this.#autoOpenTimeout = setTimeout(() => {
				if (this.#highlightedEl === newEl) {
					newSubTrigger.subMenu.open = true;
				}
			}, SUBMENU_OPEN_DELAY);
		}
	}

	highlightFirst() {
		const els = this.#getEnabledEls();
		if (els.length > 0) {
			const prevEl = this.#highlightedEl;
			this.#highlightedEl = els[0]!;
			els[0]!.scrollIntoView({ block: "nearest" });
			this.#handleHighlightChange(prevEl, this.#highlightedEl);
		}
	}

	highlightLast() {
		const els = this.#getEnabledEls();
		if (els.length > 0) {
			const prevEl = this.#highlightedEl;
			this.#highlightedEl = els[els.length - 1]!;
			els[els.length - 1]!.scrollIntoView({ block: "nearest" });
			this.#handleHighlightChange(prevEl, this.#highlightedEl);
		}
	}

	highlightNext() {
		const els = this.#getEnabledEls();
		if (els.length === 0) return;

		const currentIdx = this.#highlightedEl ? els.indexOf(this.#highlightedEl) : -1;

		let nextIdx: number;
		if (currentIdx === -1) {
			nextIdx = 0;
		} else if (currentIdx === els.length - 1) {
			nextIdx = this.loop ? 0 : currentIdx;
		} else {
			nextIdx = currentIdx + 1;
		}

		const prevEl = this.#highlightedEl;
		this.#highlightedEl = els[nextIdx]!;
		els[nextIdx]!.scrollIntoView({ block: "nearest" });
		this.#handleHighlightChange(prevEl, this.#highlightedEl);
	}

	highlightPrev() {
		const els = this.#getEnabledEls();
		if (els.length === 0) return;

		const currentIdx = this.#highlightedEl ? els.indexOf(this.#highlightedEl) : -1;

		let prevIdx: number;
		if (currentIdx === -1) {
			prevIdx = els.length - 1;
		} else if (currentIdx === 0) {
			prevIdx = this.loop ? els.length - 1 : 0;
		} else {
			prevIdx = currentIdx - 1;
		}

		const prevEl = this.#highlightedEl;
		this.#highlightedEl = els[prevIdx]!;
		els[prevIdx]!.scrollIntoView({ block: "nearest" });
		this.#handleHighlightChange(prevEl, this.#highlightedEl);
	}

	#handleTypeahead(char: string) {
		if (!letterRegex.test(char)) return;

		this.#debounceClearTypeahead();
		this.#typeaheadValue += char.toLowerCase();

		const els = this.#getEnabledEls();
		const startIndex = this.#highlightedEl ? els.indexOf(this.#highlightedEl) : -1;

		const itemsWithText = els.map((el, index) => ({
			el,
			index,
			text: el.textContent?.toLowerCase() ?? "",
		}));

		const isStartingTypeahead = this.#typeaheadValue.length === 1;
		const orderedItems = [
			...itemsWithText.slice(isStartingTypeahead ? startIndex + 1 : startIndex),
			...itemsWithText.slice(0, isStartingTypeahead ? startIndex + 1 : startIndex),
		];

		for (const item of orderedItems) {
			if (item.text.startsWith(this.#typeaheadValue)) {
				const prevEl = this.#highlightedEl;
				this.#highlightedEl = item.el;
				item.el.scrollIntoView({ block: "nearest" });
				this.#handleHighlightChange(prevEl, this.#highlightedEl);
				return;
			}
		}
	}

	#handleKeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case kbd.ARROW_DOWN: {
				e.preventDefault();
				this.highlightNext();
				break;
			}
			case kbd.ARROW_UP: {
				e.preventDefault();
				this.highlightPrev();
				break;
			}
			case kbd.HOME: {
				e.preventDefault();
				this.highlightFirst();
				break;
			}
			case kbd.END: {
				e.preventDefault();
				this.highlightLast();
				break;
			}
			case kbd.ARROW_RIGHT: {
				// Check if highlighted element is a sub-trigger
				const subTrigger = this.#subTriggers.find((t) => t.el === this.#highlightedEl);
				if (subTrigger) {
					e.preventDefault();
					this.#openSubmenu(subTrigger);
				}
				break;
			}
			case kbd.ENTER:
			case kbd.SPACE: {
				e.preventDefault();
				if (this.#highlightedEl && !this.#highlightedEl.hasAttribute("data-disabled")) {
					// Check if it's a submenu trigger
					const subTrigger = this.#subTriggers.find((t) => t.el === this.#highlightedEl);
					if (subTrigger) {
						this.#openSubmenu(subTrigger);
					} else {
						this.#highlightedEl.click();
					}
				}
				break;
			}
			case kbd.ESCAPE:
			case kbd.TAB: {
				this.close();
				break;
			}
			default: {
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					e.preventDefault();
					this.#handleTypeahead(e.key);
				}
			}
		}
	};

	// -------------------------------------------------------------------------
	// Open state
	// -------------------------------------------------------------------------

	get open() {
		return this.#open.current;
	}

	set open(value: boolean) {
		this.#open.current = value;
		if (!value) {
			for (const child of this.#children) {
				child.open = false;
			}
			this.#highlightedEl = null;
			this.#graceIntent = null;
			this.#virtualAnchor = null;
			this.#clearCloseTimeout();
			this.#clearAutoOpenTimeout();
			this.#typeaheadValue = "";
			this.#hasEnteredContent = false;
			this.#pointerMoveAccumulator = 0;
			if (this.#contentEl) {
				this.#contentEl.scrollTop = 0;
			}
		}
	}

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
			if (this.#isMovingTowardChild()) {
				this.#scheduleClose();
				return;
			}
			this.close();
		}, MENU_CLOSE_DELAY);
	}

	#isMovingTowardChild(): boolean {
		if (!this.#graceIntent) return false;
		for (const child of this.#children) {
			if (child.open) {
				return this.#pointerDir === this.#graceIntent.side;
			}
		}
		return false;
	}

	// -------------------------------------------------------------------------
	// Submenus
	// -------------------------------------------------------------------------

	createSub(props: ContextMenuSubProps = {}): ContextMenuSub {
		const sub = new ContextMenuSub(this, props);
		this.#children.add(sub);
		return sub;
	}

	closeAllSubmenus(except?: ContextMenuSub) {
		for (const child of this.#children) {
			if (child.open && child !== except) {
				child.open = false;
			}
		}
	}

	// -------------------------------------------------------------------------
	// Trigger
	// -------------------------------------------------------------------------

	#triggerAttachmentKey = createAttachmentKey();
	#triggerAttachment: Attachment<HTMLElement> = (node) => {
		this.#triggerEl = node;
		return () => {
			if (this.#triggerEl === node) {
				this.#triggerEl = null;
			}
		};
	};

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

	// -------------------------------------------------------------------------
	// Content
	// -------------------------------------------------------------------------

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
				node.focus();
			} else {
				node.hidePopover();
			}
		});

		// Set data-scrollable attribute when content is scrollable
		$effect(() => {
			if (!this.open) return;

			// Use requestAnimationFrame to ensure layout is complete
			requestAnimationFrame(() => {
				const isScrollable = node.scrollHeight > node.clientHeight;
				if (isScrollable) {
					node.setAttribute("data-scrollable", "");
				} else {
					node.removeAttribute("data-scrollable");
				}
			});
		});

		// Update aria-activedescendant when highlighted element changes
		$effect(() => {
			const highlightedId = this.#highlightedEl?.id;
			if (highlightedId) {
				node.setAttribute("aria-activedescendant", highlightedId);
			} else {
				node.removeAttribute("aria-activedescendant");
			}
		});

		// Close menu if pointer moves away before entering content
		$effect(() => {
			if (!this.open || this.#hasEnteredContent) return;

			const handler = (e: PointerEvent) => {
				if (e.pointerType !== "mouse") return;

				const deltaX = e.clientX - this.#lastPointerX;
				this.#pointerMoveAccumulator += Math.abs(deltaX);

				// Update direction
				if (deltaX !== 0) {
					this.#pointerDir = deltaX > 0 ? "right" : "left";
				}
				this.#lastPointerX = e.clientX;

				// Only check after threshold movement
				if (this.#pointerMoveAccumulator < POINTER_MOVE_THRESHOLD) return;
				this.#pointerMoveAccumulator = 0;

				if (!this.#contentEl) return;
				const rect = this.#contentEl.getBoundingClientRect();

				// Check if outside grace area AND moving away
				const outsideLeft = e.clientX < rect.left - MENU_GRACE_AREA;
				const outsideRight = e.clientX > rect.right + MENU_GRACE_AREA;

				// Don't close if a submenu is open - let grace intent handle it
				const hasOpenChild = [...this.#children].some((child) => child.open);
				if (hasOpenChild) return;

				if (
					(outsideLeft && this.#pointerDir === "left") ||
					(outsideRight && this.#pointerDir === "right")
				) {
					this.#scheduleClose();
				}
			};

			document.addEventListener("pointermove", handler);
			return () => document.removeEventListener("pointermove", handler);
		});

		// Handle scroll behavior when menu is open
		$effect(() => {
			if (!this.open || this.scrollBehavior === "allow") return;

			const handleWheel = (e: WheelEvent) => {
				const target = e.target as HTMLElement;

				console.log(performance.now());
				// nuance:
				// The target of a wheel event doesn't change until the mouse moves,
				// so it's possible to wheel and scroll a container and the component
				// underneath the cursor to visually change, but the component under
				// the cursor will not match the target until the mouse moves again.

				// Find which menu content (main or submenu) contains the target
				const menuContent = this.#contentEl?.contains(target)
					? this.#contentEl
					: this.#findSubmenuContent(target);

				if (!menuContent) {
					// Outside all menus
					if (this.scrollBehavior === "close") {
						this.close();
					} else {
						e.preventDefault();
					}
					return;
				}

				// Inside a menu - check if scrollable
				const scrollableEl = findScrollableAncestor(target, menuContent);

				if (!scrollableEl) {
					// Can't scroll - prevent page scroll
					e.preventDefault();
				} else {
					// Can scroll - close submenus of the scrolled menu
					if (menuContent === this.#contentEl) {
						for (const child of this.#children) {
							if (child.open) child.open = false;
						}
					} else {
						const scrolledSubmenu = this.#findSubmenuByContent(target);
						if (scrolledSubmenu) scrolledSubmenu.closeChildren();
					}

					// Update highlight for element under cursor after scroll completes
					requestAnimationFrame(() => {
						const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
						if (elementUnderCursor) {
							elementUnderCursor.dispatchEvent(
								new PointerEvent("pointermove", {
									clientX: e.clientX,
									clientY: e.clientY,
									bubbles: true,
									pointerType: "mouse",
								}),
							);
						}
					});
				}
			};

			const handleTouchMove = (e: TouchEvent) => {
				const target = e.target as HTMLElement;

				const menuContent = this.#contentEl?.contains(target)
					? this.#contentEl
					: this.#findSubmenuContent(target);

				if (!menuContent) {
					// Outside all menus
					if (this.scrollBehavior === "close") {
						this.close();
					} else {
						e.preventDefault();
					}
					return;
				}

				// Inside a menu - check if scrollable at all
				const scrollableEl = findScrollableAncestor(target, menuContent);

				if (!scrollableEl) {
					e.preventDefault();
				}
				// else: let native touch scrolling work (no submenu closing for touch)
			};

			document.addEventListener("wheel", handleWheel, { passive: false });
			document.addEventListener("touchmove", handleTouchMove, { passive: false });

			return () => {
				document.removeEventListener("wheel", handleWheel);
				document.removeEventListener("touchmove", handleTouchMove);
			};
		});

		// Event listeners
		const offs = [
			on(document, "keydown", (e) => {
				if (!this.open || !this.closeOnEscape) return;
				if (e.key === kbd.ESCAPE) {
					e.preventDefault();
					this.close();
				}
			}),
			on(document, "pointerdown", (e) => {
				if (!this.open || !this.closeOnOutsideClick) return;
				const target = e.target as Node;
				if (!this.#contentEl?.contains(target) && !this.#isInsideSubmenu(target)) {
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

	#findSubmenuContent(target: Node): HTMLElement | null {
		for (const child of this.#children) {
			const el = child.findContentContaining(target);
			if (el) return el;
		}
		return null;
	}

	#findSubmenuByContent(target: Node): ContextMenuSub | null {
		for (const child of this.#children) {
			const sub = child.findSubmenuContaining(target);
			if (sub) return sub;
		}
		return null;
	}

	get content() {
		return {
			[dataAttrs.content]: "",
			id: this.ids.content,
			role: "menu",
			tabindex: 0,
			popover: "manual",
			style: "overscroll-behavior: contain",
			"data-state": this.open ? "open" : "closed",
			onkeydown: this.#handleKeydown,
			onpointermove: (e: PointerEvent) => {
				if (e.pointerType !== "mouse") return;
				if (e.clientX !== this.#lastPointerX) {
					this.#pointerDir = e.clientX > this.#lastPointerX ? "right" : "left";
					this.#lastPointerX = e.clientX;
				}
			},
			onpointerenter: () => {
				this.#hasEnteredContent = true;
				this.#clearCloseTimeout();
				this.#graceIntent = null;
				this.#contentEl?.focus();
			},
			onpointerleave: () => {
				this.#highlightedEl = null;
				if (!this.closeOnPointerLeave) return;
				const openChild = [...this.#children].find((child) => child.open);
				if (openChild && this.#contentEl) {
					const area = computeConvexHullFromElements([this.#contentEl]);
					const side = openChild.contentSide;
					this.#graceIntent = { area, side };
				}
				this.#scheduleClose();
			},
			[this.#contentAttachmentKey]: this.#contentAttachment,
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	// -------------------------------------------------------------------------
	// Items
	// -------------------------------------------------------------------------

	getItem(props: ContextMenuItemProps = {}): ContextMenuItem {
		return new ContextMenuItem(this, props);
	}

	get separator() {
		return {
			[dataAttrs.separator]: "",
			role: "separator",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	get label() {
		return {
			[dataAttrs.label]: "",
			role: "group",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}
}

// =============================================================================
// ContextMenuSub - Submenu class
// =============================================================================

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
	#children = new Set<ContextMenuSub>();
	#openTimeout: ReturnType<typeof setTimeout> | null = null;
	#closeTimeout: ReturnType<typeof setTimeout> | null = null;

	/* Item tracking */
	#items: ContextMenuSubItem[] = [];
	#subTriggers: ContextMenuSubTrigger[] = [];
	#highlightedEl: HTMLElement | null = $state(null);
	#autoOpenTimeout: ReturnType<typeof setTimeout> | null = null;

	/* Pointer direction tracking for grace intent */
	#lastPointerX = 0;
	#pointerDir: "left" | "right" = "right";
	#graceIntent: { area: Point[]; side: "left" | "right" } | null = null;

	/* Typeahead */
	#typeaheadValue = $state("");
	#debounceClearTypeahead: ReturnType<typeof useDebounce>;

	ids = $state(createIds());

	constructor(parent: ContextMenu | ContextMenuSub, props: ContextMenuSubProps = {}) {
		this.#parent = parent;
		this.#props = props;
		this.#open = new Synced({
			value: props.open,
			onChange: props.onOpenChange,
			defaultValue: false,
		});

		this.#debounceClearTypeahead = useDebounce(
			() => {
				this.#typeaheadValue = "";
			},
			() => TYPEAHEAD_TIMEOUT,
		);
	}

	// -------------------------------------------------------------------------
	// Item registration
	// -------------------------------------------------------------------------

	registerItem(item: ContextMenuSubItem) {
		this.#items.push(item);
	}

	unregisterItem(item: ContextMenuSubItem) {
		this.#items = this.#items.filter((i) => i !== item);
		if (this.#highlightedEl === item.el) {
			this.#highlightedEl = null;
		}
	}

	registerSubTrigger(trigger: ContextMenuSubTrigger) {
		this.#subTriggers.push(trigger);
	}

	unregisterSubTrigger(trigger: ContextMenuSubTrigger) {
		this.#subTriggers = this.#subTriggers.filter((t) => t !== trigger);
		if (this.#highlightedEl === trigger.el) {
			this.#highlightedEl = null;
		}
	}

	// -------------------------------------------------------------------------
	// Highlighted element (reactive)
	// -------------------------------------------------------------------------

	get highlightedEl() {
		return this.#highlightedEl;
	}

	set highlightedEl(el: HTMLElement | null) {
		this.#highlightedEl = el;
	}

	// -------------------------------------------------------------------------
	// Navigation
	// -------------------------------------------------------------------------

	#getAllNavigableEls(): HTMLElement[] {
		const allItems = [...this.#items, ...this.#subTriggers];
		return allItems
			.map((item) => item.el)
			.filter((el): el is HTMLElement => el !== null)
			.sort((a, b) => {
				const pos = a.compareDocumentPosition(b);
				if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
				if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
				return 0;
			});
	}

	#getEnabledEls(): HTMLElement[] {
		return this.#getAllNavigableEls().filter((el) => !el.hasAttribute("data-disabled"));
	}

	#clearAutoOpenTimeout() {
		if (this.#autoOpenTimeout) {
			clearTimeout(this.#autoOpenTimeout);
			this.#autoOpenTimeout = null;
		}
	}

	#openSubmenu(subTrigger: ContextMenuSubTrigger) {
		this.#clearAutoOpenTimeout();
		subTrigger.subMenu.open = true;
		tick().then(() => {
			subTrigger.subMenu.highlightFirst();
			subTrigger.subMenu.focusContent();
		});
	}

	#handleHighlightChange(prevEl: HTMLElement | null, newEl: HTMLElement | null) {
		this.#clearAutoOpenTimeout();

		// Close submenu if we navigated away from its trigger
		const prevSubTrigger = this.#subTriggers.find((t) => t.el === prevEl);
		if (prevSubTrigger && prevSubTrigger.subMenu.open) {
			prevSubTrigger.subMenu.open = false;
		}

		// Schedule submenu open if we navigated to its trigger (just show, don't enter)
		const newSubTrigger = this.#subTriggers.find((t) => t.el === newEl);
		if (newSubTrigger) {
			this.#autoOpenTimeout = setTimeout(() => {
				if (this.#highlightedEl === newEl) {
					newSubTrigger.subMenu.open = true;
				}
			}, SUBMENU_OPEN_DELAY);
		}
	}

	highlightFirst() {
		const els = this.#getEnabledEls();
		if (els.length > 0) {
			const prevEl = this.#highlightedEl;
			this.#highlightedEl = els[0]!;
			els[0]!.scrollIntoView({ block: "nearest" });
			this.#handleHighlightChange(prevEl, this.#highlightedEl);
		}
	}

	highlightLast() {
		const els = this.#getEnabledEls();
		if (els.length > 0) {
			const prevEl = this.#highlightedEl;
			this.#highlightedEl = els[els.length - 1]!;
			els[els.length - 1]!.scrollIntoView({ block: "nearest" });
			this.#handleHighlightChange(prevEl, this.#highlightedEl);
		}
	}

	highlightNext() {
		const els = this.#getEnabledEls();
		if (els.length === 0) return;

		const currentIdx = this.#highlightedEl ? els.indexOf(this.#highlightedEl) : -1;
		const loop = this.#parent instanceof ContextMenu ? this.#parent.loop : true;

		let nextIdx: number;
		if (currentIdx === -1) {
			nextIdx = 0;
		} else if (currentIdx === els.length - 1) {
			nextIdx = loop ? 0 : currentIdx;
		} else {
			nextIdx = currentIdx + 1;
		}

		const prevEl = this.#highlightedEl;
		this.#highlightedEl = els[nextIdx]!;
		els[nextIdx]!.scrollIntoView({ block: "nearest" });
		this.#handleHighlightChange(prevEl, this.#highlightedEl);
	}

	highlightPrev() {
		const els = this.#getEnabledEls();
		if (els.length === 0) return;

		const currentIdx = this.#highlightedEl ? els.indexOf(this.#highlightedEl) : -1;
		const loop = this.#parent instanceof ContextMenu ? this.#parent.loop : true;

		let prevIdx: number;
		if (currentIdx === -1) {
			prevIdx = els.length - 1;
		} else if (currentIdx === 0) {
			prevIdx = loop ? els.length - 1 : 0;
		} else {
			prevIdx = currentIdx - 1;
		}

		const prevEl = this.#highlightedEl;
		this.#highlightedEl = els[prevIdx]!;
		els[prevIdx]!.scrollIntoView({ block: "nearest" });
		this.#handleHighlightChange(prevEl, this.#highlightedEl);
	}

	#handleTypeahead(char: string) {
		if (!letterRegex.test(char)) return;

		this.#debounceClearTypeahead();
		this.#typeaheadValue += char.toLowerCase();

		const els = this.#getEnabledEls();
		const startIndex = this.#highlightedEl ? els.indexOf(this.#highlightedEl) : -1;

		const itemsWithText = els.map((el, index) => ({
			el,
			index,
			text: el.textContent?.toLowerCase() ?? "",
		}));

		const isStartingTypeahead = this.#typeaheadValue.length === 1;
		const orderedItems = [
			...itemsWithText.slice(isStartingTypeahead ? startIndex + 1 : startIndex),
			...itemsWithText.slice(0, isStartingTypeahead ? startIndex + 1 : startIndex),
		];

		for (const item of orderedItems) {
			if (item.text.startsWith(this.#typeaheadValue)) {
				const prevEl = this.#highlightedEl;
				this.#highlightedEl = item.el;
				item.el.scrollIntoView({ block: "nearest" });
				this.#handleHighlightChange(prevEl, this.#highlightedEl);
				return;
			}
		}
	}

	#handleKeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case kbd.ARROW_DOWN: {
				e.preventDefault();
				this.highlightNext();
				break;
			}
			case kbd.ARROW_UP: {
				e.preventDefault();
				this.highlightPrev();
				break;
			}
			case kbd.HOME: {
				e.preventDefault();
				this.highlightFirst();
				break;
			}
			case kbd.END: {
				e.preventDefault();
				this.highlightLast();
				break;
			}
			case kbd.ARROW_LEFT: {
				e.preventDefault();
				this.#closeToParent();
				break;
			}
			case kbd.ARROW_RIGHT: {
				const subTrigger = this.#subTriggers.find((t) => t.el === this.#highlightedEl);
				if (subTrigger) {
					e.preventDefault();
					this.#openSubmenu(subTrigger);
				}
				break;
			}
			case kbd.ENTER:
			case kbd.SPACE: {
				e.preventDefault();
				if (this.#highlightedEl && !this.#highlightedEl.hasAttribute("data-disabled")) {
					// Check if it's a submenu trigger
					const subTrigger = this.#subTriggers.find((t) => t.el === this.#highlightedEl);
					if (subTrigger) {
						this.#openSubmenu(subTrigger);
					} else {
						this.#highlightedEl.click();
					}
				}
				break;
			}
			case kbd.ESCAPE:
			case kbd.TAB: {
				this.closeRoot();
				break;
			}
			default: {
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					e.preventDefault();
					this.#handleTypeahead(e.key);
				}
			}
		}
	};

	// -------------------------------------------------------------------------
	// Open state
	// -------------------------------------------------------------------------

	get open() {
		return this.#open.current;
	}

	set open(value: boolean) {
		this.#open.current = value;
		if (!value) {
			for (const child of this.#children) {
				child.open = false;
			}
			this.#highlightedEl = null;
			this.#graceIntent = null;
			this.#clearAutoOpenTimeout();
			this.#typeaheadValue = "";
			if (this.#contentEl) {
				this.#contentEl.scrollTop = 0;
			}
		}
	}

	close() {
		this.open = false;
	}

	#closeToParent() {
		this.open = false;
		if (this.#parent instanceof ContextMenuSub) {
			this.#parent.focusContent();
		} else {
			// Focus parent's content
			const parentContent = document.getElementById(this.#parent.ids.content);
			parentContent?.focus();
		}
	}

	closeRoot() {
		this.#getRootMenu().close();
	}

	#getRootMenu(): ContextMenu {
		let current: ContextMenu | ContextMenuSub = this.#parent;
		while (current instanceof ContextMenuSub) {
			current = current.#parent;
		}
		return current;
	}

	focusContent() {
		this.#contentEl?.focus();
	}

	containsTarget(target: Node): boolean {
		if (this.#contentEl?.contains(target)) return true;
		if (this.#triggerEl?.contains(target)) return true;
		for (const child of this.#children) {
			if (child.containsTarget(target)) return true;
		}
		return false;
	}

	findContentContaining(target: Node): HTMLElement | null {
		if (this.#contentEl?.contains(target)) return this.#contentEl;
		for (const child of this.#children) {
			const el = child.findContentContaining(target);
			if (el) return el;
		}
		return null;
	}

	findSubmenuContaining(target: Node): ContextMenuSub | null {
		if (this.#contentEl?.contains(target)) return this;
		for (const child of this.#children) {
			const sub = child.findSubmenuContaining(target);
			if (sub) return sub;
		}
		return null;
	}

	closeChildren() {
		for (const child of this.#children) {
			if (child.open) {
				child.open = false;
			}
		}
	}

	// -------------------------------------------------------------------------
	// Timeout management (exposed for ContextMenuSubTrigger)
	// -------------------------------------------------------------------------

	clearTimeouts() {
		if (this.#openTimeout) {
			clearTimeout(this.#openTimeout);
			this.#openTimeout = null;
		}
		if (this.#closeTimeout) {
			clearTimeout(this.#closeTimeout);
			this.#closeTimeout = null;
		}
	}

	scheduleOpen() {
		this.clearTimeouts();
		this.#openTimeout = setTimeout(() => {
			this.open = true;
		}, SUBMENU_OPEN_DELAY);
	}

	scheduleClose() {
		this.clearTimeouts();
		this.#closeTimeout = setTimeout(() => {
			if (this.#isMovingTowardChild()) {
				this.scheduleClose();
				return;
			}
			this.open = false;
		}, MENU_CLOSE_DELAY);
	}

	#isMovingTowardChild(): boolean {
		if (!this.#graceIntent) return false;
		for (const child of this.#children) {
			if (child.open) {
				return this.#pointerDir === this.#graceIntent.side;
			}
		}
		return false;
	}

	clearGraceIntent() {
		this.#graceIntent = null;
	}

	buildGraceIntent() {
		if (this.open && this.#triggerEl && this.#contentEl) {
			const area = computeConvexHullFromElements([this.#triggerEl, this.#contentEl]);
			const side = this.contentSide;
			this.#graceIntent = { area, side };
		}
	}

	// -------------------------------------------------------------------------
	// Trigger element management
	// -------------------------------------------------------------------------

	setTriggerEl(el: HTMLElement | null) {
		this.#triggerEl = el;
	}

	get contentSide(): "left" | "right" {
		const side = this.#contentEl?.dataset.side;
		return side === "left" ? "left" : "right";
	}

	// -------------------------------------------------------------------------
	// Submenus
	// -------------------------------------------------------------------------

	createSub(props: ContextMenuSubProps = {}): ContextMenuSub {
		const sub = new ContextMenuSub(this, props);
		this.#children.add(sub);
		return sub;
	}

	closeAllSubmenus(except?: ContextMenuSub) {
		for (const child of this.#children) {
			if (child.open && child !== except) {
				child.open = false;
			}
		}
	}

	// -------------------------------------------------------------------------
	// Trigger (returns class instance)
	// -------------------------------------------------------------------------

	get trigger(): ContextMenuSubTrigger {
		return new ContextMenuSubTrigger(this.#parent, this);
	}

	// -------------------------------------------------------------------------
	// Content
	// -------------------------------------------------------------------------

	#contentAttachmentKey = createAttachmentKey();
	#contentAttachment: Attachment<HTMLElement> = (node) => {
		this.#contentEl = node;

		// Floating UI positioning
		$effect(() => {
			if (!this.open || !this.#triggerEl || !this.#contentEl) return;

			// Read offset from CSS custom properties (expects px values)
			const style = getComputedStyle(this.#contentEl);
			const offsetX = parseFloat(style.getPropertyValue("--submenu-offset-x")) || 0;
			const offsetY = parseFloat(style.getPropertyValue("--submenu-offset-y")) || 0;

			useFloating({
				node: () => this.#triggerEl!,
				floating: () => this.#contentEl!,
				config: () => ({
					computePosition: {
						placement: "right-start",
					},
					offset: { mainAxis: offsetX, crossAxis: offsetY },
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

		// Set data-scrollable attribute when content is scrollable
		$effect(() => {
			if (!this.open) return;

			// Use requestAnimationFrame to ensure layout is complete
			requestAnimationFrame(() => {
				const isScrollable = node.scrollHeight > node.clientHeight;
				if (isScrollable) {
					node.setAttribute("data-scrollable", "");
				} else {
					node.removeAttribute("data-scrollable");
				}
			});
		});

		// Update aria-activedescendant
		$effect(() => {
			const highlightedId = this.#highlightedEl?.id;
			if (highlightedId) {
				node.setAttribute("aria-activedescendant", highlightedId);
			} else {
				node.removeAttribute("aria-activedescendant");
			}
		});

		return () => {
			if (this.#contentEl === node) {
				this.#contentEl = null;
			}
		};
	};

	get content() {
		return {
			[dataAttrs["sub-content"]]: "",
			id: this.ids.content,
			role: "menu",
			tabindex: 0,
			popover: "manual",
			style: "overscroll-behavior: contain",
			"data-state": this.open ? "open" : "closed",
			onkeydown: this.#handleKeydown,
			onpointermove: (e: PointerEvent) => {
				if (e.pointerType !== "mouse") return;
				if (e.clientX !== this.#lastPointerX) {
					this.#pointerDir = e.clientX > this.#lastPointerX ? "right" : "left";
					this.#lastPointerX = e.clientX;
				}
			},
			onpointerenter: () => {
				this.clearTimeouts();
				this.#graceIntent = null;
				this.#contentEl?.focus();
			},
			onpointerleave: () => {
				this.#highlightedEl = null;
				if (!this.#getRootMenu().closeOnPointerLeave) return;
				const openChild = [...this.#children].find((child) => child.open);
				if (openChild && this.#triggerEl && this.#contentEl) {
					const area = computeConvexHullFromElements([this.#triggerEl, this.#contentEl]);
					const side = openChild.contentSide;
					this.#graceIntent = { area, side };
				}
				this.scheduleClose();
			},
			[this.#contentAttachmentKey]: this.#contentAttachment,
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	// -------------------------------------------------------------------------
	// Items
	// -------------------------------------------------------------------------

	getItem(props: ContextMenuItemProps = {}): ContextMenuSubItem {
		return new ContextMenuSubItem(this, props);
	}

	get separator() {
		return {
			[dataAttrs.separator]: "",
			role: "separator",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}

	get label() {
		return {
			[dataAttrs.label]: "",
			role: "group",
		} as const satisfies HTMLAttributes<HTMLElement>;
	}
}
