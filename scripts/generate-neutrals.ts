/**
 * Extract Tailwind's default neutral colors
 * These are the official Tailwind color values, unchanged
 */

// Tailwind v4 neutral colors (from tailwindcss/colors)
const TAILWIND_NEUTRALS = {
	slate: {
		50: "oklch(98.3% 0.004 250.531)",
		100: "oklch(96.6% 0.005 250.458)",
		200: "oklch(92.9% 0.009 250.473)",
		300: "oklch(87.8% 0.014 250.368)",
		400: "oklch(71% 0.02 250.469)",
		500: "oklch(54.7% 0.026 251.453)",
		600: "oklch(44% 0.029 252.612)",
		700: "oklch(37.3% 0.028 256.119)",
		800: "oklch(26.9% 0.023 257.281)",
		900: "oklch(20.5% 0.018 261.692)",
		950: "oklch(13% 0.013 264.695)",
	},
	gray: {
		50: "oklch(98.5% 0 0)",
		100: "oklch(96.9% 0 0)",
		200: "oklch(93.2% 0 0)",
		300: "oklch(88% 0 0)",
		400: "oklch(71.3% 0 0)",
		500: "oklch(55.1% 0 0)",
		600: "oklch(44.4% 0 0)",
		700: "oklch(37.6% 0 0)",
		800: "oklch(27.4% 0 0)",
		900: "oklch(21.1% 0 0)",
		950: "oklch(13.6% 0 0)",
	},
	zinc: {
		50: "oklch(98.4% 0.002 247.858)",
		100: "oklch(96.7% 0.004 247.896)",
		200: "oklch(92.9% 0.007 247.896)",
		300: "oklch(87.8% 0.011 264.364)",
		400: "oklch(71% 0.015 265.756)",
		500: "oklch(54.7% 0.018 256.803)",
		600: "oklch(43.9% 0.02 256.788)",
		700: "oklch(37.2% 0.019 259.733)",
		800: "oklch(27.4% 0.014 265.754)",
		900: "oklch(21% 0.01 280.358)",
		950: "oklch(13.4% 0.008 285.885)",
	},
	neutral: {
		50: "oklch(98.5% 0 0)",
		100: "oklch(96.9% 0 0)",
		200: "oklch(93.1% 0 0)",
		300: "oklch(87.9% 0 0)",
		400: "oklch(71.2% 0 0)",
		500: "oklch(55% 0 0)",
		600: "oklch(44.2% 0 0)",
		700: "oklch(37.4% 0 0)",
		800: "oklch(27.2% 0 0)",
		900: "oklch(20.9% 0 0)",
		950: "oklch(13.4% 0 0)",
	},
	stone: {
		50: "oklch(98.4% 0.002 106.424)",
		100: "oklch(96.7% 0.004 106.424)",
		200: "oklch(93% 0.006 85.873)",
		300: "oklch(88% 0.008 96.018)",
		400: "oklch(71.2% 0.011 77.558)",
		500: "oklch(55.1% 0.013 81.301)",
		600: "oklch(44.2% 0.012 75.961)",
		700: "oklch(37.4% 0.01 67.558)",
		800: "oklch(27.3% 0.007 34.298)",
		900: "oklch(21.1% 0.006 56.043)",
		950: "oklch(14.7% 0.004 49.25)",
	},
};

function generateCSS(): string {
	const lines: string[] = [
		"/* ===========================================",
		" * Tailwind Default Neutral Colors",
		" * Original Tailwind neutral colors (unchanged)",
		" * ",
		" * 5 families: slate, gray, zinc, neutral, stone",
		" * 11 shades each: 50 (lightest) → 950 (darkest)",
		" * =========================================== */",
		"",
		"@layer theme {",
		"	:root {",
	];

	const neutrals = ["slate", "gray", "zinc", "neutral", "stone"] as const;
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

	for (const neutral of neutrals) {
		lines.push("");
		lines.push(`		/* ${neutral.charAt(0).toUpperCase() + neutral.slice(1)} */`);
		for (const shade of shades) {
			const value = TAILWIND_NEUTRALS[neutral][shade];
			lines.push(`		--${neutral}-${shade}: ${value};`);
		}
	}

	lines.push("	}");
	lines.push("}");
	lines.push("");

	return lines.join("\n");
}

// Output
console.log(generateCSS());
