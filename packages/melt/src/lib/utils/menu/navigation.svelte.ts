import { kbd } from "$lib/utils/keyboard";
import { isHtmlElement } from "$lib/utils/is";
import { letterRegex } from "$lib/utils/typeahead.svelte";
import { useDebounce } from "runed";

export type MenuNavigationOptions = {
	/**
	 * Returns the menu items in DOM order.
	 */
	getItems: () => HTMLElement[];

	/**
	 * Called when an item should be highlighted.
	 */
	onHighlight: (index: number) => void;

	/**
	 * Called when an item is selected (Enter/Space).
	 */
	onSelect: (index: number) => void;

	/**
	 * Called when the menu should close (Escape/Tab).
	 */
	onClose?: () => void;

	/**
	 * Whether navigation should loop at boundaries.
	 * @default true
	 */
	loop?: boolean;

	/**
	 * Typeahead timeout in ms.
	 * @default 500
	 */
	typeaheadTimeout?: number;
};

/**
 * Handles keyboard navigation for menu-like components.
 * Manages roving tabindex, typeahead, and arrow key navigation.
 */
export class MenuNavigation {
	#options: MenuNavigationOptions;
	#typeaheadValue = $state("");
	#debounceClearTypeahead: ReturnType<typeof useDebounce>;

	highlightedIndex = $state(-1);

	constructor(options: MenuNavigationOptions) {
		this.#options = options;
		this.#debounceClearTypeahead = useDebounce(
			() => {
				this.#typeaheadValue = "";
			},
			() => options.typeaheadTimeout ?? 500,
		);
	}

	get loop() {
		return this.#options.loop ?? true;
	}

	/**
	 * Returns the tabindex for an item at the given index.
	 * Only the highlighted item (or first item if none highlighted) should have tabindex 0.
	 */
	getTabIndex(index: number): 0 | -1 {
		if (this.highlightedIndex === -1) {
			return index === 0 ? 0 : -1;
		}
		return this.highlightedIndex === index ? 0 : -1;
	}

	/**
	 * Highlight a specific index and optionally scroll it into view.
	 */
	highlight(index: number, scrollIntoView = true) {
		const items = this.#options.getItems();
		if (index < 0 || index >= items.length) return;

		this.highlightedIndex = index;
		this.#options.onHighlight(index);

		if (scrollIntoView) {
			const el = items[index];
			el?.scrollIntoView({ block: "nearest" });
		}
	}

	/**
	 * Highlight the first non-disabled item.
	 */
	highlightFirst() {
		const items = this.#options.getItems();
		const index = items.findIndex((el) => !el.hasAttribute("data-disabled"));
		if (index !== -1) this.highlight(index);
	}

	/**
	 * Highlight the last non-disabled item.
	 */
	highlightLast() {
		const items = this.#options.getItems();
		for (let i = items.length - 1; i >= 0; i--) {
			if (!items[i]?.hasAttribute("data-disabled")) {
				this.highlight(i);
				return;
			}
		}
	}

	/**
	 * Highlight the next non-disabled item.
	 */
	highlightNext() {
		const items = this.#options.getItems();
		if (items.length === 0) return;

		const start = this.highlightedIndex === -1 ? 0 : this.highlightedIndex + 1;

		// Search forward from current position
		for (let i = start; i < items.length; i++) {
			if (!items[i]?.hasAttribute("data-disabled")) {
				this.highlight(i);
				return;
			}
		}

		// If looping, search from beginning
		if (this.loop) {
			for (let i = 0; i < start; i++) {
				if (!items[i]?.hasAttribute("data-disabled")) {
					this.highlight(i);
					return;
				}
			}
		}
	}

	/**
	 * Highlight the previous non-disabled item.
	 */
	highlightPrev() {
		const items = this.#options.getItems();
		if (items.length === 0) return;

		const start = this.highlightedIndex === -1 ? items.length - 1 : this.highlightedIndex - 1;

		// Search backward from current position
		for (let i = start; i >= 0; i--) {
			if (!items[i]?.hasAttribute("data-disabled")) {
				this.highlight(i);
				return;
			}
		}

		// If looping, search from end
		if (this.loop) {
			for (let i = items.length - 1; i > start; i--) {
				if (!items[i]?.hasAttribute("data-disabled")) {
					this.highlight(i);
					return;
				}
			}
		}
	}

	/**
	 * Handle typeahead - jump to item starting with typed character(s).
	 */
	#handleTypeahead(char: string) {
		if (!letterRegex.test(char)) return;

		this.#debounceClearTypeahead();
		this.#typeaheadValue += char.toLowerCase();

		const items = this.#options.getItems();
		const startIndex = this.highlightedIndex === -1 ? 0 : this.highlightedIndex;

		// Get text content for each item
		const itemsWithText = items.map((el, index) => ({
			el,
			index,
			text: el.textContent?.toLowerCase() ?? "",
		}));

		// Search from current position forward, then wrap
		const isStartingTypeahead = this.#typeaheadValue.length === 1;
		const orderedItems = [
			...itemsWithText.slice(isStartingTypeahead ? startIndex + 1 : startIndex),
			...itemsWithText.slice(0, isStartingTypeahead ? startIndex + 1 : startIndex),
		];

		for (const item of orderedItems) {
			if (item.text.startsWith(this.#typeaheadValue) && !item.el.hasAttribute("data-disabled")) {
				this.highlight(item.index);
				return;
			}
		}
	}

	/**
	 * Create a keydown handler for the menu content element.
	 */
	handleKeydown = (e: KeyboardEvent) => {
		const items = this.#options.getItems();

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
			case kbd.ENTER:
			case kbd.SPACE: {
				e.preventDefault();
				if (this.highlightedIndex !== -1) {
					const item = items[this.highlightedIndex];
					if (item && !item.hasAttribute("data-disabled")) {
						this.#options.onSelect(this.highlightedIndex);
					}
				}
				break;
			}
			case kbd.ESCAPE:
			case kbd.TAB: {
				this.#options.onClose?.();
				break;
			}
			default: {
				// Handle typeahead for single printable characters
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					e.preventDefault();
					this.#handleTypeahead(e.key);
				}
			}
		}
	};

	/**
	 * Reset the navigation state.
	 */
	reset() {
		this.highlightedIndex = -1;
		this.#typeaheadValue = "";
	}
}
