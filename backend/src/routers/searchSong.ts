import express from 'express';
import { body } from 'express-validator';
import { drawSongList } from '@/view/songList';
import { fuzzySearch, FuzzySearchResult, isFuzzySearchResult } from '@/fuzzySearch';
import { isInteger, listToBase64 } from '@/routers/utils';
import { isServerList } from '@/types/Server';
import { drawSongDetail } from '@/view/songDetail';
import { Song } from '@/types/Song';
import { getServerByServerId, Server } from '@/types/Server';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post(
    '/',
    [
        // Express-validator checks for type validation
        body('displayedServerList').custom(isServerList),
        body('fuzzySearchResult').optional().custom(isFuzzySearchResult),
        body('text').optional().isString(),
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {

        const { displayedServerList, fuzzySearchResult, text, compress } = req.body;

        if (!text && !fuzzySearchResult) {
            return res.status(400).json({ status: 'failed', data: '不能同时不存在text与fuzzySearchResult' });
        }
        try {
            const result = await commandSong(displayedServerList, text || fuzzySearchResult, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);


export async function commandSong(displayedServerList: Server[], input: string | FuzzySearchResult, compress: boolean): Promise<Array<Buffer | string>> {

    let fuzzySearchResult: FuzzySearchResult
    // 根据 input 的类型执行不同的逻辑
    if (typeof input === 'string') {
        if (isInteger(input)) {
            return await drawSongDetail(new Song(parseInt(input)), displayedServerList, compress)
        }
        fuzzySearchResult = fuzzySearch(input.split(' '))
    } else {
        // 使用 fuzzySearch 逻辑
        fuzzySearchResult = input
    }

    console.log(fuzzySearchResult)

    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }

    for (let i = 0; i < displayedServerList.length; i++) {
        displayedServerList[i] = getServerByServerId(displayedServerList[i])
    }
    return await drawSongList(fuzzySearchResult, displayedServerList, compress)
}

export { router as searchSongRouter }