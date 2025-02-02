import express from 'express';
import { body } from 'express-validator';
import { fuzzySearch } from '@/fuzzySearch';
import { listToBase64 } from '@/routers/utils';
import { isServerList } from '@/types/Server';
import { drawSongChart } from '@/view/songChart';
import { getServerByServerId, Server } from '@/types/Server';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post(
    '/',
    [
        // Express-validator checks for type validation
        body('displayedServerList').custom(isServerList),
        body('songId').isInt(),
        body('difficultyId').isInt().optional(),
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {


        const { displayedServerList, songId, difficultyId, compress } = req.body;

        try {
            const result = await commandSongChart(displayedServerList, songId, compress, difficultyId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);


export async function commandSongChart(displayedServerList: Server[], songId: number, compress: boolean, difficultyId = 3): Promise<Array<Buffer | string>> {
    /*
    text = text.toLowerCase()
    var fuzzySearchResult = fuzzySearch(text)
    console.log(fuzzySearchResult)
    if (fuzzySearchResult.difficulty === undefined) {
        return ['错误: 不正确的难度关键词,可以使用以下关键词:easy,normal,hard,expert,special,EZ,NM,HD,EX,SP']
    }
    */

    return await drawSongChart(songId, difficultyId, displayedServerList, compress)
}

export { router as songChartRouter }