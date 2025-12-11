/**
 * Fuzzy search parser - keyword parsing and normalization
 */

/**
 * Check if string is an integer
 */
export function isInteger(str: string): boolean {
    const regex = /^(0|[1-9]\d*)$/;
    return regex.test(str);
}

/**
 * Extract level number from string (e.g., "lv25" -> 25)
 */
export function extractLvNumber(str: string): number | null {
    const regex = /^lv(\d+)$/i;
    const match = str.match(regex);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return null;
}

/**
 * Normalize keyword by replacing HTML entities and special characters
 */
export function normalizeKeyword(keyword: string): string {
    let normalized = keyword.toLowerCase();
    // Replace HTML entities
    normalized = normalized.replace(/&gt;/g, '>');
    normalized = normalized.replace(/&lt;/g, '<');
    // Replace full-width characters
    normalized = normalized.replace(/＞/g, '>');
    normalized = normalized.replace(/＜/g, '<');
    return normalized;
}

/**
 * Parse keyword string into keyword list
 * Supports quoted strings and space-separated keywords
 */
export function parseKeywords(keyword: string): string[] {
    // Match quoted strings or space-separated words
    const keywordList = (keyword.match(/["""『』「」]([^"""『』「」]+)["""『』「」]|\S+/g) || []).map(item =>
        item.replace(/^[\"""『』「」]|[\"""『』「」]$/g, '')
    );
    return keywordList;
}

