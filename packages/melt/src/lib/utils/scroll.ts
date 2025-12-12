/**
 * Walk up from target to find first vertically scrollable ancestor within container.
 * Returns null if no scrollable ancestor found.
 */
export function findScrollableAncestor(
	target: HTMLElement,
	container: HTMLElement,
): HTMLElement | null {
	let el: HTMLElement | null = target;

	while (el && container.contains(el)) {
		const { scrollHeight, clientHeight } = el;
		const hasOverflow = scrollHeight > clientHeight;

		if (hasOverflow) {
			const style = getComputedStyle(el);
			const canScroll = style.overflowY === "auto" || style.overflowY === "scroll";
			if (canScroll) return el;
		}

		el = el.parentElement;
	}

	return null;
}

/**
 * Check if element can scroll vertically in the given direction.
 * Returns false if at boundary or not scrollable.
 */
export function canScrollVertically(el: HTMLElement, deltaY: number): boolean {
	const { scrollTop, scrollHeight, clientHeight } = el;

	if (scrollHeight <= clientHeight) return false;
	if (deltaY < 0 && scrollTop <= 0) return false;
	if (deltaY > 0 && scrollTop + clientHeight >= scrollHeight) return false;

	return true;
}
