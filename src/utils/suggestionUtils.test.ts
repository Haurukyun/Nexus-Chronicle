import { describe, it, expect } from 'vitest';
import { mergeSuggestions } from './suggestionUtils';

describe('mergeSuggestions', () => {
    it('returns builtIn when no custom suggestions', () => {
        const result = mergeSuggestions(['Brave', 'Cunning']);
        expect(result).toEqual(['Brave', 'Cunning']);
    });

    it('prepends custom suggestions before built-ins', () => {
        const result = mergeSuggestions(['Brave', 'Cunning'], ['Daring', 'Reckless']);
        expect(result).toEqual(['Daring', 'Reckless', 'Brave', 'Cunning']);
    });

    it('deduplicates case-insensitively, keeping custom first', () => {
        const result = mergeSuggestions(['Brave', 'Cunning', 'Loyal'], ['brave', 'Cunning', 'Daring']);
        expect(result).toEqual(['brave', 'Cunning', 'Daring', 'Loyal']);
    });

    it('handles empty built-in array', () => {
        const result = mergeSuggestions([], ['Custom One', 'Custom Two']);
        expect(result).toEqual(['Custom One', 'Custom Two']);
    });

    it('handles undefined custom suggestions', () => {
        const result = mergeSuggestions(['A', 'B'], undefined);
        expect(result).toEqual(['A', 'B']);
    });

    it('trims whitespace from suggestions', () => {
        const result = mergeSuggestions(['  Brave  '], ['  Daring  ']);
        expect(result).toEqual(['Daring', 'Brave']);
    });
});
