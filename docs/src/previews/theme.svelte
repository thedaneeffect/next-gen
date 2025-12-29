<script lang="ts">
	import Preview from "@components/preview.svelte";

	type ColorScale = {
		name: string;
		slug: string;
		colors: { step: number; value: string }[];
		mutedColors?: { step: number; value: string }[];
	};

	const TAILWIND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

	// Neutrals (no muted variants)
	const neutrals: ColorScale[] = ["Slate", "Gray", "Zinc", "Neutral", "Stone"].map((name) => ({
		name,
		slug: name.toLowerCase(),
		colors: TAILWIND_SHADES.map((step) => ({
			step,
			value: `var(--${name.toLowerCase()}-${step})`,
		})),
	}));

	// Accents (with muted variants)
	const accents: ColorScale[] = [
		"Red",
		"Rose",
		"Pink",
		"Fuchsia",
		"Purple",
		"Violet",
		"Indigo",
		"Blue",
		"Sky",
		"Cyan",
		"Teal",
		"Emerald",
		"Green",
		"Lime",
		"Yellow",
		"Amber",
		"Orange",
	].map((name) => ({
		name,
		slug: name.toLowerCase(),
		colors: TAILWIND_SHADES.map((step) => ({
			step,
			value: `var(--${name.toLowerCase()}-${step})`,
		})),
		mutedColors: TAILWIND_SHADES.map((step) => ({
			step,
			value: `var(--${name.toLowerCase()}-muted-${step})`,
		})),
	}));

	let showMuted = $state(true);
</script>

<Preview>
	<div class="w-full space-y-8 p-6">
		<!-- Info header -->
		<div class="rounded-lg bg-[var(--surface)] p-4 text-sm">
			<h2 class="text-base font-semibold text-[var(--text)]">Tailwind Gruvbox Edition</h2>
			<p class="mt-2 text-xs text-[var(--text-muted)]">
				Complete Tailwind-compatible color system with 429 colors across 22 families. Each color has
				11 shades (50-950) generated using OKLab for perceptual uniformity. Base colors are at
				<code class="rounded bg-[var(--background-elevated)] px-1 py-0.5">500</code>.
			</p>
			<div class="mt-3 flex items-center gap-2">
				<label class="flex cursor-pointer items-center gap-2 text-xs">
					<input type="checkbox" bind:checked={showMuted} class="cursor-pointer" />
					<span>Show muted variants (50% saturation)</span>
				</label>
			</div>
		</div>

		<!-- Neutrals Section -->
		<section>
			<h3 class="mb-4 text-lg font-bold text-[var(--text)]">
				Neutrals <span class="text-sm font-normal text-[var(--text-muted)]">(5 families)</span>
			</h3>
			<div class="space-y-4">
				{#each neutrals as scale}
					<div>
						<h4 class="mb-2 text-sm font-semibold text-[var(--text-muted)]">{scale.name}</h4>
						<div class="flex gap-1">
							{#each scale.colors as { step, value }}
								<div class="flex flex-col items-center gap-1" title="{scale.slug}-{step}: {value}">
									<div class="h-8 w-8 rounded" style="background-color: {value}"></div>
									<div
										class="text-center text-[8px] text-[var(--text-muted)]"
										class:font-bold={step === 500}
									>
										{step}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Accents Section -->
		<section>
			<h3 class="mb-4 text-lg font-bold text-[var(--text)]">
				Accents <span class="text-sm font-normal text-[var(--text-muted)]">(17 families)</span>
			</h3>
			<div class="space-y-4">
				{#each accents as scale}
					<div>
						<h4 class="mb-2 text-sm font-semibold text-[var(--text-muted)]">
							{scale.name}
							{#if showMuted && scale.mutedColors}
								<span class="text-xs font-normal opacity-60">+ muted</span>
							{/if}
						</h4>

						<!-- Regular colors -->
						<div class="flex gap-1">
							{#each scale.colors as { step, value }}
								<div class="flex flex-col items-center gap-1" title="{scale.slug}-{step}: {value}">
									<div class="h-8 w-8 rounded" style="background-color: {value}"></div>
									<!-- Muted color if enabled (stacked below) -->
									{#if showMuted && scale.mutedColors}
										{@const mutedValue = scale.mutedColors.find((m) => m.step === step)?.value}
										{#if mutedValue}
											<div
												class="h-6 w-8 rounded"
												style="background-color: {mutedValue}"
												title="{scale.slug}-muted-{step}"
											></div>
										{/if}
									{/if}
									<div
										class="text-center text-[8px] text-[var(--text-muted)]"
										class:font-bold={step === 500}
									>
										{step}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Usage examples -->
		<section
			class="mt-12 space-y-6 rounded-lg border border-[var(--border)] bg-[var(--background-elevated)] p-6"
		>
			<div>
				<h3 class="mb-4 text-lg font-bold text-[var(--text)]">Usage Examples</h3>
				<div class="space-y-6">
					<!-- Example 1: Tailwind Classes -->
					<div>
						<p class="mb-2 text-xs font-semibold text-[var(--text-muted)]">Tailwind Classes</p>
						<div class="space-y-2">
							<button
								class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-orange-600"
							>
								Primary Button
							</button>
							<pre
								class="overflow-x-auto rounded bg-[var(--background)] p-3 text-[10px] text-[var(--text-muted)]"><code
									>{`class="bg-orange-500 text-stone-950 hover:bg-orange-600"`}</code
								></pre>
						</div>
					</div>

					<!-- Example 2: CSS Variables -->
					<div>
						<p class="mb-2 text-xs font-semibold text-[var(--text-muted)]">CSS Variables</p>
						<div
							class="rounded-lg border p-3 text-sm"
							style="background: var(--red-muted-200); color: var(--red-700); border-color: var(--red-muted-400)"
						>
							<strong>Error:</strong> Something went wrong
						</div>
						<pre
							class="mt-2 overflow-x-auto rounded bg-[var(--background)] p-3 text-[10px] text-[var(--text-muted)]"><code
								>{`style="background: var(--red-muted-200); 
       color: var(--red-700); 
       border-color: var(--red-muted-400)"`}</code
							></pre>
					</div>

					<!-- Example 3: Muted Variants -->
					<div>
						<p class="mb-2 text-xs font-semibold text-[var(--text-muted)]">
							Muted Variants (Subtle Backgrounds)
						</p>
						<div class="flex gap-2">
							<span
								class="inline-block rounded-full px-3 py-1 text-xs font-medium"
								style="background: var(--green-muted-300); color: var(--green-700);"
							>
								Success
							</span>
							<span
								class="inline-block rounded-full px-3 py-1 text-xs font-medium"
								style="background: var(--blue-muted-300); color: var(--blue-700);"
							>
								Info
							</span>
							<span
								class="inline-block rounded-full px-3 py-1 text-xs font-medium"
								style="background: var(--yellow-muted-300); color: var(--yellow-700);"
							>
								Warning
							</span>
						</div>
						<pre
							class="mt-2 overflow-x-auto rounded bg-[var(--background)] p-3 text-[10px] text-[var(--text-muted)]"><code
								>{`style="background: var(--green-muted-300); color: var(--green-700)"`}</code
							></pre>
					</div>
				</div>
			</div>
		</section>
	</div>
</Preview>

<style>
	:global([popover]) {
		inset: unset;
	}
</style>
