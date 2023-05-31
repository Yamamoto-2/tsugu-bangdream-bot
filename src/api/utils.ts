import {cacheRootPath} from '../config';
import * as path from 'path';

export function getCacheDirectory(url: string): string {
    const urlObj = new URL(url);
    const cacheDir = path.join(cacheRootPath, urlObj.host, urlObj.pathname);

    return cacheDir;
}

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