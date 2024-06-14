import { drawPlayerDetail } from "@/view/playerDetail";
import { Server } from "@/types/Server";
import { listToBase64 } from '@/routers/utils';
import { isServer } from '@/types/Server';
import { getServerByServerId } from '@/types/Server';
import express from 'express';
import { body } from 'express-validator'; // Import express-validator functions
import { middleware } from '@/routers/middleware';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/',
    [
        body('playerId').isInt(), // Validation for 'playerId' field
        body('mainServer').custom(isServer), // Custom validation for 'server' field
        body('useEasyBG').isBoolean(), // Validation for 'useEasyBG' field
        body('compress').optional().isBoolean(),
    ],
    middleware,
    async (req: Request, res: Response) => {
        const { playerId, mainServer, useEasyBG, compress } = req.body;

        try {
            const result = await commandSearchPlayer(playerId, getServerByServerId(mainServer), useEasyBG, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.status(500).send({ status: 'failed', data: '内部错误' });
        }
    }
);

export async function commandSearchPlayer(playerId: number, mainServer: Server, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {

    return await drawPlayerDetail(playerId, mainServer, useEasyBG, compress)

}

export { router as searchPlayerRouter }