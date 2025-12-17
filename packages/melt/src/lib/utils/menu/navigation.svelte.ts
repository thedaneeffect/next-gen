import { letterRegex } from "$lib/utils/typeahead.svelte";
import { useDebounce } from "runed";

export type MenuNavigatorOptions = {
	/**
	 * Returns enabled elements in DOM order.
	 * Should filter out disabled elements.
	 */
	getEls: () => HTMLElement[];

	/**
	 * Returns whether navigation should loop at boundaries.
	 */
	getLoop: () => boolean;

	/**
	 * Called when the highlighted element changes.
	 * Useful for triggering side effects like submenu open/close.
	 */
	onHighlightChange?: (prev: HTMLElement | null, next: HTMLElement | null) => void;

	/**
	 * Typeahead timeout in ms.
	 * @default 500
	 */
	typeaheadTimeout?: number;
};

/**
 * Element-based menu navigation handler.
 * Manages highlight state, typeahead, and navigation for menu-like components.
 */
export class MenuNavigator {
	#opts: MenuNavigatorOptions;
	#typeaheadValue = $state("");
	#debounceClearTypeahead: ReturnType<typeof useDebounce>;

	highlightedEl: HTMLElement | null = $state(null);

	constructor(opts: MenuNavigatorOptions) {
		this.#opts = opts;
		this.#debounceClearTypeahead = useDebounce(
			() => {
				this.#typeaheadValue = "";
			},
			() => opts.typeaheadTimeout ?? 500,
		);
	}

	#highlight(el: HTMLElement | null) {
		const prev = this.highlightedEl;
		this.highlightedEl = el;
		el?.scrollIntoView({ block: "nearest" });
		this.#opts.onHighlightChange?.(prev, el);
	}

	highlightFirst() {
		const els = this.#opts.getEls();
		if (els.length > 0) {
			this.#highlight(els[0]!);
		}
	}

	highlightLast() {
		const els = this.#opts.getEls();
		if (els.length > 0) {
			this.#highlight(els[els.length - 1]!);
		}
	}

	highlightNext() {
		const els = this.#opts.getEls();
		if (els.length === 0) return;

		const currentIdx = this.highlightedEl ? els.indexOf(this.highlightedEl) : -1;
		const loop = this.#opts.getLoop();

		let nextIdx: number;
		if (currentIdx === -1) {
			nextIdx = 0;
		} else if (currentIdx === els.length - 1) {
			nextIdx = loop ? 0 : currentIdx;
		} else {
			nextIdx = currentIdx + 1;
		}

		this.#highlight(els[nextIdx]!);
	}

	highlightPrev() {
		const els = this.#opts.getEls();
		if (els.length === 0) return;

		const currentIdx = this.highlightedEl ? els.indexOf(this.highlightedEl) : -1;
		const loop = this.#opts.getLoop();

		let prevIdx: number;
		if (currentIdx === -1) {
			prevIdx = els.length - 1;
		} else if (currentIdx === 0) {
			prevIdx = loop ? els.length - 1 : 0;
		} else {
			prevIdx = currentIdx - 1;
		}

		this.#highlight(els[prevIdx]!);
	}

	handleTypeahead(char: string) {
		if (!letterRegex.test(char)) return;

		this.#debounceClearTypeahead();
		this.#typeaheadValue += char.toLowerCase();

		const els = this.#opts.getEls();
		const startIndex = this.highlightedEl ? els.indexOf(this.highlightedEl) : -1;

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
				this.#highlight(item.el);
				return;
			}
		}
	}

	reset() {
		this.highlightedEl = null;
		this.#typeaheadValue = "";
	}
}
