import { Synced } from "$lib/Synced.svelte";
import type { MaybeGetter } from "$lib/types";
import { dataAttr } from "$lib/utils/attribute";
import { extract } from "$lib/utils/extract";
import { createBuilderMetadata } from "$lib/utils/identifiers";
import { useScrollLock } from "$lib/utils/scroll-lock.svelte";
import { on } from "svelte/events";
import { createAttachmentKey, type Attachment } from "svelte/attachments";
import type { HTMLAttributes } from "svelte/elements";

const { dataAttrs, createIds, createReferences } = createBuilderMetadata("dialog", [
	"trigger",
	"content",
	"close",
	"title",
	"description",
]);

export type DialogProps = {
	/**
	 * Whether the dialog is open.
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
	 * Whether pressing the Escape key closes the dialog.
	 *
	 * @default true
	 */
	closeOnEscape?: MaybeGetter<boolean | undefined>;

	/**
	 * Whether clicking the backdrop closes the dialog.
	 *
	 * @default true
	 */
	closeOnOutsideClick?: MaybeGetter<boolean | undefined>;

	/**
	 * Behavior when scrolling while the dialog is open.
	 * - `'prevent'`: Prevents page scroll (default for dialogs)
	 * - `'allow'`: Allows normal page scrolling
	 *
	 * Note: `'close'` is not supported for Dialog since dialogs are modal.
	 *
	 * @default 'prevent'
	 */
	scrollBehavior?: MaybeGetter<"prevent" | "allow" | undefined>;

	/**
	 * Keep the dialog visible for exit animations.
	 * When true, the dialog remains in the DOM until CSS transitions complete.
	 *
	 * @default false
	 */
	forceVisible?: MaybeGetter<boolean | undefined>;
};

export class Dialog {
	/* Props */
	#props!: DialogProps;
	readonly closeOnEscape = $derived(extract(this.#props.closeOnEscape, true));
	readonly closeOnOutsideClick = $derived(extract(this.#props.closeOnOutsideClick, true));
	readonly scrollBehavior = $derived(extract(this.#props.scrollBehavior, "prevent" as const));
	readonly forceVisible = $derived(extract(this.#props.forceVisible, false));

	/* State */
	#open: Synced<boolean>;
	ids = $state(createIds());
	refs = createReferences();

	constructor(props: DialogProps = {}) {
		this.#props = props;
		this.#open = new Synced({
			value: props.open,
			onChange: props.onOpenChange,
			defaultValue: false,
		});
	}

	/**
	 * The open state of the dialog.
	 */
	get open() {
		return this.#open.current;
	}

	set open(value: boolean) {
		this.#open.current = value;
	}

	/**
	 * The spread attributes for the trigger button.
	 */
	get trigger() {
		return {
			[dataAttrs.trigger]: "",
			"aria-haspopup": "dialog",
			"aria-expanded": this.open,
			"aria-controls": this.ids.content,
			"data-state": this.open ? "open" : "closed",
			onclick: () => {
				this.open = true;
			},
			[this.refs.key]: this.refs.attach("trigger"),
		} as const satisfies HTMLAttributes<HTMLButtonElement>;
	}

	/* Content attachment */
	#contentAttachmentKey = createAttachmentKey();
	#contentAttachment: Attachment<HTMLDialogElement> = (node) => {
		// Show/hide dialog based on open state
		$effect(() => {
			if (this.open) {
				if (!node.open) {
					node.showModal();
				}
			} else if (!this.forceVisible) {
				if (node.open) {
					node.close();
				}
			}
		});

		// Prevent body scroll when open
		useScrollLock(this.open && this.scrollBehavior === "prevent");

		// Focus management - return focus to trigger on close
		$effect(() => {
			if (this.open) return;

			// Dialog just closed, return focus to trigger
			this.refs.get("trigger")?.focus();
		});

		// Event listeners
		const offs = [
			// Handle native cancel event (Escape key)
			on(node, "cancel", (e) => {
				e.preventDefault(); // Always prevent native close behavior
				if (this.closeOnEscape) {
					this.open = false;
				}
			}),

			// Handle backdrop click (click on the dialog element itself, not its children)
			on(node, "click", (e) => {
				if (e.target === node && this.closeOnOutsideClick) {
					this.open = false;
				}
			}),

			// Handle close event (fired when dialog is closed via close() or form submission)
			on(node, "close", () => {
				if (this.open) {
					this.open = false;
				}
			}),
		];

		return () => {
			offs.forEach((off) => off());
		};
	};

	get content() {
		return {
			[dataAttrs.content]: "",
			id: this.ids.content,
			role: "dialog",
			"aria-modal": true,
			"aria-labelledby": this.ids.title,
			"aria-describedby": this.ids.description,
			"data-state": this.open ? "open" : "closed",
			[this.#contentAttachmentKey]: this.#contentAttachment,
			[this.refs.key]: this.refs.attach("content"),
		} as const satisfies HTMLAttributes<HTMLDialogElement>;
	}

	/**
	 * The spread attributes for the close button.
	 */
	get close() {
		return {
			[dataAttrs.close]: "",
			"data-state": this.open ? "open" : "closed",
			onclick: () => {
				this.open = false;
			},
		} as const satisfies HTMLAttributes<HTMLButtonElement>;
	}

	/**
	 * The spread attributes for the dialog title.
	 * Connected to the dialog via `aria-labelledby`.
	 */
	get title() {
		return {
			[dataAttrs.title]: "",
			id: this.ids.title,
		} as const satisfies HTMLAttributes<HTMLHeadingElement>;
	}

	/**
	 * The spread attributes for the dialog description.
	 * Connected to the dialog via `aria-describedby`.
	 */
	get description() {
		return {
			[dataAttrs.description]: "",
			id: this.ids.description,
		} as const satisfies HTMLAttributes<HTMLParagraphElement>;
	}
}
