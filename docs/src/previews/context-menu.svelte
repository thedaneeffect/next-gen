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

	// Create item instances
	const cutItem = menu.getItem({ onSelect: () => handleSelect("cut") });
	const copyItem = menu.getItem({ onSelect: () => handleSelect("copy") });
	const pasteItem = menu.getItem({ onSelect: () => handleSelect("paste") });
	const deleteItem = menu.getItem({ onSelect: () => handleSelect("delete") });

	// Share submenu items
	const copyLinkItem = shareSubmenu.getItem({ onSelect: () => handleSelect("copy-link") });
	const emailItem = shareSubmenu.getItem({ onSelect: () => handleSelect("email") });

	// Social submenu items
	const twitterItem = socialSubmenu.getItem({ onSelect: () => handleSelect("twitter") });
	const facebookItem = socialSubmenu.getItem({ onSelect: () => handleSelect("facebook") });
	const linkedinItem = socialSubmenu.getItem({ onSelect: () => handleSelect("linkedin") });

	// Sub-triggers
	const shareTrigger = shareSubmenu.trigger;
	const socialTrigger = socialSubmenu.trigger;
</script>

<Preview>
	<div
		class="mx-auto flex h-48 w-80 items-center justify-center rounded-md border-2 border-dashed
			border-gray-500 text-gray-500 dark:border-gray-600 dark:text-gray-400"
		{...menu.trigger}
	>
		Right-click here
	</div>

	<!-- Main Menu Content -->
	<div
		class="menu-content min-w-40 rounded-md border border-gray-500 bg-gray-100 p-0.5 shadow-lg outline-none dark:bg-gray-800"
		{...menu.content}
	>
		<button class="menu-item" {...cutItem.attrs}>
			Cut
			<span class="ml-auto text-[10px] opacity-50">&#8984;X</span>
		</button>
		<button class="menu-item" {...copyItem.attrs}>
			Copy
			<span class="ml-auto text-[10px] opacity-50">&#8984;C</span>
		</button>
		<button class="menu-item" {...pasteItem.attrs}>
			Paste
			<span class="ml-auto text-[10px] opacity-50">&#8984;V</span>
		</button>

		<hr class="my-0.5 border-gray-300 dark:border-gray-600" {...menu.separator} />

		<!-- Share Submenu Trigger -->
		<button class="menu-item justify-between" {...shareTrigger.attrs}>
			Share
			<span class="opacity-50">&#8250;</span>
		</button>

		<hr class="my-0.5 border-gray-300 dark:border-gray-600" {...menu.separator} />

		<span class="menu-label">Danger Zone</span>
		<button
			class="menu-item text-red-600 data-[highlighted]:bg-red-100 dark:text-red-400
				dark:data-[highlighted]:bg-red-900/30"
			{...deleteItem.attrs}
		>
			Delete
			<span class="ml-auto text-[10px] opacity-50">&#8984;&#9003;</span>
		</button>
	</div>

	<!-- Share Submenu Content -->
	<div
		class="menu-content min-w-36 rounded-md border border-gray-500 bg-gray-100 p-0.5 shadow-lg outline-none dark:bg-gray-800"
		{...shareSubmenu.content}
	>
		<button class="menu-item" {...copyLinkItem.attrs}> Copy Link </button>
		<button class="menu-item" {...emailItem.attrs}> Email </button>

		<!-- Social Submenu Trigger -->
		<button class="menu-item justify-between" {...socialTrigger.attrs}>
			Social
			<span class="opacity-50">&#8250;</span>
		</button>
	</div>

	<!-- Social Submenu Content (nested) -->
	<div
		class="menu-content min-w-32 rounded-md border border-gray-500 bg-gray-100 p-0.5 shadow-lg outline-none dark:bg-gray-800"
		{...socialSubmenu.content}
	>
		<button class="menu-item" {...twitterItem.attrs}> Twitter </button>
		<button class="menu-item" {...facebookItem.attrs}> Facebook </button>
		<button class="menu-item" {...linkedinItem.attrs}> LinkedIn </button>
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
		gap: 0.125rem;
		border-radius: 0.125rem;
		padding: 0.125rem 0.25rem;
		font-size: 0.75rem;
		cursor: pointer;
		outline: none;
		transition: background-color 0.1s;
		background-color: transparent;
	}

	.menu-item[data-highlighted] {
		background-color: rgb(0 0 0 / 0.1);
	}

	:global(.dark) .menu-item[data-highlighted] {
		background-color: rgb(255 255 255 / 0.15);
	}

	.menu-item[data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.menu-label {
		display: block;
		padding: 0.0625rem 0.25rem;
		font-size: 0.625rem;
		font-weight: 500;
		opacity: 0.5;
	}
</style>
