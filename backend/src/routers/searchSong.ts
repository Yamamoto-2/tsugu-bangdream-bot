import { drawSongList } from "../view/songList"
import { fuzzySearch } from "./fuzzySearch"
import { isInteger } from "./utils"
import { drawSongDetail } from "../view/songDetail"
import { Song } from "../types/Song"
import { Server } from "../types/Server"
import { listToBase64, isServerList } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    console.log(req.baseUrl, req.body)

    const { default_servers, text } = req.body;

    // 检查类型是否正确
    if (
        !isServerList(default_servers) ||
        typeof text !== 'string'
    ) {
        res.status(404).send('错误: 参数类型不正确');
        return;
    }

    try {
        const result = await commandSong(default_servers, text);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e)
    res.status(400).send([{ type: 'string', string: '内部错误' }]);
    }
});

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