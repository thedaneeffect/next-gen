<script lang="ts">
	import Preview from "@components/preview.svelte";
	import { AlertDialog } from "melt/builders";

	const alertDialog = new AlertDialog();
</script>

<Preview>
	<button
		class="mx-auto block rounded-xl bg-red-600 px-4 py-2 font-semibold text-white
			transition-all hover:cursor-pointer hover:bg-red-700
			active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
		{...alertDialog.trigger}
	>
		Delete account
	</button>

	<dialog
		class="m-auto max-w-md rounded-2xl bg-white p-6 shadow-2xl backdrop:bg-black/50 dark:bg-gray-800"
		{...alertDialog.content}
	>
		<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100" {...alertDialog.title}>
			Are you absolutely sure?
		</h2>
		<p class="mt-2 text-gray-600 dark:text-gray-400" {...alertDialog.description}>
			This action cannot be undone. This will permanently delete your account and remove your data
			from our servers.
		</p>

		<div class="mt-6 flex justify-end gap-3">
			<button
				class="rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-100
					dark:text-gray-300 dark:hover:bg-gray-700"
				{...alertDialog.cancel}
			>
				Cancel
			</button>
			<button
				class="rounded-lg bg-red-600 px-4 py-2 text-white transition
					hover:bg-red-700 active:bg-red-800"
				{...alertDialog.action}
			>
				Yes, delete account
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
