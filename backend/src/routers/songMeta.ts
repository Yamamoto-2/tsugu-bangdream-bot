import { drawSongMetaList } from '../view/songMetaList'
import { Server, getServerByName } from '../types/Server'
import { listToBase64, isServerList, isServer } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { default_servers, server } = req.body;

    // 检查类型是否正确
    if (
        !isServerList(default_servers) ||
        !isServer(server)
    ) {
        res.status(400).send('错误: 参数类型不正确');
        return;
    }

    try {
        const result = await commandSongMeta(default_servers, server);
        res.send(listToBase64(result));
    } catch (e) {
        res.status(400).send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandSongMeta(default_servers: Server[], server: Server): Promise<Array<Buffer | string>> {
    if (!server) {
        server = default_servers[0]
    }
    return await drawSongMetaList(server)
}

export { router as songMetaRouter }