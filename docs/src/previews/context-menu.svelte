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
	const undoItem = menu.getItem({ onSelect: () => handleSelect("undo") });
	const redoItem = menu.getItem({ onSelect: () => handleSelect("redo") });
	const cutItem = menu.getItem({ onSelect: () => handleSelect("cut") });
	const copyItem = menu.getItem({ onSelect: () => handleSelect("copy") });
	const pasteItem = menu.getItem({ onSelect: () => handleSelect("paste") });
	const selectAllItem = menu.getItem({ onSelect: () => handleSelect("select-all") });
	const findItem = menu.getItem({ onSelect: () => handleSelect("find") });
	const replaceItem = menu.getItem({ onSelect: () => handleSelect("replace") });
	const deleteItem = menu.getItem({ onSelect: () => handleSelect("delete") });

	// Share submenu items
	const copyLinkItem = shareSubmenu.getItem({ onSelect: () => handleSelect("copy-link") });
	const emailItem = shareSubmenu.getItem({ onSelect: () => handleSelect("email") });
	const messagesItem = shareSubmenu.getItem({ onSelect: () => handleSelect("messages") });
	const airdropItem = shareSubmenu.getItem({ onSelect: () => handleSelect("airdrop") });
	const notesItem = shareSubmenu.getItem({ onSelect: () => handleSelect("notes") });
	const remindersItem = shareSubmenu.getItem({ onSelect: () => handleSelect("reminders") });

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
			border-[var(--border)] text-[var(--text-muted)]"
		{...menu.trigger}
	>
		Right-click here
	</div>

	<!-- Main Menu Content -->
	<div
		class="menu-content max-h-40 min-w-40 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-lg outline-none"
		{...menu.content}
	>
		<button class="menu-item" {...undoItem.attrs}>
			Undo
			<span class="ml-auto text-[10px] opacity-50">&#8984;Z</span>
		</button>
		<button class="menu-item" {...redoItem.attrs}>
			Redo
			<span class="ml-auto text-[10px] opacity-50">&#8984;&#8679;Z</span>
		</button>

		<hr class="my-0.5 border-[var(--border-subtle)]" {...menu.separator} />

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
		<button class="menu-item" {...selectAllItem.attrs}>
			Select All
			<span class="ml-auto text-[10px] opacity-50">&#8984;A</span>
		</button>

		<hr class="my-0.5 border-[var(--border-subtle)]" {...menu.separator} />

		<button class="menu-item" {...findItem.attrs}>
			Find
			<span class="ml-auto text-[10px] opacity-50">&#8984;F</span>
		</button>
		<button class="menu-item" {...replaceItem.attrs}>
			Replace
			<span class="ml-auto text-[10px] opacity-50">&#8984;H</span>
		</button>

		<hr class="my-0.5 border-[var(--border-subtle)]" {...menu.separator} />

		<!-- Share Submenu Trigger -->
		<button class="menu-item justify-between" {...shareTrigger.attrs}>
			Share
			<span class="opacity-50">&#8250;</span>
		</button>

		<hr class="my-0.5 border-[var(--border-subtle)]" {...menu.separator} />

		<span class="menu-label">Danger Zone</span>
		<button
			class="menu-item text-[var(--red)] data-[highlighted]:bg-[var(--red-subtle)]"
			{...deleteItem.attrs}
		>
			Delete
			<span class="ml-auto text-[10px] opacity-50">&#8984;&#9003;</span>
		</button>
	</div>

	<!-- Share Submenu Content -->
	<div
		class="menu-content max-h-24 min-w-36 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-lg outline-none"
		{...shareSubmenu.content}
	>
		<button class="menu-item" {...copyLinkItem.attrs}> Copy Link </button>
		<button class="menu-item" {...emailItem.attrs}> Email </button>
		<button class="menu-item" {...messagesItem.attrs}> Messages </button>
		<button class="menu-item" {...airdropItem.attrs}> AirDrop </button>
		<button class="menu-item" {...notesItem.attrs}> Notes </button>
		<button class="menu-item" {...remindersItem.attrs}> Reminders </button>

		<!-- Social Submenu Trigger -->
		<button class="menu-item justify-between" {...socialTrigger.attrs}>
			Social
			<span class="opacity-50">&#8250;</span>
		</button>
	</div>

	<!-- Social Submenu Content (nested) -->
	<div
		class="menu-content min-w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-lg outline-none"
		{...socialSubmenu.content}
	>
		<button class="menu-item" {...twitterItem.attrs}> Twitter </button>
		<button class="menu-item" {...facebookItem.attrs}> Facebook </button>
		<button class="menu-item" {...linkedinItem.attrs}> LinkedIn </button>
	</div>
</Preview>

<style>
	.menu-content {
		--scrollbar-width: 0.375rem;

		position: fixed;
		opacity: 0;
		transform: scale(0.95);
		transition:
			opacity 0.15s ease-out,
			transform 0.15s ease-out,
			display 0.15s allow-discrete,
			overlay 0.15s allow-discrete;

		/* Firefox scrollbar */
		scrollbar-width: thin;
		scrollbar-color: rgb(255 255 255 / 0.2) transparent;
	}

	/* Reserve space for scrollbar only when content is scrollable */
	.menu-content[data-scrollable] {
		padding-right: var(--scrollbar-width);
	}

	/* WebKit scrollbar (Chrome, Safari, Edge) */
	.menu-content::-webkit-scrollbar {
		width: var(--scrollbar-width);
	}

	.menu-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.menu-content::-webkit-scrollbar-thumb {
		background-color: rgb(255 255 255 / 0.2);
		border-radius: calc(var(--scrollbar-width) / 2);
	}

	.menu-content::-webkit-scrollbar-thumb:hover {
		background-color: rgb(255 255 255 / 0.35);
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
