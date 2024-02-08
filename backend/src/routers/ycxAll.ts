import { drawCutoffListOfEvent } from '@/view/cutoffListOfEvent';
import { Server, getServerByServerId } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64, isServerList } from '@/routers/utils';
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post(
    '/',
    [
        body('server').custom((value) => isServerList(value)), // Custom validation using isServerList
        body('eventId').optional().isInt(), // eventId is optional and must be an integer if provided
        body('compress').optional().isBoolean(),
    ],
    async (req, res) => {
        console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send([{ type: 'string', string: '参数错误' }]);
        }

        const { server, eventId, compress } = req.body;

        try {
            const result = await commandYcxAll(getServerByServerId(server), compress, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandYcxAll(server: Server, compress: boolean, eventId?: number): Promise<Array<Buffer | string>> {

    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }
    return drawCutoffListOfEvent(eventId, server, compress)

}

export { router as ycxAllRouter }