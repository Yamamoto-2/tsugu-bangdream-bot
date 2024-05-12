import { body, validationResult } from 'express-validator';
import { drawGachaDetail } from '@/view/gachaDetail';
import { Server } from '@/types/Server';
import { listToBase64, isServerList } from '@/routers/utils';
import express from 'express';

const router = express.Router();

router.post('/', [
    // Add validation rules for each parameter
    body('default_servers').custom((value) => isServerList(value)),
    body('text').isString(),
    body('useEasyBG').isBoolean(),
    body('compress').optional().isBoolean(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send([{ type: 'string', string: '参数错误' }]);
    }

    const { default_servers, text, useEasyBG, compress } = req.body;

    try {
        const result = await commandGacha(default_servers, text, useEasyBG, compress);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandGacha(default_server: Server[], text: string, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {
    // 处理 text 参数 为 gachaId
    // 转化为数字
    if (text.trim() == '') {
        return ['错误: 没有有效的关键词']
    }
    const gachaId = parseInt(text);
    // 如果text不是数字，返回错误信息
    if (!Number.isInteger(gachaId)) {
        return ['错误: 卡池ID必须是是数字'];
    }

    return await drawGachaDetail(gachaId, default_server, useEasyBG, compress)

}

export { router as gachaRouterV2 }
