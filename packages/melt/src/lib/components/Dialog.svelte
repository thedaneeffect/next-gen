<script lang="ts">
	import { getters } from "$lib/utils/getters.svelte.js";
	import { type Snippet } from "svelte";
	import { Dialog as Builder, type DialogProps } from "../builders/Dialog.svelte";
	import type { ComponentProps } from "../types";

	type Props = ComponentProps<DialogProps> & {
		children: Snippet<[Builder]>;
	};

	let { open = $bindable(false), children, ...rest }: Props = $props();

	export const dialog = new Builder({
		open: () => open,
		onOpenChange: (v) => (open = v),
		...getters(rest),
	});
</script>

{@render children(dialog)}
