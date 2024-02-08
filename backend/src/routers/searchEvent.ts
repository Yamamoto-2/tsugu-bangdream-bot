import { isInteger } from '@/routers/utils';
import { fuzzySearch } from '@/routers/fuzzySearch';
import { drawEventDetail } from '@/view/eventDetail';
import { drawEventList } from '@/view/eventList';
import { Server } from '@/types/Server';
import { listToBase64, isServerList } from '@/routers/utils';
import express from 'express';
import { validationResult, body } from 'express-validator';

const router = express.Router();

router.post('/', [
    // Define validation rules using express-validator
    body('default_servers').custom(isServerList),
    body('text').isString(),
    body('useEasyBG').isBoolean(),
    body('compress').optional().isBoolean(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    const { default_servers, text, useEasyBG, compress } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send([{ type: 'string', string: '参数错误' }]);
    }
    try {
        const result = await commandEvent(default_servers, text, useEasyBG, compress);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandEvent(default_servers: Server[], text: string, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {

    if (isInteger(text)) {
        return await drawEventDetail(parseInt(text), default_servers, useEasyBG, compress)
    }

    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawEventList(fuzzySearchResult, default_servers, compress)

}

export { router as searchEventRouter }