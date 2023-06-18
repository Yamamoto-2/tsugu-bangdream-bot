import { drawCardDetail } from '../view/cardDetail'
import { drawCardList } from '../view/cardList'
import { isInteger } from './utils'
import { fuzzySearch } from './fuzzySearch'
import { Server } from '../types/Server'
import { listToBase64, isServerList } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { default_servers, text, useEasyBG } = req.body;

    // 检查类型是否正确
    if (
        !isServerList(default_servers) ||
        typeof text !== 'string' ||
        typeof useEasyBG !== 'boolean'
    ) {
        res.status(400).send('错误: 参数类型不正确');
        return;
    }


    const result = await commandCard(default_servers, text, useEasyBG);
    res.send(listToBase64(result));
});

export async function commandCard(default_servers: Server[], text: string, useEasyBG: boolean): Promise<Array<string | Buffer>> {
    if (isInteger(text)) {
        return await drawCardDetail(parseInt(text), default_servers, useEasyBG)
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawCardList(fuzzySearchResult, default_servers)

}

export { router as searchCardRouter }