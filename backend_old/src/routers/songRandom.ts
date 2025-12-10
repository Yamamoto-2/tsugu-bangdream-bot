import express from 'express';
import { body } from 'express-validator';
import { fuzzySearch, FuzzySearchResult, isFuzzySearchResult } from '@/fuzzySearch';
import { isInteger, listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';
import { drawSongRandom } from '@/view/songRandom';
import { Server } from '@/types/Server';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post(
    '/',
    [
        // Express-validator checks for type validation
        body('mainServer').custom((value) => {
            if (!isServer(value)) {
                throw new Error('mainServer must be a Server');
            }
            return true;
        }),
        body('fuzzySearchResult').optional().custom(isFuzzySearchResult),
        body('text').optional().isString(),
        body('useEasyBG').optional().isBoolean(),
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {
        const { mainServer, fuzzySearchResult, text, compress } = req.body;
        
        // 检查 text 和 fuzzySearchResult 是否同时存在
        if (text && fuzzySearchResult) {
            return res.status(422).json({ status: 'failed', data: 'text 与 fuzzySearchResult 不能同时存在' });
        }
        /*
        // 检查 text 和 fuzzySearchResult 是否同时不存在
        if (!text && !fuzzySearchResult) {
            return res.status(422).json({ status: 'failed', data: '不能同时不存在 text 与 fuzzySearchResult' });
        }
        */
        try {
            const result = await commandSongRandom(mainServer, text || fuzzySearchResult, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);


export async function commandSongRandom(mainServer: Server, input: string | FuzzySearchResult | null, compress: boolean): Promise<Array<Buffer | string>> {
    let fuzzySearchResult: FuzzySearchResult
    // 根据 input 的类型执行不同的逻辑
    if (typeof input === 'string') {
        fuzzySearchResult = fuzzySearch(input)
    } else if (fuzzySearchResult) {
        // 使用 fuzzySearch 逻辑
        fuzzySearchResult = input
    }
    else{
        fuzzySearchResult = {}
    }
    return await drawSongRandom(fuzzySearchResult, [mainServer], true, compress)
}

export { router as songRandomRouter };