/**
 * Path utilities - cache directory and path sanitization
 * Migrated from backend/src/api/utils.ts
 */

import * as path from 'path';
import { cacheRootPath } from '@/lib/config/runtime-loader';

/**
 * Sanitize directory name by replacing illegal characters
 */
export function sanitizeDirectoryName(dirName: string): string {
    const illegalChars = /[/?<>:*|"]/g;
    const replacementChar = '_';

    return dirName.replace(illegalChars, replacementChar);
}

/**
 * Get cache directory path from URL
 */
export function getCacheDirectory(url: string, cacheRootPathOverride?: string): string {
    const defaultCacheRoot = cacheRootPathOverride || cacheRootPath || path.join(process.cwd(), 'cache');
    
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
