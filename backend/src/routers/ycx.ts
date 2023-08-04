import { drawCutoffDetail } from '../view/cutoffDetail';
import { Server, getServerByServerId } from '../types/Server';
import { getPresentEvent } from '../types/Event';
import { listToBase64, isServer } from './utils';
import { body, validationResult } from 'express-validator';
import express from 'express';

const router = express.Router();

router.post(
    '/',
    [
        body('server').custom(value => isServer(value)),
        body('tier').isInt(),
        body('eventId').optional().isInt(),
    ],
    async (req, res) => {
        console.log(req.baseUrl, req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send([{ type: 'string', string: '参数错误' }]);
        }


        const { server, tier, eventId } = req.body;

        try {
            const result = await commandYcx(getServerByServerId(server), tier, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandYcx(server: Server, tier: number, eventId?: number): Promise<Array<Buffer | string>> {
    if (!tier) {
        return ['请输入排名']
    }
    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }
    return await drawCutoffDetail(eventId, tier, server)

}

export { router as ycxRouter }