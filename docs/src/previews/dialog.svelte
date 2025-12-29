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
		scrollBehavior: {
			label: "Scroll behavior",
			type: "select",
			options: ["prevent", "allow"],
			defaultValue: "prevent",
		},
	});

	const dialog = new Dialog({
		closeOnEscape: () => controls.closeOnEscape,
		closeOnOutsideClick: () => controls.closeOnOutsideClick,
		scrollBehavior: () => controls.scrollBehavior,
	});
</script>

<Preview>
	<button class="btn btn-secondary" {...dialog.trigger}> Open Dialog </button>

	<dialog
		class="m-auto max-w-md rounded-2xl bg-stone-800 p-6 shadow-2xl backdrop:bg-black/50"
		{...dialog.content}
	>
		<h2 class="text-xl font-bold text-stone-200" {...dialog.title}>Edit profile</h2>
		<p class="mt-2 text-stone-400" {...dialog.description}>
			Make changes to your profile here. Click save when you're done.
		</p>

		<div class="mt-4 space-y-4">
			<div>
				<label class="block text-sm font-medium text-stone-400" for="name"> Name </label>
				<input
					id="name"
					type="text"
					class="mt-1 block w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-stone-200"
					placeholder="Enter your name"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium text-stone-400" for="email"> Email </label>
				<input
					id="email"
					type="email"
					class="mt-1 block w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-stone-200"
					placeholder="Enter your email"
				/>
			</div>
		</div>

		<div class="mt-6 flex justify-end gap-3">
			<button class="btn btn-ghost" {...dialog.close}> Cancel </button>
			<button class="btn btn-primary" {...dialog.close}> Save changes </button>
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
