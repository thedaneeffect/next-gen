<script lang="ts">
	import Preview from "@components/preview.svelte";
	import { Toaster } from "melt/builders";
	import { fly } from "svelte/transition";
	import Close from "~icons/material-symbols/close-rounded";

	type ColorSwatch = {
		name: string;
		value: string;
	};

	type AccentColor = {
		name: string;
		base: string;
		dim: string;
		subtle: string;
		muted: string;
	};

	type ToastData = {
		message: string;
	};

	const backgrounds: ColorSwatch[] = [
		{ name: "--bg-hard", value: "#1d2021" },
		{ name: "--bg", value: "#282828" },
		{ name: "--bg-soft", value: "#32302f" },
		{ name: "--bg1", value: "#3c3836" },
		{ name: "--bg2", value: "#504945" },
		{ name: "--bg3", value: "#665c54" },
		{ name: "--bg4", value: "#7c6f64" },
	];

	const foregrounds: ColorSwatch[] = [
		{ name: "--fg", value: "#fbf1c7" },
		{ name: "--fg1", value: "#ebdbb2" },
		{ name: "--fg2", value: "#d5c4a1" },
		{ name: "--fg3", value: "#bdae93" },
		{ name: "--fg4", value: "#a89984" },
	];

	const gray: ColorSwatch = { name: "--gray", value: "#928374" };

	const accents: AccentColor[] = [
		{
			name: "Orange",
			base: "#fe8019",
			dim: "#d65d0e",
			subtle: "#473529",
			muted: "#7a4929",
		},
		{
			name: "Red",
			base: "#fb4934",
			dim: "#cc241d",
			subtle: "#47302a",
			muted: "#7a392e",
		},
		{
			name: "Green",
			base: "#b8bb26",
			dim: "#98971a",
			subtle: "#3d3b2b",
			muted: "#5f5e2f",
		},
		{
			name: "Yellow",
			base: "#fabd2f",
			dim: "#d79921",
			subtle: "#453c2c",
			muted: "#775e31",
		},
		{
			name: "Blue",
			base: "#83a598",
			dim: "#458588",
			subtle: "#353937",
			muted: "#4b5752",
		},
		{
			name: "Purple",
			base: "#d3869b",
			dim: "#b16286",
			subtle: "#3f3537",
			muted: "#684c53",
		},
		{
			name: "Aqua",
			base: "#8ec07c",
			dim: "#689d6a",
			subtle: "#363c34",
			muted: "#4f6048",
		},
	];

	const toaster = new Toaster<ToastData>({
		closeDelay: 1500,
	});

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toaster.addToast({
			data: { message: text },
		});
	}

	function getTokenName(colorName: string, variant: string): string {
		const base = colorName.toLowerCase();
		if (variant === "base") return `--${base}`;
		return `--${base}-${variant}`;
	}
</script>

