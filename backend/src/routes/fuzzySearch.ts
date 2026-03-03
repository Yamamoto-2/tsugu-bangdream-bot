/**
 * Fuzzy Search route
 * Accepts keyword text or pre-computed FuzzySearchResult,
 * returns a dictionary of matched types → ID/value arrays.
 *
 * This is a standalone utility endpoint — callers use the result
 * to request specific schema APIs (event/list, card/list, etc.).
 */

import express from 'express';
import { body } from 'express-validator';
import { Request, Response } from 'express';
import { fuzzySearch, isFuzzySearchResult, loadConfig } from '@/lib/fuzzy-search';
import type { FuzzySearchResult } from '@/lib/fuzzy-search';

const router = express.Router();

/**
 * POST /v1/fuzzySearch
 *
 * Body:
 *   - text: string              (keyword text, will be parsed into FuzzySearchResult)
 *   - fuzzySearchResult?: object (pre-computed result from bot/client, skips parsing)
 *
 * Response:
 *   { status: 'success', data: FuzzySearchResult }
 *   e.g. { status: 'success', data: { event: [200, 150], character: [5], _number: [200] } }
 */
router.post('/v1/fuzzySearch',
    [
        body('text').optional().isString(),
        body('fuzzySearchResult').optional().custom(isFuzzySearchResult),
    ],
    async (req: Request, res: Response) => {
        const { text, fuzzySearchResult } = req.body;

        try {
            let result: FuzzySearchResult;

            if (fuzzySearchResult) {
                // Bot/client already computed the result locally
                result = fuzzySearchResult;
            } else if (text && text.trim()) {
                // Parse keyword text into FuzzySearchResult
                const config = loadConfig();
                result = fuzzySearch(text.trim(), config);
            } else {
                return res.status(400).json({
                    status: 'failed',
                    data: 'Either "text" or "fuzzySearchResult" is required',
                });
            }

            res.json({ status: 'success', data: result });
        } catch (e: any) {
            console.error('fuzzySearch error:', e);
            res.status(500).json({ status: 'failed', data: '内部错误' });
        }
    }
);

export { router as fuzzySearchRouter };
