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

	function handleSelect(action: string) {
		console.log("Selected:", action);
	}

	// -------------------------------------------------------------------------
	// Submenus
	// -------------------------------------------------------------------------

	const pasteSpecialSubmenu = menu.createSub();
	const findReplaceSubmenu = menu.createSub();
	const transformSubmenu = menu.createSub();
	const sortLinesSubmenu = transformSubmenu.createSub();
	const insertSubmenu = menu.createSub();
	const snippetSubmenu = insertSubmenu.createSub();
	const shareSubmenu = menu.createSub();
	const socialSubmenu = shareSubmenu.createSub();

	// -------------------------------------------------------------------------
	// Main menu items
	// -------------------------------------------------------------------------

	const undoItem = menu.getItem({ onSelect: () => handleSelect("undo") });
	const redoItem = menu.getItem({ onSelect: () => handleSelect("redo") });
	const cutItem = menu.getItem({ onSelect: () => handleSelect("cut") });
	const copyItem = menu.getItem({ onSelect: () => handleSelect("copy") });
	const pasteItem = menu.getItem({ onSelect: () => handleSelect("paste") });
	const deleteItem = menu.getItem({ onSelect: () => handleSelect("delete"), disabled: true });
	const selectAllItem = menu.getItem({ onSelect: () => handleSelect("select-all") });
	const selectLineItem = menu.getItem({ onSelect: () => handleSelect("select-line") });
	const selectWordItem = menu.getItem({ onSelect: () => handleSelect("select-word") });
	const preferencesItem = menu.getItem({
		onSelect: () => handleSelect("preferences"),
		disabled: true,
	});
	const deleteFileItem = menu.getItem({ onSelect: () => handleSelect("delete-file") });

	// -------------------------------------------------------------------------
	// Paste Special submenu items
	// -------------------------------------------------------------------------

	const pastePlainTextItem = pasteSpecialSubmenu.getItem({
		onSelect: () => handleSelect("paste-plain-text"),
	});
	const pasteAsQuoteItem = pasteSpecialSubmenu.getItem({
		onSelect: () => handleSelect("paste-as-quote"),
	});
	const pasteMatchStyleItem = pasteSpecialSubmenu.getItem({
		onSelect: () => handleSelect("paste-match-style"),
	});

	// -------------------------------------------------------------------------
	// Find & Replace submenu items
	// -------------------------------------------------------------------------

	const findItem = findReplaceSubmenu.getItem({ onSelect: () => handleSelect("find") });
	const findNextItem = findReplaceSubmenu.getItem({ onSelect: () => handleSelect("find-next") });
	const findPrevItem = findReplaceSubmenu.getItem({ onSelect: () => handleSelect("find-prev") });
	const replaceItem = findReplaceSubmenu.getItem({ onSelect: () => handleSelect("replace") });
	const replaceAllItem = findReplaceSubmenu.getItem({
		onSelect: () => handleSelect("replace-all"),
	});

	// -------------------------------------------------------------------------
	// Transform submenu items
	// -------------------------------------------------------------------------

	const uppercaseItem = transformSubmenu.getItem({ onSelect: () => handleSelect("uppercase") });
	const lowercaseItem = transformSubmenu.getItem({ onSelect: () => handleSelect("lowercase") });
	const titleCaseItem = transformSubmenu.getItem({ onSelect: () => handleSelect("title-case") });
	const sentenceCaseItem = transformSubmenu.getItem({
		onSelect: () => handleSelect("sentence-case"),
	});
	const reverseLinesItem = transformSubmenu.getItem({
		onSelect: () => handleSelect("reverse-lines"),
	});
	const shuffleLinesItem = transformSubmenu.getItem({
		onSelect: () => handleSelect("shuffle-lines"),
	});
	const removeDuplicatesItem = transformSubmenu.getItem({
		onSelect: () => handleSelect("remove-duplicates"),
	});
	const trimWhitespaceItem = transformSubmenu.getItem({
		onSelect: () => handleSelect("trim-whitespace"),
	});
	const joinLinesItem = transformSubmenu.getItem({ onSelect: () => handleSelect("join-lines") });

	// -------------------------------------------------------------------------
	// Sort Lines submenu items
	// -------------------------------------------------------------------------

	const sortAZItem = sortLinesSubmenu.getItem({ onSelect: () => handleSelect("sort-az") });
	const sortZAItem = sortLinesSubmenu.getItem({ onSelect: () => handleSelect("sort-za") });
	const sortByLengthItem = sortLinesSubmenu.getItem({
		onSelect: () => handleSelect("sort-by-length"),
	});

	// -------------------------------------------------------------------------
	// Insert submenu items
	// -------------------------------------------------------------------------

	const insertDateTimeItem = insertSubmenu.getItem({
		onSelect: () => handleSelect("insert-datetime"),
	});
	const insertFilePathItem = insertSubmenu.getItem({
		onSelect: () => handleSelect("insert-filepath"),
	});
	const insertUUIDItem = insertSubmenu.getItem({ onSelect: () => handleSelect("insert-uuid") });

	// -------------------------------------------------------------------------
	// Snippet submenu items
	// -------------------------------------------------------------------------

	const loremIpsumItem = snippetSubmenu.getItem({ onSelect: () => handleSelect("lorem-ipsum") });
	const mitLicenseItem = snippetSubmenu.getItem({ onSelect: () => handleSelect("mit-license") });
	const apacheLicenseItem = snippetSubmenu.getItem({
		onSelect: () => handleSelect("apache-license"),
	});
	const htmlBoilerplateItem = snippetSubmenu.getItem({
		onSelect: () => handleSelect("html-boilerplate"),
	});
	const cssResetItem = snippetSubmenu.getItem({ onSelect: () => handleSelect("css-reset") });
	const readmeTemplateItem = snippetSubmenu.getItem({
		onSelect: () => handleSelect("readme-template"),
	});
	const gitignoreItem = snippetSubmenu.getItem({ onSelect: () => handleSelect("gitignore") });
	const packageJsonItem = snippetSubmenu.getItem({ onSelect: () => handleSelect("package-json") });

	// -------------------------------------------------------------------------
	// Share submenu items
	// -------------------------------------------------------------------------

	const copyLinkItem = shareSubmenu.getItem({ onSelect: () => handleSelect("copy-link") });
	const emailItem = shareSubmenu.getItem({ onSelect: () => handleSelect("email") });
	const messagesItem = shareSubmenu.getItem({ onSelect: () => handleSelect("messages") });
	const airdropItem = shareSubmenu.getItem({ onSelect: () => handleSelect("airdrop") });

	// -------------------------------------------------------------------------
	// Social submenu items
	// -------------------------------------------------------------------------

	const twitterItem = socialSubmenu.getItem({ onSelect: () => handleSelect("twitter") });
	const linkedinItem = socialSubmenu.getItem({ onSelect: () => handleSelect("linkedin") });
	const mastodonItem = socialSubmenu.getItem({ onSelect: () => handleSelect("mastodon") });
	const blueskyItem = socialSubmenu.getItem({ onSelect: () => handleSelect("bluesky") });

	// -------------------------------------------------------------------------
	// Sub-triggers
	// -------------------------------------------------------------------------

	const pasteSpecialTrigger = pasteSpecialSubmenu.trigger;
	const findReplaceTrigger = findReplaceSubmenu.trigger;
	const transformTrigger = transformSubmenu.trigger;
	const sortLinesTrigger = sortLinesSubmenu.trigger;
	const insertTrigger = insertSubmenu.trigger;
	const snippetTrigger = snippetSubmenu.trigger;
	const shareTrigger = shareSubmenu.trigger;
	const socialTrigger = socialSubmenu.trigger;
