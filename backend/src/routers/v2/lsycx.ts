import express from 'express';
import { validationResult, body } from 'express-validator';
import { drawCutoffComprare } from '@/view/cutoffCompare';
import { Server, getServerByServerId, getServerByName } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64, isServer } from '@/routers/utils';

const router = express.Router();

router.post(
    '/',
    [
        body('server').custom(isServer),
        // body('tier').isInt(),
        // body('eventId').optional().isInt(),
        body('text').isString(),
        body('compress').optional().isBoolean(),
    ],
    async (req, res) => {
        console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send([{ type: 'string', string: '参数错误' }]);
        }

        const { server, text, compress } = req.body;
        try {
            const result = await commandLsYcx(getServerByServerId(server), text, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandLsYcx(server: Server, text: string, compress: boolean): Promise<Array<Buffer | string>> {
    console.log(server)
    text = text.trim()
    // 切片text参数测量长度
    const textLength = text.split(' ').length
    // 当输入为空时，返回错误信息
    // 当长度为一时，作为 tier 处理
    if (textLength == 1) {
        // 当输入为空时，返回错误信息
        if (text == ''){
            return ['错误: tier必须提供一个数字']
        }
        // 必须是数字
        if (!Number.isInteger(parseInt(text))) {
            return ['错误: tier必须提供一个数字']
        }
        const tier = parseInt(text)
        console.log(getPresentEvent(server).eventId)
        console.log(tier)
        return await drawCutoffComprare(getPresentEvent(server).eventId, tier, server, compress)
    }
    // 当长度为2时，作为 eventId + tier 处理
    const [tier, eventId] = text.split(' ')
    if (textLength == 2) {
        if (!Number.isInteger(parseInt(eventId))) {
            return ['错误: eventId必须是数字']
        }
        if (!Number.isInteger(parseInt(tier))) {
            return ['错误: tier必须是数字']
        }
        console.log(parseInt(eventId))
    console.log(parseInt(tier))
        return await drawCutoffComprare(parseInt(eventId), parseInt(tier), server, compress)
    }
    // 当长度为3时，作为 eventId + tier + server 处理
    const [tier2, eventId2, serverName] = text.split(' ')
    if (textLength == 3) {
        if (!Number.isInteger(parseInt(eventId2))) {
            return ['错误: eventId必须是数字']
        }
        if (!Number.isInteger(parseInt(tier2))) {
            return ['错误: tier必须是数字']
        }
        server = getServerByName(serverName)
        if (server == undefined) {
            return ['错误: 服务器不存在，当三个参数时，第三个参数必须是有效的服务器名']
        }
        console.log(parseInt(eventId2))
        console.log(parseInt(tier2))
        console.log(server)
        return await drawCutoffComprare(parseInt(eventId2), parseInt(tier2), server, compress)

    }
    return ['错误: 参数错误。请保证参数数量不超过3个且正确。']

}

export { router as lsycxRouterV2 }