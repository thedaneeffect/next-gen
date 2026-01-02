import { Synced } from "$lib/Synced.svelte";
import type { MaybeGetter } from "$lib/types";
import { extract } from "$lib/utils/extract";
import { createBuilderMetadata } from "$lib/utils/identifiers";
import { useScrollLock } from "$lib/utils/scroll-lock.svelte";
import { on } from "svelte/events";
import { createAttachmentKey, type Attachment } from "svelte/attachments";
import type { HTMLAttributes } from "svelte/elements";

const { dataAttrs, createIds, createReferences } = createBuilderMetadata("alert-dialog", [
	"trigger",
	"content",
	"cancel",
	"action",
	"title",
	"description",
]);

export type AlertDialogProps = {
	/**
	 * Whether the alert dialog is open.
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
	 * Behavior when scrolling while the dialog is open.
	 * - `'prevent'`: Prevents page scroll (default for dialogs)
	 * - `'allow'`: Allows normal page scrolling
	 *
	 * Note: `'close'` is not supported for AlertDialog since it requires explicit action.
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

/**
 * AlertDialog is a modal dialog that interrupts the user with important content
 * and expects a response. Unlike Dialog, it cannot be closed by pressing Escape
 * or clicking outside - the user must explicitly interact with it.
 */
export class AlertDialog {
	/* Props */
	#props!: AlertDialogProps;
	readonly scrollBehavior = $derived(extract(this.#props.scrollBehavior, "prevent" as const));
	readonly forceVisible = $derived(extract(this.#props.forceVisible, false));

	/* State */
	#open: Synced<boolean>;
	ids = $state(createIds());
	refs = createReferences();

	constructor(props: AlertDialogProps = {}) {
		this.#props = props;
		this.#open = new Synced({
			value: props.open,
			onChange: props.onOpenChange,
			defaultValue: false,
		});
	}

	/**
	 * The open state of the alert dialog.
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
			// Always prevent Escape key from closing (alert dialogs require explicit action)
			on(node, "cancel", (e) => {
				e.preventDefault();
			}),

			// Prevent backdrop clicks from closing (alert dialogs require explicit action)
			// No click handler needed since we don't close on outside click

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

	/**
	 * The spread attributes for the alert dialog content element.
	 * Should be used on a `<dialog>` element.
	 */
	get content() {
		return {
			[dataAttrs.content]: "",
			id: this.ids.content,
			role: "alertdialog",
			"aria-modal": true,
			"aria-labelledby": this.ids.title,
			"aria-describedby": this.ids.description,
			"data-state": this.open ? "open" : "closed",
			[this.#contentAttachmentKey]: this.#contentAttachment,
			[this.refs.key]: this.refs.attach("content"),
		} as const satisfies HTMLAttributes<HTMLDialogElement>;
	}

	/**
	 * The spread attributes for the cancel button.
	 * Closes the dialog without taking action.
	 */
	get cancel() {
		return {
			[dataAttrs.cancel]: "",
			"data-state": this.open ? "open" : "closed",
			onclick: () => {
				this.open = false;
			},
		} as const satisfies HTMLAttributes<HTMLButtonElement>;
	}

	/**
	 * The spread attributes for the action button.
	 * Confirms the action and closes the dialog.
	 */
	get action() {
		return {
			[dataAttrs.action]: "",
			"data-state": this.open ? "open" : "closed",
			onclick: () => {
				this.open = false;
			},
		} as const satisfies HTMLAttributes<HTMLButtonElement>;
	}

	/**
	 * The spread attributes for the alert dialog title.
	 * Connected to the dialog via `aria-labelledby`.
	 */
	get title() {
		return {
			[dataAttrs.title]: "",
			id: this.ids.title,
		} as const satisfies HTMLAttributes<HTMLHeadingElement>;
	}

	/**
	 * The spread attributes for the alert dialog description.
	 * Connected to the dialog via `aria-describedby`.
	 */
	get description() {
		return {
			[dataAttrs.description]: "",
			id: this.ids.description,
		} as const satisfies HTMLAttributes<HTMLParagraphElement>;
	}
}
