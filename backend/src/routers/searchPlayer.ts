import { drawPlayerDetail } from "../view/playerDetail";
import { Server, getServerByName } from "../types/Server";
import { tsuguUser } from "../config";
import { listToBase64, isTsuguUser, isServer } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { user, playerId, server, useEasyBG } = req.body;

    // 检查类型是否正确
    if (
        !isTsuguUser(user) ||
        typeof playerId !== 'number' ||
        (!isServer(server) && server != undefined) ||
        typeof useEasyBG !== 'boolean'
    ) {
        res.status(400).send('错误: 参数类型不正确');
        return;
    }


    const result = await commandSearchPlayer(user, playerId, server, useEasyBG);
    res.send(listToBase64(result));
});

export async function commandSearchPlayer(user: tsuguUser, playerId: number, server = user.server_mode, useEasyBG: boolean): Promise<Array<Buffer | string>> {

    return await drawPlayerDetail(playerId, server, useEasyBG)

}

export { router as searchPlayerRouter }