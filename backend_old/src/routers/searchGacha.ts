import { body } from 'express-validator';
import { drawGachaDetail } from '@/view/gachaDetail';
import { getServerByServerId, Server } from '@/types/Server';
import { listToBase64 } from '@/routers/utils';
import { isServerList } from '@/types/Server';
import express from 'express';
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/',
    [
        // Add validation rules for each parameter
        body('displayedServerList').custom((value) => isServerList(value)),
        body('gachaId').isInt(),
        body('useEasyBG').isBoolean(),
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {

        const { displayedServerList, gachaId, useEasyBG, compress } = req.body;

        try {
            const result = await commandGacha(displayedServerList, gachaId, useEasyBG, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);

export async function commandGacha(displayedServerList: Server[], gachaId: number, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {

    return await drawGachaDetail(gachaId, displayedServerList, useEasyBG, compress)

}

export { router as searchGachaRouter }