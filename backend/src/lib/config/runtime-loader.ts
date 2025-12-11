/**
 * Runtime configuration loader - unified entry point
 * Provides a single source of truth for runtime configuration from src/config/runtime.ts
 * 
 * This module centralizes config access to avoid scattered require() calls
 * and makes it easier to add caching or validation in the future.
 */

import {
  cacheRootPath,
  assetsRootPath,
  fuzzySearchPath,
  carKeywordPath,
  configPath,
  projectRoot,
  BACKEND_PORT,
  MONGO_URI,
  MONGO_DB_NAME,
  LOCAL_DB,
  ARTICLE,
  USE_BANDORISTATION,
} from '@/config/runtime';

/**
 * Runtime configuration interface
 */
export interface RuntimeConfig {
  cacheRootPath: string;
  assetsRootPath: string;
  fuzzySearchPath: string;
  carKeywordPath: string;
  configPath: string;
  projectRoot: string;
  BACKEND_PORT: number;
  MONGO_URI: string;
  MONGO_DB_NAME: string;
  LOCAL_DB: boolean;
  ARTICLE: boolean;
  USE_BANDORISTATION: boolean;
}

/**
 * Get runtime configuration
 * Currently just re-exports from config/runtime.ts, but provides a unified interface
 * for potential future enhancements (caching, validation, etc.)
 */
export function getRuntimeConfig(): RuntimeConfig {
  return {
    cacheRootPath,
    assetsRootPath,
    fuzzySearchPath,
    carKeywordPath,
    configPath,
    projectRoot,
    BACKEND_PORT,
    MONGO_URI,
    MONGO_DB_NAME,
    LOCAL_DB,
    ARTICLE,
    USE_BANDORISTATION,
  };
}

/**
 * Convenience exports for most commonly used config values
 */
export {
  cacheRootPath,
  assetsRootPath,
  fuzzySearchPath,
  carKeywordPath,
  configPath,
  projectRoot,
};

