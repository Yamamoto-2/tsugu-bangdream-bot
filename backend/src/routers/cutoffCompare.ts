import express from 'express';
import { body } from 'express-validator';
import { drawCutoffComprare } from '@/view/cutoffCompare';
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
            const result = await commandCutoffCompare(getServerByServerId(mainServer), compress, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandCutoffCompare(mainServer: Server, compress: boolean, eventId?: number): Promise<Array<Buffer | string>> {

    if (!eventId) {
        eventId = getPresentEvent(mainServer).eventId
    }
    return drawCutoffComprare(eventId, mainServer, compress)

}

export { router as cutoffCompareRouter }