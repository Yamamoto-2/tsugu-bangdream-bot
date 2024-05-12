import express from 'express';
import { validationResult, body } from 'express-validator';
import { Server, getServerByServerId } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64, isServer } from '@/routers/utils';
import { drawEventStage } from '@/view/eventStage';

const router = express.Router();

router.post(
    '/',
    [
        body('server').custom(isServer),
        body('eventId').optional().isInt(),
        body('meta').optional().isBoolean(),
        body('compress').optional().isBoolean(),
    ],
    async (req, res) => {
        console.log(req.ip, `${req.baseUrl}${req.path}`, req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send([{ type: 'string', string: '参数错误' }]);
        }

        const { server, eventId, meta, compress } = req.body;
        try {
            const result = await commandEventStage(getServerByServerId(server), compress, meta, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandEventStage(server: Server, compress: boolean, meta: boolean = false, eventId?: number): Promise<Array<Buffer | string>> {

    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }

    return await drawEventStage(eventId, server, meta, compress);
}

export { router as eventStageRouter }