/**
 * Generate Tailwind @theme block mappings
 * Maps CSS variables to Tailwind utility classes
 */

const TAILWIND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const NEUTRALS = ["slate", "gray", "zinc", "neutral", "stone"];

const ACCENTS = [
	"red",
	"rose",
	"pink",
	"fuchsia",
	"purple",
	"violet",
	"indigo",
	"blue",
	"sky",
	"cyan",
	"teal",
	"emerald",
	"green",
	"lime",
	"yellow",
	"amber",
	"orange",
];

function generateThemeMappings(): string {
	const lines: string[] = [
		"@theme {",
		"	/* ==========================================",
		"	 * Tailwind Gruvbox Edition Theme Mappings",
		"	 * Auto-generated - do not edit manually",
		"	 * ========================================== */",
		"",
	];

	// === NEUTRALS ===
	lines.push("	/* Neutrals */");
	for (const neutral of NEUTRALS) {
		for (const shade of TAILWIND_SHADES) {
			lines.push(`	--color-${neutral}-${shade}: var(--${neutral}-${shade});`);
		}
	}
	lines.push("");

	// === ACCENTS (regular) ===
	lines.push("	/* Accents */");
	for (const accent of ACCENTS) {
		for (const shade of TAILWIND_SHADES) {
			lines.push(`	--color-${accent}-${shade}: var(--${accent}-${shade});`);
		}
	}
	lines.push("");

	// === ACCENTS (muted variants) ===
	lines.push("	/* Muted Variants (custom Gruvbox addition) */");
	lines.push('	/* Usage: class="bg-red-muted-500" */');
	for (const accent of ACCENTS) {
		for (const shade of TAILWIND_SHADES) {
			lines.push(`	--color-${accent}-muted-${shade}: var(--${accent}-muted-${shade});`);
		}
	}

	lines.push("}");
	return lines.join("\n");
}

// Output
console.log(generateThemeMappings());
