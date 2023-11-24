import express from 'express';
import { body, validationResult } from 'express-validator';
import { drawSongList } from '../view/songList';
import { fuzzySearch } from './fuzzySearch';
import { isInteger, listToBase64, isServerList } from './utils';
import { drawSongChart } from '../view/songChart';
import { Song } from '../types/Song';
import { Server } from '../types/Server';

const router = express.Router();

router.post(
    '/',
    [
        // Express-validator checks for type validation
        body('default_servers').custom(isServerList),
        body('songId').isInt(),
        body('difficultyText').isString(),
    ],
    async (req, res) => {
        console.log(req.baseUrl, req.body);

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send([{ type: 'string', string: '参数错误' }]);
        }


        const { default_servers, songId, difficultyText } = req.body;

        try {
            const result = await commandSongChart(default_servers, songId, difficultyText);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);


export async function commandSongChart(default_servers: Server[], songId: number, difficultyText?: string): Promise<Array<Buffer | string>> {
    difficultyText = difficultyText.toLowerCase()
    var fuzzySearchResult = fuzzySearch(difficultyText.split(' '))
    console.log(fuzzySearchResult)
    if (fuzzySearchResult.difficulty === undefined) {
        return ['错误: 不正确的难度关键词,可以使用以下关键词:easy,normal,hard,expert,special']
    }
    return await drawSongChart(songId, parseInt(fuzzySearchResult.difficulty[0]), default_servers)
}

export { router as songChartRouter }