</script>

<Preview>
	<div
		class="mx-auto flex h-48 w-80 items-center justify-center rounded-md border-2 border-dashed
			border-stone-700 text-stone-400"
		{...menu.trigger}
	>
		Right-click here
	</div>

	<!-- ===================================================================== -->
	<!-- Main Menu Content -->
	<!-- ===================================================================== -->
	<div
		class="menu-content max-h-64 min-w-44 overflow-y-auto rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...menu.content}
	>
		<button class="menu-item" {...undoItem.attrs}>
			Undo
			<span class="shortcut">&#8984;Z</span>
		</button>
		<button class="menu-item" {...redoItem.attrs}>
			Redo
			<span class="shortcut">&#8984;&#8679;Z</span>
		</button>

		<hr class="separator" {...menu.separator} />

		<button class="menu-item" {...cutItem.attrs}>
			Cut
			<span class="shortcut">&#8984;X</span>
		</button>
		<button class="menu-item" {...copyItem.attrs}>
			Copy
			<span class="shortcut">&#8984;C</span>
		</button>
		<button class="menu-item" {...pasteItem.attrs}>
			Paste
			<span class="shortcut">&#8984;V</span>
		</button>
		<button class="menu-item justify-between" {...pasteSpecialTrigger.attrs}>
			Paste Special
			<span class="submenu-arrow">&#8250;</span>
		</button>
		<button class="menu-item" {...deleteItem.attrs}>Delete</button>

		<hr class="separator" {...menu.separator} />

		<button class="menu-item" {...selectAllItem.attrs}>
			Select All
			<span class="shortcut">&#8984;A</span>
		</button>
		<button class="menu-item" {...selectLineItem.attrs}>Select Line</button>
		<button class="menu-item" {...selectWordItem.attrs}>Select Word</button>

		<hr class="separator" {...menu.separator} />

		<button class="menu-item justify-between" {...findReplaceTrigger.attrs}>
			Find & Replace
			<span class="submenu-arrow">&#8250;</span>
		</button>

		<hr class="separator" {...menu.separator} />

		<button class="menu-item justify-between" {...transformTrigger.attrs}>
			Transform
			<span class="submenu-arrow">&#8250;</span>
		</button>

		<hr class="separator" {...menu.separator} />

		<button class="menu-item justify-between" {...insertTrigger.attrs}>
			Insert
			<span class="submenu-arrow">&#8250;</span>
		</button>

		<hr class="separator" {...menu.separator} />

		<button class="menu-item justify-between" {...shareTrigger.attrs}>
			Share
			<span class="submenu-arrow">&#8250;</span>
		</button>

		<hr class="separator" {...menu.separator} />

		<span class="menu-label">Settings</span>
		<button class="menu-item" {...preferencesItem.attrs}>Preferences...</button>

		<hr class="separator" {...menu.separator} />

		<span class="menu-label">Danger Zone</span>
		<button
			class="menu-item text-red-500 data-[highlighted]:bg-red-500/10"
			{...deleteFileItem.attrs}
		>
			Delete File
			<span class="shortcut">&#8984;&#9003;</span>
		</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Paste Special Submenu -->
	<!-- ===================================================================== -->
	<div
		class="menu-content min-w-40 rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...pasteSpecialSubmenu.content}
	>
		<button class="menu-item" {...pastePlainTextItem.attrs}>Paste as Plain Text</button>
		<button class="menu-item" {...pasteAsQuoteItem.attrs}>Paste as Quote</button>
		<button class="menu-item" {...pasteMatchStyleItem.attrs}>Paste and Match Style</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Find & Replace Submenu -->
	<!-- ===================================================================== -->
	<div
		class="menu-content min-w-36 rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...findReplaceSubmenu.content}
	>
		<button class="menu-item" {...findItem.attrs}>
			Find
			<span class="shortcut">&#8984;F</span>
		</button>
		<button class="menu-item" {...findNextItem.attrs}>Find Next</button>
		<button class="menu-item" {...findPrevItem.attrs}>Find Previous</button>

		<hr class="separator" {...findReplaceSubmenu.separator} />

		<button class="menu-item" {...replaceItem.attrs}>
			Replace
			<span class="shortcut">&#8984;H</span>
		</button>
		<button class="menu-item" {...replaceAllItem.attrs}>Replace All</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Transform Submenu -->
	<!-- ===================================================================== -->
	<div
		class="menu-content max-h-40 min-w-40 overflow-y-auto rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...transformSubmenu.content}
	>
		<button class="menu-item" {...uppercaseItem.attrs}>UPPERCASE</button>
		<button class="menu-item" {...lowercaseItem.attrs}>lowercase</button>
		<button class="menu-item" {...titleCaseItem.attrs}>Title Case</button>
		<button class="menu-item" {...sentenceCaseItem.attrs}>Sentence case</button>

		<hr class="separator" {...transformSubmenu.separator} />

		<button class="menu-item justify-between" {...sortLinesTrigger.attrs}>
			Sort Lines
			<span class="submenu-arrow">&#8250;</span>
		</button>
		<button class="menu-item" {...reverseLinesItem.attrs}>Reverse Lines</button>
		<button class="menu-item" {...shuffleLinesItem.attrs}>Shuffle Lines</button>

		<hr class="separator" {...transformSubmenu.separator} />

		<button class="menu-item" {...removeDuplicatesItem.attrs}>Remove Duplicates</button>
		<button class="menu-item" {...trimWhitespaceItem.attrs}>Trim Whitespace</button>
		<button class="menu-item" {...joinLinesItem.attrs}>Join Lines</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Sort Lines Submenu (nested in Transform) -->
	<!-- ===================================================================== -->
	<div
		class="menu-content min-w-28 rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...sortLinesSubmenu.content}
	>
		<button class="menu-item" {...sortAZItem.attrs}>A → Z</button>
		<button class="menu-item" {...sortZAItem.attrs}>Z → A</button>
		<button class="menu-item" {...sortByLengthItem.attrs}>By Length</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Insert Submenu -->
	<!-- ===================================================================== -->
	<div
		class="menu-content min-w-36 rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...insertSubmenu.content}
	>
		<button class="menu-item" {...insertDateTimeItem.attrs}>Date & Time</button>
		<button class="menu-item" {...insertFilePathItem.attrs}>File Path</button>
		<button class="menu-item" {...insertUUIDItem.attrs}>UUID</button>

		<hr class="separator" {...insertSubmenu.separator} />

		<button class="menu-item justify-between" {...snippetTrigger.attrs}>
			Snippet
			<span class="submenu-arrow">&#8250;</span>
		</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Snippet Submenu (nested in Insert) -->
	<!-- ===================================================================== -->
	<div
		class="menu-content max-h-32 min-w-36 overflow-y-auto rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...snippetSubmenu.content}
	>
		<button class="menu-item" {...loremIpsumItem.attrs}>Lorem Ipsum</button>
		<button class="menu-item" {...mitLicenseItem.attrs}>MIT License</button>
		<button class="menu-item" {...apacheLicenseItem.attrs}>Apache License</button>
		<button class="menu-item" {...htmlBoilerplateItem.attrs}>HTML Boilerplate</button>
		<button class="menu-item" {...cssResetItem.attrs}>CSS Reset</button>
		<button class="menu-item" {...readmeTemplateItem.attrs}>README Template</button>
		<button class="menu-item" {...gitignoreItem.attrs}>.gitignore</button>
		<button class="menu-item" {...packageJsonItem.attrs}>package.json</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Share Submenu -->
	<!-- ===================================================================== -->
	<div
		class="menu-content min-w-32 rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...shareSubmenu.content}
	>
		<button class="menu-item" {...copyLinkItem.attrs}>Copy Link</button>
		<button class="menu-item" {...emailItem.attrs}>Email</button>
		<button class="menu-item" {...messagesItem.attrs}>Messages</button>
		<button class="menu-item" {...airdropItem.attrs}>AirDrop</button>

		<hr class="separator" {...shareSubmenu.separator} />

		<button class="menu-item justify-between" {...socialTrigger.attrs}>
			Social
			<span class="submenu-arrow">&#8250;</span>
		</button>
	</div>

	<!-- ===================================================================== -->
	<!-- Social Submenu (nested in Share) -->
	<!-- ===================================================================== -->
	<div
		class="menu-content min-w-28 rounded-sm border border-stone-700 bg-stone-800 p-0.5 shadow-lg outline-none"
		{...socialSubmenu.content}
	>
		<button class="menu-item" {...twitterItem.attrs}>Twitter</button>
		<button class="menu-item" {...linkedinItem.attrs}>LinkedIn</button>
		<button class="menu-item" {...mastodonItem.attrs}>Mastodon</button>
		<button class="menu-item" {...blueskyItem.attrs}>Bluesky</button>
	</div>
