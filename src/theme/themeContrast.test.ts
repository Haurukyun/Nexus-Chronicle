import { describe, it, expect } from 'vitest';
import { sovereignTheme, wikiTheme, royalCodexTheme } from './themeRegistry';

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB hex color.
 */
function getLuminance(hex: string): number {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculates WCAG 2.1 contrast ratio between two hex colors.
 */
function getContrastRatio(hex1: string, hex2: string): number {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

describe('Theme Contrast & WCAG Compliance', () => {
    it('Sovereign Theme has high contrast accent on dark background (>= 7:1)', () => {
        // bg #070b14 vs accent #fef08a
        const ratio = getContrastRatio('#070b14', sovereignTheme.colors.accentHex);
        expect(ratio).toBeGreaterThanOrEqual(7);
    });

    it('Wiki Theme has high contrast accent on parchment background (>= 4.5:1)', () => {
        // bg #f4eedb vs accent #b91c1c
        const ratio = getContrastRatio('#f4eedb', wikiTheme.colors.accentHex);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Royal Codex has high contrast text and accent on parchment (>= 4.5:1)', () => {
        // bg #eee2cb vs deep crimson text #3d0a10 and accent #70121e
        const headingRatio = getContrastRatio('#eee2cb', '#3d0a10');
        const accentRatio = getContrastRatio('#eee2cb', royalCodexTheme.colors.accentHex);

        expect(headingRatio).toBeGreaterThanOrEqual(7); // AAA
        expect(accentRatio).toBeGreaterThanOrEqual(4.5); // AA
    });

    it('Royal Codex never uses yellow #fef08a on parchment backgrounds', () => {
        const yellowRatio = getContrastRatio('#eee2cb', '#fef08a');
        // Yellow on parchment is illegible (~1.1:1). Assert royalCodex does NOT use it as textAccent.
        expect(royalCodexTheme.colors.textAccent).not.toContain('#fef08a');
        expect(yellowRatio).toBeLessThan(2.0); // Verifying that yellow would have failed
    });
});
