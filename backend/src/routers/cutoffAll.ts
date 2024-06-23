import express from 'express';
import { body } from 'express-validator';
import { drawCutoffAll } from '@/view/cutoffAll';
import { Server, getServerByServerId } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post(
    '/',
    [
        body('mainServer').custom(isServer),
        body('eventId').optional().isInt(),
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {

        const { mainServer, eventId, compress } = req.body;
        try {
            const result = await commandCutoffAll(getServerByServerId(mainServer), compress, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);

export async function commandCutoffAll(mainServer: Server, compress: boolean, eventId?: number): Promise<Array<Buffer | string>> {

    if (!eventId) {
        eventId = getPresentEvent(mainServer).eventId
    }
    return drawCutoffAll(eventId, mainServer, compress)

}

export { router as cutoffAllRouter }