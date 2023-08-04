import { drawPlayerDetail } from "../view/playerDetail";
import { Server } from "../types/Server";
import { listToBase64, isServer } from './utils';
import { getServerByServerId } from '../types/Server';
import express from 'express';
import { body, validationResult } from 'express-validator'; // Import express-validator functions

const router = express.Router();

router.post('/', [
    body('playerId').isInt(), // Validation for 'playerId' field
    body('server').custom((value) => isServer(value)), // Custom validation for 'server' field
    body('useEasyBG').isBoolean(), // Validation for 'useEasyBG' field
], async (req, res) => {
    console.log(req.baseUrl, req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send([{ type: 'string', string: '参数错误' }]);
    }
    const { playerId, server, useEasyBG } = req.body;

    try {
        const result = await commandSearchPlayer(playerId, getServerByServerId(server), useEasyBG);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandSearchPlayer(playerId: number, server: Server, useEasyBG: boolean): Promise<Array<Buffer | string>> {

    return await drawPlayerDetail(playerId, server, useEasyBG)

}

export { router as searchPlayerRouter }