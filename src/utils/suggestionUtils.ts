/**
 * Merges built-in hardcoded suggestions with user-defined custom suggestions,
 * deduplicating by value (case-insensitive) and placing custom ones first.
 */
export function mergeSuggestions(builtIn: string[], custom: string[] = []): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    // Custom suggestions first
    for (const s of custom) {
        const key = s.trim().toLowerCase();
        if (key && !seen.has(key)) {
            seen.add(key);
            result.push(s.trim());
        }
    }
    // Then built-ins
    for (const s of builtIn) {
        const key = s.trim().toLowerCase();
        if (key && !seen.has(key)) {
            seen.add(key);
            result.push(s.trim());
        }
    }
    return result;
}
