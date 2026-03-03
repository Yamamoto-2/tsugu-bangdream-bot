/**
 * Fuzzy Search routes
 *
 * GET  /v1/fuzzySearch/config  — 返回配置文件 (支持 ETag 304)
 * POST /v1/fuzzySearch         — 接受 text，返回 FuzzySearchResult (给第三方开发者)
 */

import express from 'express';
import * as crypto from 'crypto';
import { body } from 'express-validator';
import { Request, Response } from 'express';
import { fuzzySearch, loadConfig } from '@/lib/fuzzy-search';
import type { FuzzySearchConfig } from '@/lib/fuzzy-search';

const router = express.Router();

// 启动时加载一次 config 并计算 ETag
let configCache: FuzzySearchConfig | null = null;
let configJson: string = '';
let configETag: string = '';

function ensureConfigLoaded() {
    if (!configCache) {
        configCache = loadConfig();
        configJson = JSON.stringify(configCache);
        configETag = '"' + crypto.createHash('md5').update(configJson).digest('hex') + '"';
    }
}

/**
 * GET /v1/fuzzySearch/config
 * 返回 fuzzy search 配置文件，支持 ETag 实现 304 缓存
 */
router.get('/v1/fuzzySearch/config',
    (req: Request, res: Response) => {
        try {
            ensureConfigLoaded();

            // 检查 If-None-Match
            const clientETag = req.headers['if-none-match'];
            if (clientETag === configETag) {
                return res.status(304).end();
            }

            res.setHeader('ETag', configETag);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Content-Type', 'application/json');
            res.send(configJson);
        } catch (e: any) {
            console.error('fuzzySearch config error:', e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

/**
 * POST /v1/fuzzySearch
 * 接受 raw text，返回 FuzzySearchResult
 * 给第三方开发者使用（不想自己实现 fuzzySearch 逻辑的场景）
 *
 * Body: { text: string }
 * Response: { status: 'success', data: FuzzySearchResult }
 */
router.post('/v1/fuzzySearch',
    [
        body('text').isString(),
    ],
    async (req: Request, res: Response) => {
        const { text } = req.body;

        try {
            if (!text || !text.trim()) {
                return res.status(400).json({
                    status: 'failed',
                    data: '"text" is required and must not be empty',
                });
            }

            ensureConfigLoaded();
            const result = fuzzySearch(text.trim(), configCache!);
            res.json({ status: 'success', data: result });
        } catch (e: any) {
            console.error('fuzzySearch error:', e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

export { router as fuzzySearchRouter };
