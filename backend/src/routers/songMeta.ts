import { drawSongMetaList } from '../view/songMetaList';
import { Server, getServerByServerId } from '../types/Server';
import { listToBase64, isServerList, isServer } from './utils';
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post('/', [
    // Define validation rules for request body
    body('default_servers').custom(isServerList),
    body('server').custom(isServer),
], async (req, res) => {
    console.log(req.baseUrl, req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.send([{ type: 'string', string: '参数错误' }]);
    }

    const { default_servers, server } = req.body;

    try {
        const result = await commandSongMeta(default_servers, getServerByServerId(server));
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandSongMeta(default_servers: Server[], server: Server): Promise<Array<Buffer | string>> {
    if (server == undefined) {
        server = default_servers[0]
    }
    return await drawSongMetaList(server)
}

export { router as songMetaRouter }