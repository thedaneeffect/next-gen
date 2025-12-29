<script lang="ts">
	import { usePreviewControls } from "@components/preview-ctx.svelte";
	import Preview from "@components/preview.svelte";
	import { getters } from "melt";
	import { Accordion, type AccordionItem } from "melt/builders";
	import { slide } from "svelte/transition";

	const controls = usePreviewControls({
		multiple: {
			type: "boolean",
			defaultValue: false,
			label: "Multiple",
		},
		disabled: {
			type: "boolean",
			defaultValue: false,
			label: "Disabled",
		},
	});

	type Item = AccordionItem<{
		title: string;
		description: string;
	}>;

	const items: Item[] = [
		{
			id: "item-1",
			title: "What is it?",
			description:
				"A collection of accessible & unstyled component builders for Svelte applications.",
		},
		{
			id: "item-2",
			title: "Can I customize it?",
			description: "Totally, it is 100% stylable and overridable.",
		},
		{
			id: "item-3",
			title: "Svelte is awesome, huh?",
			description: "Yes, and so are you!",
		},
	];

	const accordion = new Accordion(getters(controls));
</script>

<Preview>
	<div {...accordion.root} class="mx-auto w-[18rem] max-w-full rounded-xl shadow-lg sm:w-[25rem]">
		{#each items as i, idx}
			{@const item = accordion.getItem(i)}
			{@const isFirst = idx === 0}
			{@const isLast = idx === items.length - 1}

			<div class="overflow-hidden first:rounded-t-xl last:rounded-b-xl">
				<h2 class="flex" {...item.heading}>
					<button
						{...item.trigger}
						class={[
							"flex flex-1 cursor-pointer items-center justify-between bg-[var(--surface)] px-5 py-5 text-base font-medium leading-none text-[var(--text)] outline-none transition-colors",
							"outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-orange-500",
							!item.isDisabled &&
								"hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]",
							"disabled:cursor-not-allowed disabled:opacity-50",
							!isLast && "border-b border-[var(--border-subtle)]",
							isFirst && "rounded-t-xl",
							isLast && !item.isExpanded && "rounded-b-xl",
						]}
					>
						{item.item.title}
					</button>
				</h2>

				{#if item.isExpanded}
					<div
						{...item.content}
						class="content overflow-hidden bg-[var(--background)] p-4 text-sm text-[var(--text-subtle)]"
						transition:slide={{ duration: 250 }}
					>
						<div class="p-2">
							{item.item.description}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</Preview>
