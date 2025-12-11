/**
 * Number utilities - number formatting and conversion
 * Migrated from backend/src/types/utils.ts
 */

/**
 * Format number to string with leading zeros
 */
export function formatNumber(num: number, length: number): string {
    const str = num.toString();
    if (str.length < length) {
        return str.padStart(length, '0');
    }
    return str;
}

/**
 * Convert string array to number array, preserving null values
 */
export function stringToNumberArray(stringArray: Array<string | null>): Array<number | null> {
    let numberArray: Array<number | null> = []
    for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i] == null) {
            numberArray.push(null)
        }
        else {
            numberArray.push(Number(stringArray[i]))
        }
    }
    return numberArray
}

