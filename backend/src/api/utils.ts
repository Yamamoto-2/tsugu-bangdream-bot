import { cacheRootPath } from '@/config';
import * as path from 'path';


export function getCacheDirectory(url: string): string {
    const urlObj = new URL(url);
    var pathname = urlObj.pathname;
    // 如果结尾是文件名，去掉文件名
    if (path.basename(pathname).indexOf('.') != -1) {
        pathname = path.dirname(pathname);
    }
    var cacheDir = path.join(urlObj.host, pathname, urlObj.search);
    // 处理非法字符
    cacheDir = sanitizeDirectoryName(cacheDir);

    return path.join(cacheRootPath, cacheDir);
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

function sanitizeDirectoryName(dirName: string): string {
    const illegalChars = /[/?<>:*|"]/g; // 定义非法字符的正则表达式
    const replacementChar = '_'; // 替代非法字符的字符

    return dirName.replace(illegalChars, replacementChar);
}