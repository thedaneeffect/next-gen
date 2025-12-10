<script lang="ts">
	import Preview from "@components/preview.svelte";
	import { ContextMenu } from "melt/builders";
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
	});

	const menu = new ContextMenu({
		closeOnEscape: () => controls.closeOnEscape,
		closeOnOutsideClick: () => controls.closeOnOutsideClick,
	});

	// Submenus
	const shareSubmenu = menu.createSub();
	const socialSubmenu = shareSubmenu.createSub();

	function handleSelect(action: string) {
		console.log("Selected:", action);
	}
</script>

<Preview>
	<div
		class="mx-auto flex h-48 w-80 items-center justify-center rounded-xl border-2 border-dashed
			border-gray-500 text-gray-500 dark:border-gray-600 dark:text-gray-400"
		{...menu.trigger}
	>
		Right-click here
	</div>

	<!-- Main Menu Content -->
	<div
		class="menu-content min-w-48 rounded-xl border border-gray-500 bg-gray-100 p-1.5 shadow-lg outline-none dark:bg-gray-800"
		{...menu.content}
	>
		<button class="menu-item" {...menu.getItem({ onSelect: () => handleSelect("cut") })}>
			Cut
			<span class="ml-auto text-xs opacity-50">⌘X</span>
		</button>
		<button class="menu-item" {...menu.getItem({ onSelect: () => handleSelect("copy") })}>
			Copy
			<span class="ml-auto text-xs opacity-50">⌘C</span>
		</button>
		<button class="menu-item" {...menu.getItem({ onSelect: () => handleSelect("paste") })}>
			Paste
			<span class="ml-auto text-xs opacity-50">⌘V</span>
		</button>

		<hr class="my-1.5 border-gray-300 dark:border-gray-600" {...menu.separator} />

		<!-- Share Submenu Trigger -->
		<button class="menu-item justify-between" {...shareSubmenu.trigger}>
			Share
			<span class="opacity-50">›</span>
		</button>

		<hr class="my-1.5 border-gray-300 dark:border-gray-600" {...menu.separator} />

		<span class="menu-label">Danger Zone</span>
		<button
			class="menu-item text-red-600 data-[highlighted]:bg-red-100 dark:text-red-400
				dark:data-[highlighted]:bg-red-900/30"
			{...menu.getItem({ onSelect: () => handleSelect("delete") })}
		>
			Delete
			<span class="ml-auto text-xs opacity-50">⌘⌫</span>
		</button>
	</div>

	<!-- Share Submenu Content -->
	<div
		class="menu-content min-w-40 rounded-xl border border-gray-500 bg-gray-100 p-1.5 shadow-lg outline-none dark:bg-gray-800"
		{...shareSubmenu.content}
	>
		<button
			class="menu-item"
			{...shareSubmenu.getItem({ onSelect: () => handleSelect("copy-link") })}
		>
			Copy Link
		</button>
		<button class="menu-item" {...shareSubmenu.getItem({ onSelect: () => handleSelect("email") })}>
			Email
		</button>

		<!-- Social Submenu Trigger -->
		<button class="menu-item justify-between" {...socialSubmenu.trigger}>
			Social
			<span class="opacity-50">›</span>
		</button>
	</div>

	<!-- Social Submenu Content (nested) -->
	<div
		class="menu-content min-w-36 rounded-xl border border-gray-500 bg-gray-100 p-1.5 shadow-lg outline-none dark:bg-gray-800"
		{...socialSubmenu.content}
	>
		<button
			class="menu-item"
			{...socialSubmenu.getItem({ onSelect: () => handleSelect("twitter") })}
		>
			Twitter
		</button>
		<button
			class="menu-item"
			{...socialSubmenu.getItem({ onSelect: () => handleSelect("facebook") })}
		>
			Facebook
		</button>
		<button
			class="menu-item"
			{...socialSubmenu.getItem({ onSelect: () => handleSelect("linkedin") })}
		>
			LinkedIn
		</button>
	</div>
</Preview>

<style>
	.menu-content {
		position: fixed;
		opacity: 0;
		transform: scale(0.95);
		transition:
			opacity 0.15s ease-out,
			transform 0.15s ease-out,
			display 0.15s allow-discrete,
			overlay 0.15s allow-discrete;
	}

	.menu-content:popover-open {
		opacity: 1;
		transform: scale(1);
	}

	@starting-style {
		.menu-content:popover-open {
			opacity: 0;
			transform: scale(0.95);
		}
	}

	.menu-item {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.5rem;
		border-radius: 0.5rem;
		padding: 0.5rem 0.625rem;
		font-size: 0.875rem;
		cursor: pointer;
		outline: none;
		transition: background-color 0.1s;
		background-color: transparent;
	}

	.menu-item:hover,
	.menu-item[data-highlighted] {
		background-color: rgb(0 0 0 / 0.1);
	}

	:global(.dark) .menu-item:hover,
	:global(.dark) .menu-item[data-highlighted] {
		background-color: rgb(255 255 255 / 0.15);
	}

	.menu-item[data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.menu-label {
		display: block;
		padding: 0.375rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 500;
		opacity: 0.5;
	}
</style>
