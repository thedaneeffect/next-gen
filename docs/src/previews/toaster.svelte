<script lang="ts">
	import { usePreviewControls } from "@components/preview-ctx.svelte";
	import Preview from "@components/preview.svelte";
	import { getters } from "melt";
	import { Toaster } from "melt/builders";
	import { Progress } from "melt/components";
	import { fly } from "svelte/transition";
	import Close from "~icons/material-symbols/close-rounded";

	const controls = usePreviewControls({
		hover: {
			type: "select",
			label: "Hover",
			options: ["pause", "pause-all"],
			defaultValue: "pause-all",
		},
		closeDelay: {
			type: "number",
			min: 0,
			max: 10000,
			defaultValue: 3000,
			label: "Close Delay",
		},
	});

	type ToastData = {
		title: string;
		description: string;
		variant: "success" | "warning" | "error";
	};

	const toastData: ToastData[] = [
		{
			title: "Success",
			description: "Congratulations! It worked!",
			variant: "success",
		},
		{
			title: "Warning",
			description: "Please check again.",
			variant: "warning",
		},
		{
			title: "Error",
			description: "Something did not work!",
			variant: "error",
		},
	];

	const toaster = new Toaster<ToastData>({
		...getters(controls),
	});

	function addRandomToast() {
		toaster.addToast({
			data: toastData[Math.floor(Math.random() * toastData.length)],
		});
	}
</script>

<Preview class="text-center">
	<button class="btn btn-secondary mx-auto block" onclick={addRandomToast}> Show Toast </button>

	<div
		{...toaster.root}
		class="fixed !bottom-4 !right-4 flex w-[300px] flex-col"
		style:--toasts={toaster.toasts.length}
	>
		{#each toaster.toasts as toast, i (toast.id)}
			<div
				class="h-(--toast-height) relative flex w-full flex-col justify-center rounded-xl bg-[var(--surface)] px-4 text-left transition"
				{...toast.content}
				style:--n={toaster.toasts.length - i}
				in:fly={{ y: 60, opacity: 0.9 }}
				out:fly={{ y: 20 }}
			>
				<h3 {...toast.title} class="whitespace-nowrap text-sm font-medium text-[var(--text)]">
					{toast.data.title}
				</h3>

				{#if toast.data.description}
					<div {...toast.description} class="text-xs text-[var(--text-muted)]">
						{toast.data.description}
					</div>
				{/if}

				<button
					{...toast.close}
					aria-label="dismiss toast"
					class="absolute right-1 top-1 bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
				>
					<Close class="h-3.5 w-3.5" />
				</button>

				{#if toast.closeDelay !== 0}
					<div class="absolute bottom-4 right-4 h-[4px] w-[30px] overflow-hidden rounded-full">
						<Progress value={toast.percentage}>
							{#snippet children(progress)}
								<div
									{...progress.root}
									class="relative h-full w-full overflow-hidden bg-[var(--bg)]"
								>
									<div
										{...progress.progress}
										class="h-full w-full -translate-x-[var(--progress)]"
										class:bg-[var(--green)]={toast.data.variant === "success"}
										class:bg-[var(--orange)]={toast.data.variant === "warning"}
										class:bg-[var(--red)]={toast.data.variant === "error"}
									></div>
								</div>
							{/snippet}
						</Progress>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</Preview>

<style>
	:global([popover]) {
		inset: unset;
	}

	[data-melt-toaster-root] {
		--gap: 0.75rem;
		--hover-offset: 1rem;
		--toast-height: 4rem;
		--hidden-offset: 0.75rem;

		--hidden-toasts: calc(var(--toasts) - 1);

		overflow: visible;
		display: grid;
		grid-template-rows: var(--toast-height) repeat(var(--hidden-toasts), var(--hidden-offset));
		grid-template-columns: 1fr;
		gap: 0;
		background: unset;
		padding: 0;
	}

	[data-melt-toaster-root]:hover {
		grid-template-rows: var(--hidden-offset) var(--toast-height) repeat(
				var(--hidden-toasts),
				calc(var(--toast-height) + var(--gap))
			);
	}

	[data-melt-toaster-toast-content] {
		position: absolute;
		pointer-events: auto;
		bottom: 0;
		left: 0;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

		transform-origin: 50% 0%;
		transition: all 350ms ease;
	}

	[data-melt-toaster-toast-content] {
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
	}

	[data-melt-toaster-toast-content]:nth-last-child(n + 4) {
		z-index: 1;
		scale: 0.925;
		opacity: 0;
		translate: 0 calc(-3 * var(--hidden-offset));
	}

	[data-melt-toaster-toast-content]:nth-last-child(-n + 3) {
		z-index: 2;
		scale: 0.95;
		translate: 0 calc(-2 * var(--hidden-offset));
	}

	[data-melt-toaster-toast-content]:nth-last-child(-n + 2) {
		z-index: 3;
		scale: 0.975;
		translate: 0 calc(-1 * var(--hidden-offset));
	}

	[data-melt-toaster-toast-content]:nth-last-child(-n + 1) {
		z-index: 4;
		scale: 1;
		translate: 0;
	}

	[data-melt-toaster-root]:hover [data-melt-toaster-toast-content] {
		scale: 1;
		opacity: 1;
		--toast-gap: calc(calc(var(--gap) * var(--n)) + var(--hover-offset));
		--percentage: calc(-100% * calc(var(--n) - 1));
		translate: 0 calc(var(--percentage) - var(--toast-gap));
	}
</style>