</Preview>

<style>
	.menu-content {
		--scrollbar-width: 0.375rem;
		--scrollbar-padding: 0.5625rem;

		/* Submenu offset to align first item with trigger (px only) */
		--submenu-offset-x: 0px;
		--submenu-offset-y: -3px; /* padding (2px) + border (1px) */

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
		padding-right: var(--scrollbar-padding);
		box-shadow: inset calc(var(--scrollbar-padding) * -1) 0 0 0 rgb(0 0 0 / 0.1);
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
		gap: 0.5rem;
		border-radius: 0.125rem;
		padding: 0.125rem 0.25rem;
		font-size: 0.75rem;
		cursor: pointer;
		outline: none;
		transition: background-color 0.1s;
		background-color: transparent;
		color: rgb(231 229 228); /* text-stone-200 */
	}

	.menu-item:hover {
		background-color: rgb(120 113 108 / 0.5); /* hover:bg-stone-500/50 */
	}

	.menu-item:active {
		background-color: rgb(87 83 78 / 0.5); /* active:bg-stone-600/50 */
	}

	.menu-item[data-highlighted] {
		background-color: rgb(120 113 108 / 0.5); /* bg-stone-500/50 */
	}

	.menu-item[data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.menu-label {
		display: block;
		padding: 0.125rem 0.25rem;
		font-size: 0.625rem;
		font-weight: 500;
		color: rgb(168 162 158); /* text-stone-400 */
	}

	.separator {
		margin: 0.25rem 0;
		border-color: rgb(68 64 60); /* border-stone-700 */
		border-bottom-width: 1px;
	}

	.shortcut {
		margin-left: auto;
		font-size: 0.625rem;
		color: rgb(168 162 158); /* text-stone-400 */
	}

	.submenu-arrow {
		margin-left: auto;
		color: rgb(168 162 158); /* text-stone-400 */
	}
</style>
