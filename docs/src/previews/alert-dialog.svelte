<script lang="ts">
	import Preview from "@components/preview.svelte";
	import { AlertDialog } from "melt/builders";

	const alertDialog = new AlertDialog();
</script>

<Preview>
	<button class="btn btn-destructive" {...alertDialog.trigger}> Delete account </button>

	<dialog
		class="m-auto max-w-md rounded-2xl bg-stone-800 p-6 shadow-2xl backdrop:bg-black/50"
		{...alertDialog.content}
	>
		<h2 class="text-xl font-bold text-stone-200" {...alertDialog.title}>
			Are you absolutely sure?
		</h2>
		<p class="mt-2 text-stone-400" {...alertDialog.description}>
			This action cannot be undone. This will permanently delete your account and remove your data
			from our servers.
		</p>

		<div class="mt-6 flex justify-end gap-3">
			<button class="btn btn-ghost" {...alertDialog.cancel}> Cancel </button>
			<button class="btn btn-destructive" {...alertDialog.action}> Yes, delete account </button>
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
