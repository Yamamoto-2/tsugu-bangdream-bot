import express from 'express';
import { body, validationResult } from 'express-validator';
import { drawSongList } from '../view/songList';
import { fuzzySearch } from './fuzzySearch';
import { isInteger, listToBase64, isServerList } from './utils';
import { drawSongDetail } from '../view/songDetail';
import { Song } from '../types/Song';
import { Server } from '../types/Server';

const router = express.Router();

router.post(
    '/',
    [
        // Express-validator checks for type validation
        body('default_servers').custom(isServerList),
        body('text').isString(),
    ],
    async (req, res) => {
        console.log(req.baseUrl, req.body);

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send([{ type: 'string', string: '参数错误' }]);
        }


        const { default_servers, text } = req.body;

        try {
            const result = await commandSong(default_servers, text);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);


export async function commandSong(default_servers: Server[], text: string): Promise<Array<Buffer | string>> {
    if (!text) {
        return ['错误: 请输入关键词或卡片ID']
    }
    if (isInteger(text)) {
        return await drawSongDetail(new Song(parseInt(text)), default_servers)
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawSongList(fuzzySearchResult, default_servers)
}

export { router as searchSongRouter }