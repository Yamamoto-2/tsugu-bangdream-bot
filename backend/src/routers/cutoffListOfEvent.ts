import { drawCutoffListOfRecentEvent } from '@/view/cutoffListOfRecentEvent';
import { Server, getServerByServerId } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';
import express from 'express';
import { body } from 'express-validator';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';


const router = express.Router();

router.post(
    '/',
    [
        body('mainServer').custom((value) => isServer(value)), // Custom validation using isServerList
        body('tier').isInt(), // tier must be an integer
        body('eventId').optional().isInt(), // eventId is optional and must be an integer if provided
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {

        const { mainServer, tier, eventId, compress } = req.body;

        try {
            const result = await commandcCutoffListOfRecentEvent(getServerByServerId(mainServer), tier, compress, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);

export async function commandcCutoffListOfRecentEvent(mainServer: Server, tier: number, compress: boolean, eventId?: number): Promise<Array<Buffer | string>> {

    if (!eventId) {
        eventId = getPresentEvent(mainServer).eventId
    }
    return drawCutoffListOfRecentEvent(eventId, tier, mainServer, compress)

}

export { router as cutoffListOfRecentEventRouter }