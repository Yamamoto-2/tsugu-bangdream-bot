import { drawCutoffDetail } from '@/view/cutoffDetail';
import { Server, getServerByServerId } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';
import { body } from 'express-validator';
import express from 'express';
import { drawCutoffEventTop } from '@/view/cutoffEventTop';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post(
    '/',
    [
        body('mainServer').custom(isServer),
        body('tier').isInt(),
        body('eventId').optional().isInt(),
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {

        const { mainServer, tier, eventId, compress } = req.body;

        try {
            const result = await commandCutoffDetail(getServerByServerId(mainServer), tier, compress, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);

export async function commandCutoffDetail(mainServer: Server, tier: number, compress: boolean, eventId?: number): Promise<Array<Buffer | string>> {
    if (!tier) {
        return ['请输入排名']
    }
    if (!eventId) {
        eventId = getPresentEvent(mainServer).eventId
    }
    if (tier == 10) {
        return await drawCutoffEventTop(eventId, mainServer, compress);
    }
    return await drawCutoffDetail(eventId, tier, mainServer, compress)

}

export { router as cutoffDetailRouter }