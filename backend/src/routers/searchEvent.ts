import { isInteger } from './utils'
import { fuzzySearch } from './fuzzySearch'
import { drawEventDetail } from '../view/eventDetail'
import { drawEventList } from '../view/eventList'
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


    const result = await commandEvent(default_servers, text, useEasyBG);
    res.send(listToBase64(result));
});

export async function commandEvent(default_servers: Server[], text: string, useEasyBG: boolean): Promise<Array<Buffer | string>> {
    if (!text) {
        return ['错误: 请输入关键词或活动ID']
    }
    if (isInteger(text)) {
        return await drawEventDetail(parseInt(text), default_servers, useEasyBG)
    }

    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawEventList(fuzzySearchResult, default_servers)

}

export { router as searchEventRouter }