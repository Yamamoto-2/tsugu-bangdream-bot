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

export interface EventDetailParams {
  eventId: number;
  displayedServerList?: number[];
  imageMode?: 'url' | 'base64';
}

export interface EventPreviewParams {
  eventId: number;
  displayedServerList?: number[];
}

/**
 * 获取活动详情 Schema
 */
export async function getEventDetail(params: EventDetailParams): Promise<SchemaNode> {
  const response = await apiClient.post('/v5/event/detail', params);
  return response.data;
}

/**
 * 获取活动预览 Schema
 */
export async function getEventPreview(params: EventPreviewParams): Promise<SchemaNode> {
  const response = await apiClient.post('/v5/event/preview', params);
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
