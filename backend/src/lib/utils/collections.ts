/**
 * Collection utilities - data structures
 * Migrated from backend/src/types/utils.ts
 */

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

