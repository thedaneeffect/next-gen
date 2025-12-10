import type { VirtualElement } from "@floating-ui/dom";

/**
 * Creates a Floating UI virtual element at the specified coordinates.
 * Used to position context menus at the cursor location.
 */
export function createVirtualAnchor(x: number, y: number): VirtualElement {
	return {
		getBoundingClientRect() {
			return {
				width: 0,
				height: 0,
				x,
				y,
				top: y,
				left: x,
				right: x,
				bottom: y,
			};
		},
	};
}
