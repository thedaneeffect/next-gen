<script lang="ts">
	import { getters } from "$lib/utils/getters.svelte.js";
	import { type Snippet } from "svelte";
	import { AlertDialog as Builder, type AlertDialogProps } from "../builders/AlertDialog.svelte";
	import type { ComponentProps } from "../types";

	type Props = ComponentProps<AlertDialogProps> & {
		children: Snippet<[Builder]>;
	};

	let { open = $bindable(false), children, ...rest }: Props = $props();

	export const alertDialog = new Builder({
		open: () => open,
		onOpenChange: (v) => (open = v),
		...getters(rest),
	});
</script>

{@render children(alertDialog)}
