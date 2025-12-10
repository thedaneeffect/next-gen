<script lang="ts">
	import { getters } from "$lib/utils/getters.svelte.js";
	import { type Snippet } from "svelte";
	import { ContextMenu as Builder, type ContextMenuProps } from "../builders/ContextMenu.svelte";
	import type { ComponentProps } from "../types";

	type Props = ComponentProps<ContextMenuProps> & {
		children: Snippet<[Builder]>;
	};

	let { open = $bindable(false), floatingConfig, children, ...rest }: Props = $props();

	export const contextMenu = new Builder({
		open: () => open,
		onOpenChange: (v) => (open = v),
		floatingConfig,
		...getters(rest),
	});
</script>

{@render children(contextMenu)}
