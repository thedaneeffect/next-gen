<script lang="ts">
	import { usePreviewControls } from "@components/preview-ctx.svelte";
	import Preview from "@components/preview.svelte";
	import { getters } from "melt";
	import { RadioGroup } from "melt/builders";
	const items = $state(["default", "comfortable", "compact"]);

	let controls = usePreviewControls({
		value: {
			type: "select",
			label: "Value",
			options: items,
			defaultValue: "default",
		},
		disabled: {
			type: "boolean",
			label: "Disabled",
			defaultValue: false,
		},
		loop: {
			type: "boolean",
			label: "Loop",
			defaultValue: true,
		},
		selectWhenFocused: {
			type: "boolean",
			label: "Select when focused",
			defaultValue: true,
		},
		orientation: {
			type: "select",
			label: "Orientation",
			options: ["horizontal", "vertical"],
			defaultValue: "vertical",
		},
	});

	const group = new RadioGroup({
		...getters(controls),
		onValueChange(v) {
			controls.value = v;
		},
	});

	const isVert = $derived(group.orientation === "vertical");
</script>

<Preview>
	<div class="mx-auto flex w-fit flex-col gap-2" {...group.root}>
		<label {...group.label} class="font-medium text-[var(--text)]">Layout</label>
		<div class="flex {isVert ? 'flex-col gap-1' : 'flex-row gap-3'}">
			{#each items as i}
				{@const item = group.getItem(i)}
				<div
					class="-ml-1 flex items-center gap-3 rounded p-1
					data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
					{...item.attrs}
				>
					<div
						class={[
							"grid h-6 w-6 place-items-center rounded-full border shadow-sm",
							"hover:bg-[var(--surface)] data-[disabled=true]:bg-[var(--border)]",
							item.checked
								? "border-orange-500 bg-orange-500"
								: "border-[var(--border)] bg-[var(--surface)]",
						]}
					>
						{#if item.checked}
							<div
								class={["h-3 w-3 rounded-full", item.checked && "bg-gray-950"]}
								aria-hidden="true"
							></div>
						{/if}
					</div>

					<span class="font-semibold capitalize leading-none text-[var(--text)]">
						{i}
					</span>
				</div>
			{/each}
		</div>
		<input {...group.hiddenInput} />
	</div>
</Preview>
