/**
 * Runtime configuration - paths and environment variables
 * Migrated from backend_old/src/config.ts (path-related parts)
 */

import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Project root directory (backend directory)
 */
export const projectRoot: string = path.resolve(path.dirname(path.dirname(__dirname)));

/**
 * Assets root path
 */
export const assetsRootPath: string = path.join(projectRoot, '/assets');

/**
 * Config files directory path
 */
export const configPath: string = path.join(projectRoot, '/config');

/**
 * Fuzzy search config file path
 */
export const fuzzySearchPath = path.join(configPath, '/fuzzy_search_settings.json');

/**
 * Car keyword config file path
 */
export const carKeywordPath = path.join(configPath, '/car_keyword.json');

/**
 * Cache root directory path
 */
export const cacheRootPath: string = path.join(projectRoot, '/cache');

/**
 * Backend server port (from environment variable)
 */
export const BACKEND_PORT: number = parseInt(process.env.BACKEND_PORT || '3000', 10);

/**
 * MongoDB connection URI (from environment variable)
 */
export const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017';

/**
 * MongoDB database name (from environment variable)
 */
export const MONGO_DB_NAME: string = process.env.MONGO_DB_NAME || 'tsugu';

/**
 * Whether to use local database (from environment variable)
 */
export const LOCAL_DB: boolean = process.env.LOCAL_DB === 'true';

/**
 * Whether to enable article generation endpoints (from environment variable)
 */
export const ARTICLE: boolean = process.env.ARTICLE === 'true';

/**
 * Whether to use BandoriStation (from environment variable)
 */
export const USE_BANDORISTATION: boolean = process.env.USE_BANDORISTATION === 'true';

