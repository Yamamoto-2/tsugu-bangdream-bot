import { drawCutoffListOfEvent } from '@/view/cutoffListOfEvent';
import { Server, getServerByServerId, getServerByName } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64, isServerList } from '@/routers/utils';
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post(
    '/',
    [
        body('server').custom((value) => isServerList(value)), // Custom validation using isServerList
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
            const result = await commandYcxAll(getServerByServerId(server), compress, text);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandYcxAll(server: Server, compress: boolean, text?: string): Promise<Array<Buffer | string>> {

    text = text?.trim()
    const textLength = text?.split(' ').length
    if (textLength == 1) {
        if (text == ''){
            return await drawCutoffListOfEvent(getPresentEvent(server).eventId, server, compress)
        }
        if (!Number.isInteger(parseInt(text))) {
            return ['错误: 活动ID必须提供一个数字']
        }
        return await drawCutoffListOfEvent(parseInt(text), server, compress)
    }
    if (textLength == 2) {
        const eventId = parseInt(text.split(' ')[0])
        const server = getServerByName(text.split(' ')[1])
        if (!Number.isInteger(eventId)) {
            return ['错误: 活动ID必须提供一个数字']
        }
        if (server == undefined) {
            return ['错误: 服务器ID不正确。']
        }
        
        return await drawCutoffListOfEvent(eventId, server, compress)
    }
    return ['错误: 参数错误。请保证参数数量不超过2个且正确。']

}

export { router as ycxAllRouterV2 }