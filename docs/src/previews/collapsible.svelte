<script lang="ts">
	import { usePreviewControls } from "@components/preview-ctx.svelte";
	import Preview from "@components/preview.svelte";
	import { Collapsible } from "melt/components";
	import { slide } from "svelte/transition";
	import ChevronUpDown from "~icons/heroicons/chevron-up-down-solid";
	import Close from "~icons/material-symbols/close-rounded";

	const controls = usePreviewControls({
		disabled: {
			label: "Disabled",
			type: "boolean",
			defaultValue: false,
		},
	});
</script>

<Preview>
	<Collapsible {...controls}>
		{#snippet children(collapsible)}
			<div class="mx-auto w-[18rem] max-w-full sm:w-[25rem]">
				<button
					{...collapsible.trigger}
					class="btn btn-secondary relative z-10 mx-auto flex w-full items-center justify-between"
					class:shadow-md={collapsible.open}
					aria-label="Toggle"
				>
					<span> @thomasglopes starred 3 repositories </span>
					{#if collapsible.open}
						<Close />
					{:else}
						<ChevronUpDown />
					{/if}
				</button>

				{#if collapsible.open}
					<div
						{...collapsible.content}
						class="mx-auto flex w-[calc(100%-32px)] flex-col gap-2 rounded-b-xl bg-[var(--background)] p-4 text-[var(--text-subtle)]"
						transition:slide
					>
						<span>melt-ui/melt-ui</span>
						<hr class="border-b border-[var(--border-subtle)]" />
						<span>sveltejs/svelte</span>
						<hr class="border-b border-[var(--border-subtle)]" />
						<span>sveltejs/kit</span>
					</div>
				{/if}
			</div>
		{/snippet}
	</Collapsible>
</Preview>
