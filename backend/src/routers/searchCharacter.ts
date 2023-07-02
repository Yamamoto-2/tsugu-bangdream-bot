import { drawCharacterList } from '../view/characterList'
import { drawCharacterDetail } from '../view/characterDetail'
import { isInteger } from './utils'
import { fuzzySearch } from './fuzzySearch'
import { Server } from '../types/Server'
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
        const result = await commandCharacter(default_servers, text);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e)
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandCharacter(default_servers: Server[], text: string): Promise<Array<Buffer | string>> {
    if (!text) {
        return ['错误: 请输入关键词或角色ID']
    }
    if (isInteger(text)) {
        return await drawCharacterDetail(parseInt(text), default_servers)
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawCharacterList(fuzzySearchResult, default_servers)

}

export { router as searchCharacterRouter }