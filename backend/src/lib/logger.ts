/**
 * Logger utility
 * Migrated from backend/src/utils/logger.ts
 */

export function logger(type: string, message: any) {
    const requestTime = Date.now();
    const timeString = new Date(requestTime).toString().split(' ')[4];
    console.log(`[${timeString}] [${type}] ${message}`);
}

