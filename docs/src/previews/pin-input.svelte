<script lang="ts">
	import { usePreviewControls } from "@components/preview-ctx.svelte";
	import Preview from "@components/preview.svelte";
	import { getters } from "melt";
	import { PinInput } from "melt/builders";

	const controls = usePreviewControls({
		maxLength: {
			label: "Max length",
			defaultValue: 4,
			type: "number",
			min: 1,
			max: 8,
		},
		type: {
			label: "Type",
			type: "select",
			options: ["alphanumeric", "numeric", "text"],
			defaultValue: "alphanumeric",
		},
		mask: {
			label: "Mask",
			type: "boolean",
			defaultValue: false,
		},
		disabled: {
			label: "Disabled",
			type: "boolean",
			defaultValue: false,
		},
		allowPaste: {
			label: "Allow paste",
			type: "boolean",
			defaultValue: true,
		},
	});

	const pinInput = new PinInput({
		...getters(controls),
		onValueChange(v) {
			pinInput.value = v.toUpperCase();
		},
		onComplete(v) {
			console.log("Yay!", v);
		},
	});
</script>

<Preview>
	<div {...pinInput.root} class="flex items-center justify-center gap-2 font-mono">
		{#each pinInput.inputs as input}
			<input
				class="size-12 rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] text-center text-[var(--text)] outline-none
				transition hover:border-[var(--border-subtle)] focus:border-[var(--orange)] disabled:cursor-not-allowed"
				{...input}
			/>
		{/each}
	</div>
</Preview>
