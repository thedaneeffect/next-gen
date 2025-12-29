// @ts-nocheck
import { formatHex, converter } from "culori";

/**
 * Tailwind Gruvbox Edition - Accent Color Generator
 * Generates 17 accent colors using Tailwind hues with Gruvbox-style saturation
 */

type ColorDef = {
	h: number;
	c: number;
	l: number;
};

const GRUVBOX_BASE: Record<string, ColorDef> = {
	red: { h: 25.3, c: 0.215, l: 0.66 },
	rose: { h: 16.4, c: 0.17, l: 0.67 },
	pink: { h: 354.3, c: 0.17, l: 0.67 },
	fuchsia: { h: 322.1, c: 0.19, l: 0.68 },
	purple: { h: 303.9, c: 0.16, l: 0.68 },
	violet: { h: 292.7, c: 0.16, l: 0.65 },
	indigo: { h: 277.1, c: 0.14, l: 0.63 },
	blue: { h: 259.8, c: 0.12, l: 0.66 },
	sky: { h: 237.3, c: 0.12, l: 0.7 },
	cyan: { h: 215.2, c: 0.11, l: 0.72 },
	teal: { h: 182.5, c: 0.11, l: 0.72 },
	emerald: { h: 162.5, c: 0.13, l: 0.72 },
	green: { h: 149.6, c: 0.15, l: 0.74 },
	lime: { h: 130.8, c: 0.18, l: 0.78 },
	yellow: { h: 86.0, c: 0.16, l: 0.82 },
	amber: { h: 70.1, c: 0.165, l: 0.78 },
	orange: { h: 47.6, c: 0.18, l: 0.73 },
} as const;

const TAILWIND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Generate an 11-step Tailwind-compatible color scale
 * 500 = base color, 50 = lightest, 950 = darkest
 */
function generateColorScale(baseColor: ColorDef, colorName: string): Record<string, string> {
	const toOklch = converter("oklch");
	const scale: Record<string, string> = {};

	const baseL = baseColor.l;
	const baseC = baseColor.c;
	const baseH = baseColor.h;

	const lightRange =
		baseL > 0.5
			? { lighter: 0.98 - baseL, darker: baseL - 0.05 }
			: { lighter: 0.95 - baseL, darker: baseL - 0.05 };
	const lightnessSteps: Record<number, number> = {
		50: Math.min(baseL + lightRange.lighter * 0.9, 0.98),
		100: Math.min(baseL + lightRange.lighter * 0.8, 0.95),
		200: Math.min(baseL + lightRange.lighter * 0.6, 0.92),
		300: Math.min(baseL + lightRange.lighter * 0.4, 0.88),
		400: Math.min(baseL + lightRange.lighter * 0.2, 0.82),
		500: baseL,
		600: Math.max(baseL - lightRange.darker * 0.2, 0.1),
		700: Math.max(baseL - lightRange.darker * 0.4, 0.08),
		800: Math.max(baseL - lightRange.darker * 0.6, 0.06),
		900: Math.max(baseL - lightRange.darker * 0.8, 0.05),
		950: Math.max(baseL - lightRange.darker * 0.95, 0.03),
	};

	for (const shade of TAILWIND_SHADES) {
		const lightness = lightnessSteps[shade];

		const color = {
			mode: "oklch",
			l: lightness,
			c: baseC,
			h: baseH,
		} as const;

		scale[`${colorName}-${shade}`] = formatHex(color);
	}

	return scale;
}

