/**
 * Schema API 调用层
 */

import axios from 'axios';
import type { SchemaNode } from '@/core/types';

// API 基础 URL - 可通过环境变量配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ========== 模糊搜索配置 ==========

import type { FuzzySearchConfig, FuzzySearchResult } from '@/lib/fuzzy-search';
export type { FuzzySearchConfig, FuzzySearchResult };

let cachedConfig: FuzzySearchConfig | null = null;
let cachedETag: string | null = null;

/**
 * 获取 fuzzySearch 配置 (支持 ETag 304 缓存)
 * 首次调用从后端拉取，后续使用缓存 + 条件请求
 */
export async function getFuzzySearchConfig(): Promise<FuzzySearchConfig> {
  const headers: Record<string, string> = {};
  if (cachedETag) {
    headers['If-None-Match'] = cachedETag;
  }

  try {
    const response = await apiClient.get('/v1/fuzzySearch/config', { headers });
    cachedConfig = response.data;
    cachedETag = response.headers['etag'] || null;
    return cachedConfig!;
  } catch (e: any) {
    if (e.response?.status === 304 && cachedConfig) {
      return cachedConfig;
    }
    throw e;
  }
}

// ========== Schema API (返回 SchemaNode) ==========

export interface EventListParams {
  eventId?: number[];
  fuzzySearchResult?: FuzzySearchResult;
  displayedServerList?: number[];
}

export interface EventDetailParams {
  eventId: number;
  displayedServerList?: number[];
  imageMode?: 'url' | 'base64';
}

export interface EventPreviewParams {
  eventId: number;
  displayedServerList?: number[];
}

export interface SongDetailParams {
  songId: number;
  displayedServerList?: number[];
}

/**
 * 获取活动列表 Schema
 * - 传 eventId: 渲染指定活动 (number[])
 * - 传 fuzzySearchResult: 用模糊搜索结果过滤活动
 * - 都不传: 返回最近活动
 */
export async function getEventList(params: EventListParams = {}): Promise<SchemaNode> {
  const response = await apiClient.post('/v1/event/list', params);
  return response.data;
}

/**
 * 获取活动详情 Schema
 */
export async function getEventDetail(params: EventDetailParams): Promise<SchemaNode> {
  const response = await apiClient.post('/v1/event/detail', params);
  return response.data;
}

/**
 * 获取活动预览 Schema
 */
export async function getEventPreview(params: EventPreviewParams): Promise<SchemaNode> {
  const response = await apiClient.post('/v1/event/preview', params);
  return response.data;
}

/**
 * 获取歌曲详情 Schema
 */
export async function getSongDetail(params: SongDetailParams): Promise<SchemaNode> {
  const response = await apiClient.post('/v1/song/detail', params);
  return response.data;
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<{ status: string; version: string }> {
  const response = await apiClient.get('/health');
  return response.data;
}

export { apiClient };
