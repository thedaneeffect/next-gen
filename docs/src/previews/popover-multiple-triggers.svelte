<script lang="ts">
	import { objectEntries } from "@antfu/utils";
	import Preview from "@components/preview.svelte";
	import { mergeAttrs } from "melt";
	import { Popover } from "melt/builders";

	const popover = new Popover({
		forceVisible: true,
		focus: {
			trap: true,
		},
	});

	let activeTrigger = $state<string | null>(null);

	type TriggerData = {
		label: string;
		icon: string;
		content: {
			title: string;
			description: string;
			actions: string[];
		};
	};

	const triggerData: Record<string, TriggerData> = {
		user: {
			label: "User Profile",
			icon: "👤",
			content: {
				title: "User Settings",
				description: "Manage your account preferences and profile information.",
				actions: ["Edit Profile", "Change Password", "Privacy Settings"],
			},
		},
		notifications: {
			label: "Notifications",
			icon: "🔔",
			content: {
				title: "Notification Center",
				description: "You have 3 unread notifications and 2 pending updates.",
				actions: ["Mark All Read", "Settings", "Disable"],
			},
		},
		help: {
			label: "Help & Support",
			icon: "❓",
			content: {
				title: "Help Center",
				description: "Get assistance with common questions and troubleshooting.",
				actions: ["View FAQ", "Contact Support", "Report Bug"],
			},
		},
	};
</script>

<Preview>
	<div class="flex flex-col items-center gap-6">
		<div class="flex gap-4">
			{#each objectEntries(triggerData) as [key, data]}
				<button
					class="btn btn-secondary block"
					{...mergeAttrs(popover.trigger, {
						onclick: () => (activeTrigger = key),
					})}
				>
					<span>{data.icon}</span>
					{data.label}
				</button>
			{/each}
		</div>

		<p class="text-sm text-[var(--text-muted)]">
			Click any button to see contextual content in the shared popover.
		</p>
	</div>

	<div
		class="w-[280px] overflow-visible rounded-2xl bg-[var(--surface)] p-4 shadow-xl"
		{...popover.content}
	>
		{#if activeTrigger && triggerData[activeTrigger]}
			{@const data = triggerData[activeTrigger].content}
			<div class="mb-3 flex items-center gap-2">
				<span class="text-xl">{triggerData[activeTrigger].icon}</span>
				<h3 class="text-lg font-semibold text-[var(--text)]">{data.title}</h3>
			</div>
			<p class="mb-4 text-sm text-[var(--text-muted)]">
				{data.description}
			</p>
			<div class="flex flex-col gap-1">
				{#each data.actions as action}
					<button
						class="bg-transparent text-left text-sm text-[var(--text)] underline transition-colors hover:opacity-75 active:opacity-50"
					>
						{action}
					</button>
				{/each}
			</div>
		{:else}
			<p class="text-center text-[var(--text-muted)]">Click a trigger to see contextual content</p>
		{/if}
	</div>
</Preview>

<style>
	[data-melt-popover-content] {
		position: absolute;
		pointer-events: none;
		opacity: 0;

		transform: scale(0.9);

		transition: 0.3s;
		transition-property: opacity, transform;
	}

	[data-melt-popover-content][data-open] {
		pointer-events: auto;
		opacity: 1;

		transform: scale(1);
	}
</style>
