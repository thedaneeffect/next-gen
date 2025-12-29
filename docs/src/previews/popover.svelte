<script lang="ts">
	import Preview from "@components/preview.svelte";
	import { Popover as PopoverComponent } from "melt/components";
	import { Popover } from "melt/builders";
	import { usePreviewControls } from "@components/preview-ctx.svelte";

	const controls = usePreviewControls({
		arrow: {
			label: "Show arrow",
			type: "boolean",
			defaultValue: false,
		},
	});

	const popover = new Popover({
		forceVisible: true,
	});
</script>

<Preview>
	<button class="btn btn-secondary mx-auto block" {...popover.trigger}> psst... </button>

	<div
		class="w-[260px] overflow-visible rounded-2xl bg-stone-800 p-4 shadow-xl"
		{...popover.content}
	>
		{#if controls.arrow}
			<div {...popover.arrow} class="size-2 rounded-tl"></div>
		{/if}
		<p class="text-center font-semibold text-stone-200">Can I tell you a secret?</p>

		<div class="mt-4 flex items-center justify-center gap-4">
			<PopoverComponent forceVisible>
				{#snippet children(popover2)}
					<button
						class="border-b-2 border-dashed bg-transparent text-stone-200 transition hover:cursor-pointer hover:opacity-75 active:opacity-50"
						{...popover2.trigger}
					>
						yes
					</button>

					<div
						{...popover2.content}
						class="rounded-xl bg-stone-700 p-4 text-stone-200 shadow-xl backdrop-blur hover:bg-stone-500/50 active:bg-stone-600/50"
					>
						you're awesome
					</div>
				{/snippet}
			</PopoverComponent>
		</div>
	</div>
</Preview>

<style>
	[data-melt-popover-content] {
		position: absolute;
		pointer-events: none;
		opacity: 0;

		transform: scale(0.9);

		transition: 0.3s;
		transition-property: opacity, transform;
	}

	[data-melt-popover-content][data-open] {
		pointer-events: auto;
		opacity: 1;

		transform: scale(1);
	}
</style>
