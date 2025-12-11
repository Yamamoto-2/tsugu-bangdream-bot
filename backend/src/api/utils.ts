/**
 * API utilities - Cache directory and file name helpers
 * Migrated from backend_old/src/api/utils.ts
 * 
 * TODO: cacheRootPath should come from config/runtime.ts
 */

import * as path from 'path'

/**
 * Get cache directory path from URL
 */
export function getCacheDirectory(url: string, cacheRootPath?: string): string {
    // Import from config/runtime.ts if not provided
    if (!cacheRootPath) {
        const { cacheRootPath: configCacheRoot } = require('@/config/runtime');
        cacheRootPath = configCacheRoot;
    }
    const defaultCacheRoot = cacheRootPath || path.join(process.cwd(), 'cache')
    
    const urlObj = new URL(url);
    var pathname = urlObj.pathname;
    // 如果结尾是文件名，去掉文件名
    if (path.basename(pathname).indexOf('.') != -1) {
        pathname = path.dirname(pathname);
    }
    var cacheDir = path.join(urlObj.host, pathname, urlObj.search);
    // 处理非法字符
    cacheDir = sanitizeDirectoryName(cacheDir);

    return path.join(defaultCacheRoot, cacheDir);
}

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

/**
 * Sanitize directory name by replacing illegal characters
 */
function sanitizeDirectoryName(dirName: string): string {
    const illegalChars = /[/?<>:*|"]/g;
    const replacementChar = '_';

    return dirName.replace(illegalChars, replacementChar);
}

