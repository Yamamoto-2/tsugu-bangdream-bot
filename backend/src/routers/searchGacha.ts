import { body, validationResult } from 'express-validator';
import { drawGachaDetail } from '@/view/gachaDetail';
import { Server } from '@/types/Server';
import { listToBase64, isServerList } from '@/routers/utils';
import express from 'express';

const router = express.Router();

router.post('/', [
    // Add validation rules for each parameter
    body('default_servers').custom((value) => isServerList(value)),
    body('gachaId').isInt(),
    body('useEasyBG').isBoolean(),
], async (req, res) => {
    console.log(req.baseUrl, req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send([{ type: 'string', string: '参数错误' }]);
    }

    const { default_servers, gachaId, useEasyBG } = req.body;

    try {
        const result = await commandGacha(default_servers, gachaId, useEasyBG);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandGacha(default_server: Server[], gachaId: number, useEasyBG: boolean): Promise<Array<Buffer | string>> {

    return await drawGachaDetail(gachaId, default_server, useEasyBG)

}

export { router as searchGachaRouter }