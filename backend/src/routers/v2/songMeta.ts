import { drawSongMetaList } from '@/view/songMetaList';
import { Server, getServerByServerId, getServerByName } from '@/types/Server';
import { listToBase64, isServerList, isServer } from '@/routers/utils';
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post('/', [
    // Define validation rules for request body
    body('default_servers').custom(isServerList),
    body('text').isString(),
    body('server').custom(isServer),
    body('compress').optional().isBoolean(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.send([{ type: 'string', string: '参数错误' }]);
    }

    const { default_servers, server, text, compress } = req.body;

    try {
        if(text.trim() != ''){
            // 获取对应服务器
            const server = getServerByName(text);
            if (server == undefined) {
                return res.send([{ type: 'string', string: '错误: 服务器不存在。' }]);
            }
        }
        const result = await commandSongMeta(default_servers, getServerByServerId(server), compress);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandSongMeta(default_servers: Server[], server: Server, compress:boolean): Promise<Array<Buffer | string>> {
    if (server == undefined) {
        server = default_servers[0]
    }
    return await drawSongMetaList(server, compress)
}

export { router as songMetaRouterV2 };