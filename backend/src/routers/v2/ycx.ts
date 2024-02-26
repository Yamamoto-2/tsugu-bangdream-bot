import { drawCutoffDetail } from '@/view/cutoffDetail';
import { Server, getServerByServerId, getServerByName } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64, isServer } from '@/routers/utils';
import { body, validationResult } from 'express-validator';
import express from 'express';
import { drawCutoffEventTop } from '@/view/cutoffEventTop';

const router = express.Router();

router.post(
    '/',
    [
        body('server').custom(value => isServer(value)),
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
            const result = await commandYcx(getServerByServerId(server), text, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandYcx(server: Server, text: string, compress: boolean): Promise<Array<Buffer | string>> {
    // 切片text参数测量长度
    text = text.trim()
    const textLength = text.split(' ').length
    // 当长度为一时，作为 tier 处理
    if (textLength == 1) {
            // 当输入为空时，返回错误信息
        if (text == ''){
            return ['错误: tier必须提供一个数字']
        }
        const tier = parseInt(text)
        const eventId = getPresentEvent(server).eventId
        if (!Number.isInteger(tier)) {
            return ['错误: tier必须提供一个数字']
        }
        if(tier == 10){
            return await drawCutoffEventTop(eventId,server,compress);
        }
        return await drawCutoffDetail(getPresentEvent(server).eventId, tier, server, compress)
    }

    // 当长度为2时，作为 eventId + tier 处理
    if (textLength == 2) {
        const [tier, eventId] = text.split(' ')
        if (!Number.isInteger(parseInt(eventId)) || !Number.isInteger(parseInt(tier))) {
            return ['错误: eventId和tier必须是数字']
        }
        if (parseInt(tier) == 10) {
            return await drawCutoffEventTop(parseInt(eventId), server, compress)
        }
        return await drawCutoffDetail(parseInt(eventId), parseInt(tier), server, compress)
    }
    // 当长度为3时，作为 eventId + tier + server 处理
    if (textLength == 3) {
        const [tier, eventId, serverName] = text.split(' ')
        if (!Number.isInteger(parseInt(eventId)) || !Number.isInteger(parseInt(tier)) || !isServer(serverName)) {
            return ['错误: eventId和tier必须是数字']
        }
        if (parseInt(tier) == 10) {
            return await drawCutoffEventTop(parseInt(eventId), getServerByName(serverName), compress)
        }
        return await drawCutoffDetail(parseInt(eventId), parseInt(tier), getServerByName(serverName), compress)
    }
    return ['错误: 参数错误。请保证参数数量不超过3个且正确。']

}

export { router as ycxRouterV2 }