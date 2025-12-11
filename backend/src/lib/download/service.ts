/**
 * Download service - unified API for downloading files
 * Migrated from backend/src/api/downloader.ts, downloadFile.ts, downloadFileCache.ts
 */

import * as path from 'path';
import { requestBinary, requestJson } from './client';
import { readCacheIfValid, readETag, writeCache, isNotModified } from './file-cache';
import { getCacheDirectory } from '../utils/path-utils';
import { getFileNameFromUrl } from '../utils/url-utils';

// 错误 URL 列表和错误缓存过期时间
const errUrl: { [key: string]: number } = {};
const ERROR_CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Default error image buffer (1x1 transparent PNG)
 */
const DEFAULT_ERROR_BUFFER = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

export interface DownloadOptions {
    /** Cache directory (auto-generated from URL if not provided) */
    directory?: string;
    /** File name (auto-generated from URL if not provided) */
    fileName?: string;
    /** Cache TTL in milliseconds (0 = always use cache if exists, Infinity = never expire) */
    cacheTime?: number;
    /** Whether to overwrite existing cache */
    overwrite?: boolean;
    /** Number of retry attempts */
    retryCount?: number;
    /** Error image buffer for PNG/SVG fallback */
    assetErrorImageBuffer?: Buffer;
    /** Whether to ignore errors and return default image for images */
    ignoreErr?: boolean;
    /** Use ETag for cache validation */
    useETag?: boolean;
}

/**
 * Download binary file from URL
 */
export async function downloadBinary(url: string, options: DownloadOptions = {}): Promise<Buffer> {
    const {
        directory,
        fileName,
        cacheTime = 0,
        overwrite = false,
        retryCount = 3,
        assetErrorImageBuffer,
        ignoreErr = true,
        useETag = true,
    } = options;

    try {
        const currentTime = Date.now();
        if (url.includes('undefined')) {
            throw new Error("downloadBinary: url.includes('undefined')");
        }

        // Check error URL cache
        if (errUrl[url] && currentTime - errUrl[url] < ERROR_CACHE_EXPIRY) {
            throw new Error("downloadBinary: errUrl includes url and not expired");
        }

        // Determine cache directory and file name
        const cacheDir = directory || getCacheDirectory(url);
        const cacheFileName = fileName || getFileNameFromUrl(url);
        const cacheFilePath = path.join(cacheDir, cacheFileName);
        const etagFilePath = `${cacheFilePath}.etag`;

        // Determine cache TTL
        const ttlMs = overwrite ? 0 : (cacheTime === 0 ? Infinity : cacheTime * 1000);

        // Try to read from cache first
        if (!overwrite) {
            const cachedData = readCacheIfValid(cacheFilePath, ttlMs);
            if (cachedData) {
                return cachedData;
            }
        }

        // Read ETag if exists
        let eTag: string | undefined;
        if (useETag) {
            eTag = readETag(etagFilePath);
        }

        // Retry loop
        for (let attempt = 0; attempt < retryCount; attempt++) {
            let assetNotExists = false;
            if (attempt > 0) {
                console.log(`Retrying download for "${url}" (attempt ${attempt + 1}/${retryCount})`);
            }

            try {
                const headers: Record<string, string> = eTag ? { 'If-None-Match': eTag } : {};
                let response: Buffer;
                let responseETag: string | undefined;

                try {
                    const binaryResponse = await requestBinary(url, { headers });
                    response = binaryResponse.data;
                    responseETag = binaryResponse.headers.etag;
                } catch (error: any) {
                    // Handle 304 Not Modified
                    if (error.response && isNotModified(error.response.status)) {
                        const cachedData = readCacheIfValid(cacheFilePath);
                        if (cachedData) {
                            return cachedData;
                        }
                    }
                    throw error;
                }

                // Check if response is HTML (asset doesn't exist)
                if (response.toString().startsWith("<!DOCTYPE html>")) {
                    // Clean up invalid cache
                    try {
                        const fs = require('fs');
                        if (fs.existsSync(cacheFilePath)) {
                            fs.unlinkSync(cacheFilePath);
                        }
                    } catch {}
                    assetNotExists = true;
                    throw new Error("downloadBinary: data.toString().startsWith(\"<!DOCTYPE html>\")");
                }

                // Write to cache with ETag
                writeCache(cacheFilePath, response, responseETag);

                return response;
            } catch (e: any) {
                if (attempt === retryCount - 1) {
                    throw e;
                }
                if (assetNotExists) {
                    throw e;
                }
                // Wait 3 seconds before retry
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        throw new Error('Should not reach here');
    } catch (e: any) {
        console.error(`Failed to download file from "${url}". Error: ${e.message}`);

        // Record 404 errors
        if (e.message.includes('404')) {
            errUrl[url] = Date.now();
        }

        // Return default image for PNG/SVG if ignoreErr is true
        if ((url.includes('.png') || url.includes('.svg')) && ignoreErr) {
            return assetErrorImageBuffer || DEFAULT_ERROR_BUFFER;
        }

        throw e;
    }
}

/**
 * Download JSON file from URL
 */
export async function downloadJson<T = any>(url: string, options: DownloadOptions = {}): Promise<T> {
    const {
        directory,
        fileName,
        cacheTime = 0,
        overwrite = false,
        useETag = true,
    } = options;

    try {
        // Determine cache directory and file name
        const cacheDir = directory || getCacheDirectory(url);
        const cacheFileName = fileName || getFileNameFromUrl(url);
        const cacheFilePath = path.join(cacheDir, cacheFileName);
        const etagFilePath = `${cacheFilePath}.etag`;

        // Determine cache TTL
        const ttlMs = overwrite ? 0 : (cacheTime === 0 ? Infinity : cacheTime * 1000);

        // Try to read from cache first
        if (!overwrite) {
            const cachedData = readCacheIfValid(cacheFilePath, ttlMs);
            if (cachedData) {
                return JSON.parse(cachedData.toString('utf-8'));
            }
        }

        // Read ETag if exists
        let eTag: string | undefined;
        if (useETag) {
            eTag = readETag(etagFilePath);
        }

        const headers: Record<string, string> = eTag ? { 'If-None-Match': eTag } : {};
        let jsonData: T;
        let responseETag: string | undefined;

        try {
            const jsonResponse = await requestJson<T>(url, { headers });
            jsonData = jsonResponse.data;
            responseETag = jsonResponse.headers.etag;
        } catch (error: any) {
            // Handle 304 Not Modified
            if (error.response && isNotModified(error.response.status)) {
                const cachedData = readCacheIfValid(cacheFilePath);
                if (cachedData) {
                    return JSON.parse(cachedData.toString('utf-8'));
                }
            }
            throw error;
        }

        // Write to cache with ETag
        writeCache(cacheFilePath, JSON.stringify(jsonData, null, 2), responseETag);

        return jsonData;
    } catch (e: any) {
        throw new Error(`Failed to download JSON data from "${url}". Error: ${e.message}`);
    }
}

/**
 * Download file with retry logic (alias for downloadBinary with retry)
 */
export async function downloadWithRetry(url: string, options: DownloadOptions = {}): Promise<Buffer> {
    return downloadBinary(url, { ...options, retryCount: options.retryCount || 3 });
}
