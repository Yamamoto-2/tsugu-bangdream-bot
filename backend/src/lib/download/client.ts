/**
 * HTTP client wrapper for downloading files
 * Encapsulates axios calls with error handling
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    responseType?: 'arraybuffer' | 'json' | 'text';
}

/**
 * Response with data and headers
 */
export interface BinaryResponse {
    data: Buffer;
    headers: Record<string, string>;
    status: number;
}

/**
 * Request binary data from URL
 */
export async function requestBinary(url: string, options: RequestOptions = {}): Promise<BinaryResponse> {
    const config: AxiosRequestConfig = {
        url,
        method: 'GET',
        headers: options.headers || {},
        responseType: options.responseType || 'arraybuffer',
        timeout: options.timeout,
    };

    try {
        const response: AxiosResponse<ArrayBuffer> = await axios(config);
        return {
            data: Buffer.from(response.data),
            headers: response.headers as Record<string, string>,
            status: response.status,
        };
    } catch (error: any) {
        if (error.response) {
            // Server responded with error status - throw error with response info
            const err: any = new Error(`HTTP ${error.response.status}: Failed to download from "${url}"`);
            err.response = error.response;
            throw err;
        } else if (error.request) {
            // Request made but no response received
            throw new Error(`Network error: Failed to download from "${url}"`);
        } else {
            // Error setting up request
            throw new Error(`Request setup error: ${error.message}`);
        }
    }
}

/**
 * Response with JSON data and headers
 */
export interface JsonResponse<T> {
    data: T;
    headers: Record<string, string>;
    status: number;
}

/**
 * Request JSON data from URL
 */
export async function requestJson<T = any>(url: string, options: RequestOptions = {}): Promise<JsonResponse<T>> {
    const config: AxiosRequestConfig = {
        url,
        method: 'GET',
        headers: options.headers || {},
        responseType: options.responseType || 'json',
        timeout: options.timeout,
    };

    try {
        const response: AxiosResponse<T> = await axios(config);
        return {
            data: response.data,
            headers: response.headers as Record<string, string>,
            status: response.status,
        };
    } catch (error: any) {
        if (error.response) {
            // Server responded with error status - throw error with response info
            const err: any = new Error(`HTTP ${error.response.status}: Failed to download JSON from "${url}"`);
            err.response = error.response;
            throw err;
        } else if (error.request) {
            throw new Error(`Network error: Failed to download JSON from "${url}"`);
        } else {
            throw new Error(`Request setup error: ${error.message}`);
        }
    }
}
