<script lang="ts">
	import Preview from "@components/preview.svelte";
	import { Dialog } from "melt/builders";
	import { usePreviewControls } from "@components/preview-ctx.svelte";

	const controls = usePreviewControls({
		closeOnEscape: {
			label: "Close on Escape",
			type: "boolean",
			defaultValue: true,
		},
		closeOnOutsideClick: {
			label: "Close on outside click",
			type: "boolean",
			defaultValue: true,
		},
		preventScroll: {
			label: "Prevent scroll",
			type: "boolean",
			defaultValue: true,
		},
	});

	const dialog = new Dialog({
		closeOnEscape: () => controls.closeOnEscape,
		closeOnOutsideClick: () => controls.closeOnOutsideClick,
		preventScroll: () => controls.preventScroll,
	});
</script>

<Preview>
	<button
		class="mx-auto block rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-800
			transition-all hover:cursor-pointer hover:bg-gray-200
			active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
			dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50"
		{...dialog.trigger}
	>
		Open Dialog
	</button>

	<dialog
		class="m-auto max-w-md rounded-2xl bg-white p-6 shadow-2xl backdrop:bg-black/50 dark:bg-gray-800"
		{...dialog.content}
	>
		<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100" {...dialog.title}>
			Edit profile
		</h2>
		<p class="mt-2 text-gray-600 dark:text-gray-400" {...dialog.description}>
			Make changes to your profile here. Click save when you're done.
		</p>

		<div class="mt-4 space-y-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="name">
					Name
				</label>
				<input
					id="name"
					type="text"
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2
						text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1
						focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
					placeholder="Enter your name"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="email">
					Email
				</label>
				<input
					id="email"
					type="email"
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2
						text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1
						focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
					placeholder="Enter your email"
				/>
			</div>
		</div>

		<div class="mt-6 flex justify-end gap-3">
			<button
				class="rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-100
					dark:text-gray-300 dark:hover:bg-gray-700"
				{...dialog.close}
			>
				Cancel
			</button>
			<button
				class="rounded-lg bg-blue-600 px-4 py-2 text-white transition
					hover:bg-blue-700 active:bg-blue-800"
				{...dialog.close}
			>
				Save changes
			</button>
		</div>
	</dialog>
</Preview>

<style>
	/* Entry animation */
	dialog {
		opacity: 0;
		transform: scale(0.95) translateY(-10px);
		transition:
			opacity 0.2s ease-out,
			transform 0.2s ease-out,
			display 0.2s allow-discrete,
			overlay 0.2s allow-discrete;
	}

	dialog[open] {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		dialog[open] {
			opacity: 0;
			transform: scale(0.95) translateY(-10px);
		}
	}

	/* Backdrop animation */
	dialog::backdrop {
		background: rgb(0 0 0 / 0);
		transition:
			background 0.2s ease-out,
			display 0.2s allow-discrete,
			overlay 0.2s allow-discrete;
	}

	dialog[open]::backdrop {
		background: rgb(0 0 0 / 0.5);
	}

	@starting-style {
		dialog[open]::backdrop {
			background: rgb(0 0 0 / 0);
		}
	}
</style>
