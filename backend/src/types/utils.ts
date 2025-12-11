/**
 * Type utilities - Pure functions only
 * Migrated from backend_old/src/types/utils.ts
 * Removed: File IO operations (readJSON, writeJSON, readExcelFile) - these should be in utils layer
 */

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
 * Stack data structure
 */
export class Stack<T> {
    stack: T[];
    private maxLength: number;

    constructor(maxLength: number) {
        this.stack = [];
        this.maxLength = maxLength;
    }

    push(item: T): void {
        this.stack.unshift(item);
        if (this.stack.length > this.maxLength) {
            this.stack.pop();
        }
    }

    pop(): T | undefined {
        return this.stack.shift();
    }

    isEmpty(): boolean {
        return this.stack.length === 0;
    }

    size(): number {
        return this.stack.length;
    }

    clear(): void {
        this.stack = [];
    }
}

