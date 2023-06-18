import { isInteger } from './utils'
import { drawGachaDetail } from '../view/gachaDetail'
import { Server } from '../types/Server'
import { listToBase64, isServerList } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { default_servers, gachaId, useEasyBG } = req.body;

    // 检查类型是否正确
    if (
        !isServerList(default_servers) ||
        typeof gachaId !== 'number' ||
        typeof useEasyBG !== 'boolean'
    ) {
        res.status(400).send('错误: 参数类型不正确');
        return;
    }


    const result = await commandGacha(default_servers, gachaId, useEasyBG);
    res.send(listToBase64(result));
});

export async function commandGacha(default_server:Server[], gachaId: number,useEasyBG: boolean): Promise<Array<Buffer | string>> {
    if (!gachaId) {
        return ['错误: 请输入卡池ID']
    }
    if (typeof gachaId == 'number') {
        return await drawGachaDetail(gachaId, default_server,useEasyBG)
    }
    return ['错误: 请输入正确的卡池ID']
}

export { router as searchGachaRouter }