<Preview>
	<div class="w-full space-y-8 p-4">
		<!-- Backgrounds -->
		<section>
			<h3 class="mb-3 text-sm font-medium text-gray-100">Backgrounds</h3>
			<div class="flex gap-1">
				{#each backgrounds as bg}
					<div
						class="group relative h-20 flex-1 rounded transition-transform hover:scale-105"
						style="background-color: {bg.value}"
					>
						<div
							class="absolute inset-x-0 bottom-0 flex flex-col rounded-b bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<button
								class="w-full px-1 py-0.5 text-center text-[9px] font-medium text-gray-100 hover:bg-white/10"
								onclick={(e) => {
									e.stopPropagation();
									copyToClipboard(`var(${bg.name})`);
								}}
							>
								{bg.name}
							</button>
							<button
								class="w-full px-1 py-0.5 text-center text-[8px] text-gray-300 hover:bg-white/10"
								onclick={(e) => {
									e.stopPropagation();
									copyToClipboard(bg.value);
								}}
							>
								{bg.value}
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Foregrounds -->
		<section>
			<h3 class="mb-3 text-sm font-medium text-gray-100">Foregrounds</h3>
			<div class="flex gap-1">
				{#each foregrounds as fg}
					<div
						class="group relative h-20 flex-1 rounded border border-gray-700 transition-transform hover:scale-105"
						style="background-color: {fg.value}"
					>
						<div
							class="absolute inset-x-0 bottom-0 flex flex-col rounded-b bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<button
								class="w-full px-1 py-0.5 text-center text-[9px] font-medium text-gray-100 hover:bg-white/10"
								onclick={(e) => {
									e.stopPropagation();
									copyToClipboard(`var(${fg.name})`);
								}}
							>
								{fg.name}
							</button>
							<button
								class="w-full px-1 py-0.5 text-center text-[8px] text-gray-300 hover:bg-white/10"
								onclick={(e) => {
									e.stopPropagation();
									copyToClipboard(fg.value);
								}}
							>
								{fg.value}
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Gray -->
		<section>
			<h3 class="mb-3 text-sm font-medium text-gray-100">Gray</h3>
			<div
				class="group relative h-20 w-24 rounded transition-transform hover:scale-105"
				style="background-color: {gray.value}"
			>
				<div
					class="absolute inset-x-0 bottom-0 flex flex-col rounded-b bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<button
						class="w-full px-1 py-0.5 text-center text-[9px] font-medium text-gray-100 hover:bg-white/10"
						onclick={(e) => {
							e.stopPropagation();
							copyToClipboard(`var(${gray.name})`);
						}}
					>
						{gray.name}
					</button>
					<button
						class="w-full px-1 py-0.5 text-center text-[8px] text-gray-300 hover:bg-white/10"
						onclick={(e) => {
							e.stopPropagation();
							copyToClipboard(gray.value);
						}}
					>
						{gray.value}
					</button>
				</div>
			</div>
		</section>

		<!-- Accent Colors -->
		<section>
			<h3 class="mb-3 text-sm font-medium text-gray-100">Accent Colors</h3>
			<div class="space-y-2">
				<!-- Header row -->
				<div class="flex items-center gap-2">
					<span class="w-16"></span>
					<div class="flex flex-1 gap-1">
						<span class="flex-1 text-center text-[10px] text-gray-400">subtle</span>
						<span class="flex-1 text-center text-[10px] text-gray-400">muted</span>
						<span class="flex-1 text-center text-[10px] text-gray-400">dim</span>
						<span class="flex-1 text-center text-[10px] text-gray-400">base</span>
					</div>
				</div>

				{#each accents as accent}
					{@const subtleToken = getTokenName(accent.name, "subtle")}
					{@const mutedToken = getTokenName(accent.name, "muted")}
					{@const dimToken = getTokenName(accent.name, "dim")}
					{@const baseToken = getTokenName(accent.name, "base")}

					<div class="flex items-center gap-2">
						<span class="w-16 text-xs text-gray-400">{accent.name}</span>
						<div class="flex flex-1 gap-1">
							<!-- Subtle -->
							<div
								class="group relative h-14 flex-1 rounded transition-transform hover:scale-105"
								style="background-color: {accent.subtle}"
							>
								<div
									class="absolute inset-x-0 bottom-0 flex flex-col rounded-b bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] font-medium text-gray-100 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(`var(${subtleToken})`);
										}}
									>
										{subtleToken}
									</button>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] text-gray-300 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(accent.subtle);
										}}
									>
										{accent.subtle}
									</button>
								</div>
							</div>

							<!-- Muted -->
							<div
								class="group relative h-14 flex-1 rounded transition-transform hover:scale-105"
								style="background-color: {accent.muted}"
							>
								<div
									class="absolute inset-x-0 bottom-0 flex flex-col rounded-b bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] font-medium text-gray-100 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(`var(${mutedToken})`);
										}}
									>
										{mutedToken}
									</button>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] text-gray-300 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(accent.muted);
										}}
									>
										{accent.muted}
									</button>
								</div>
							</div>

							<!-- Dim -->
							<div
								class="group relative h-14 flex-1 rounded transition-transform hover:scale-105"
								style="background-color: {accent.dim}"
							>
								<div
									class="absolute inset-x-0 bottom-0 flex flex-col rounded-b bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] font-medium text-gray-100 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(`var(${dimToken})`);
										}}
									>
										{dimToken}
									</button>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] text-gray-300 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(accent.dim);
										}}
									>
										{accent.dim}
									</button>
								</div>
							</div>

							<!-- Base -->
							<div
								class="group relative h-14 flex-1 rounded transition-transform hover:scale-105"
								style="background-color: {accent.base}"
							>
								<div
									class="absolute inset-x-0 bottom-0 flex flex-col rounded-b bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] font-medium text-gray-100 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(`var(${baseToken})`);
										}}
									>
										{baseToken}
									</button>
									<button
										class="w-full px-0.5 py-0.5 text-center text-[7px] text-gray-300 hover:bg-white/10"
										onclick={(e) => {
											e.stopPropagation();
											copyToClipboard(accent.base);
										}}
									>
										{accent.base}
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
</Preview>

<!-- Toast notifications -->
<div {...toaster.root} class="fixed !bottom-4 !right-4 z-[9999] flex w-[280px] flex-col">
	{#each toaster.toasts as toast (toast.id)}
		<div
			{...toast.content}
			class="relative flex w-full flex-col justify-center rounded-lg bg-[#3c3836] px-4 py-3 text-left shadow-lg"
			in:fly={{ y: 40, opacity: 0.9 }}
			out:fly={{ y: 20 }}
		>
			<h3 {...toast.title} class="text-xs font-medium text-[#a89984]">Copied</h3>
			<div {...toast.description} class="font-mono text-sm text-[#ebdbb2]">
				{toast.data.message}
			</div>
			<button
				{...toast.close}
				aria-label="dismiss toast"
				class="absolute right-2 top-2 text-[#665c54] hover:text-[#a89984]"
			>
				<Close class="h-3.5 w-3.5" />
			</button>
		</div>
	{/each}
</div>

<style>
	:global([popover]) {
		inset: unset;
	}

	[data-melt-toaster-root] {
		overflow: visible;
		background: unset;
		padding: 0;
	}
</style>