function generateMutedColorScale(baseColor: ColorDef, colorName: string): Record<string, string> {
	const toOklch = converter("oklch");
	const scale: Record<string, string> = {};

	const baseL = baseColor.l;
	const baseC = baseColor.c;
	const baseH = baseColor.h;

	const mutedChroma = baseC * 0.4;
	const darknessAdjust = 0.25;

	const lightRange =
		baseL > 0.5
			? { lighter: 0.98 - baseL, darker: baseL - 0.05 }
			: { lighter: 0.95 - baseL, darker: baseL - 0.05 };

	const lightnessSteps: Record<number, number> = {
		50: Math.max(Math.min(baseL + lightRange.lighter * 0.9, 0.98) - darknessAdjust, 0.05),
		100: Math.max(Math.min(baseL + lightRange.lighter * 0.8, 0.95) - darknessAdjust, 0.05),
		200: Math.max(Math.min(baseL + lightRange.lighter * 0.6, 0.92) - darknessAdjust, 0.05),
		300: Math.max(Math.min(baseL + lightRange.lighter * 0.4, 0.88) - darknessAdjust, 0.05),
		400: Math.max(Math.min(baseL + lightRange.lighter * 0.2, 0.82) - darknessAdjust, 0.05),
		500: Math.max(baseL - darknessAdjust, 0.05),
		600: Math.max(Math.max(baseL - lightRange.darker * 0.2, 0.1) - darknessAdjust, 0.03),
		700: Math.max(Math.max(baseL - lightRange.darker * 0.4, 0.08) - darknessAdjust, 0.03),
		800: Math.max(Math.max(baseL - lightRange.darker * 0.6, 0.06) - darknessAdjust, 0.03),
		900: Math.max(Math.max(baseL - lightRange.darker * 0.8, 0.05) - darknessAdjust, 0.03),
		950: Math.max(Math.max(baseL - lightRange.darker * 0.95, 0.03) - darknessAdjust, 0.03),
	};

	for (const shade of TAILWIND_SHADES) {
		const lightness = lightnessSteps[shade];

		const color = {
			mode: "oklch",
			l: lightness,
			c: mutedChroma,
			h: baseH,
		} as const;

		scale[`${colorName}-muted-${shade}`] = formatHex(color);
	}

	return scale;
}

function generateCSS() {
	const lines: string[] = [
		"/* ===========================================",
		" * Tailwind Gruvbox Edition - Accent Colors",
		" * Auto-generated Gruvbox-based colors",
		" * ",
		" * Note: Neutral colors (slate, gray, zinc, neutral, stone)",
		" * use Tailwind's original colors (imported separately)",
		" * ",
		" * 17 accent families:",
		" * - red, rose, pink, fuchsia, purple, violet, indigo",
		" * - blue, sky, cyan, teal, emerald, green, lime",
		" * - yellow, amber, orange",
		" * ",
		" * Each family has:",
		" * - 11 shades: 50 (lightest) → 950 (darkest)",
		" * - Muted variant: 40% saturation, 25% darker",
		" * =========================================== */",
		"",
		":root {",
	];

	const accents = [
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

	lines.push("");
	lines.push("	/* =========================================");
	lines.push("	 * ACCENTS");
	lines.push("	 * ========================================= */");

	for (const accent of accents) {
		lines.push("");
		lines.push(`	/* ${accent.charAt(0).toUpperCase() + accent.slice(1)} */`);
		const scale = generateColorScale(GRUVBOX_BASE[accent], accent);
		for (const shade of TAILWIND_SHADES) {
			const name = `${accent}-${shade}`;
			if (scale[name]) {
				lines.push(`	--${name}: ${scale[name]};`);
			}
		}
	}

	lines.push("");
	lines.push("	/* =========================================");
	lines.push("	 * MUTED VARIANTS (40% saturation, 25% darker)");
	lines.push("	 * For subtle backgrounds, borders, hover states");
	lines.push("	 * ========================================= */");

	for (const accent of accents) {
		lines.push("");
		lines.push(`	/* ${accent.charAt(0).toUpperCase() + accent.slice(1)} Muted */`);
		const mutedScale = generateMutedColorScale(GRUVBOX_BASE[accent], accent);
		for (const shade of TAILWIND_SHADES) {
			const name = `${accent}-muted-${shade}`;
			if (mutedScale[name]) {
				lines.push(`	--${name}: ${mutedScale[name]};`);
			}
		}
	}

	lines.push("}");
	lines.push("");

	return lines.join("\n");
}

// Generate and output
const css = generateCSS();
console.log(css);
