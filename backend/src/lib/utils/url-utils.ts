/**
 * URL utilities - file name extraction and URL parsing
 * Migrated from backend/src/api/utils.ts
 */

import * as path from 'path';

/**
 * Get file name from URL
 */
export function getFileNameFromUrl(url: string): string {
    const urlObj = new URL(url);
    let fileName = path.basename(urlObj.pathname);

    // Remove query string if present
    const queryStringIndex = fileName.indexOf('?');
    if (queryStringIndex !== -1) {
        fileName = fileName.slice(0, queryStringIndex);
    }

    // Append .json if the file extension is missing
    const extension = path.extname(fileName);
    if (extension === '') {
        fileName += '.json';
    }

    return fileName;
}

