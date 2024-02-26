import { drawPlayerDetail } from "@/view/playerDetail";
import { Server,getServerByName } from "@/types/Server";
import { listToBase64, isServer } from '@/routers/utils';
import { getServerByServerId } from '@/types/Server';
import express from 'express';
import { body, validationResult } from 'express-validator'; // Import express-validator functions

const router = express.Router();

router.post('/', [
    body('server').custom((value) => isServer(value)), // Custom validation for 'server' field
    body('text').isString(), // Validation for 'text' field
    body('useEasyBG').isBoolean(), // Validation for 'useEasyBG' field
    body('compress').optional().isBoolean(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send([{ type: 'string', string: '参数错误' }]);
    }
    const { server, text, useEasyBG, compress } = req.body;

    try {
        const result = await commandSearchPlayer(server, text, useEasyBG, compress);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});


export async function commandSearchPlayer(server: Server, text: string, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {
    if (text.trim() == '') {
        return ['错误: 没有有效的关键词']
    }
    // 切片text参数测量长度
    const textLength = text.split(' ').length
    // 当输入为空时，返回错误信息
    if (textLength == 0) {
        return ['错误: 没有有效的关键词']
    }
    // 当长度为一时，作为 playerId 处理
    if (textLength == 1) {
        // 必须是数字
        if (!Number.isInteger(parseInt(text))) {
            return ['错误: 玩家ID必须是数字']
        }
        return await drawPlayerDetail(parseInt(text), getServerByServerId(server), useEasyBG, compress)
    }
    // 当长度为2时，作为 playerId + server 处理
    const [playerId, serverName] = text.split(' ')
    if (textLength == 2) {
        if (!Number.isInteger(parseInt(text))) {
            return ['错误: 玩家ID必须是数字']
        }
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return ['错误: 服务器不存在']
    }
    return await drawPlayerDetail(parseInt(playerId), server, useEasyBG, compress)
    
    return ['错误: 参数错误']
}

export { router as playerRouterV2 }