import { drawPlayerDetail } from "../view/playerDetail";
import { Server, getServerByName } from "../types/Server";
import { tsuguUser } from "../config";
import { listToBase64, isTsuguUser, isServer } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    console.log(req.baseUrl, req.body)

    const { playerId, server, useEasyBG } = req.body;

    // 检查类型是否正确
    if (
        typeof playerId !== 'number' ||
        (!isServer(server) && server != undefined) ||
        typeof useEasyBG !== 'boolean'
    ) {
        res.status(404).send('错误: 参数类型不正确');
        return;
    }

    try {
        const result = await commandSearchPlayer( playerId, server, useEasyBG);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e)
    res.status(400).send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandSearchPlayer(playerId: number, server:Server, useEasyBG: boolean): Promise<Array<Buffer | string>> {

    return await drawPlayerDetail(playerId, server, useEasyBG)

}

export { router as searchPlayerRouter }