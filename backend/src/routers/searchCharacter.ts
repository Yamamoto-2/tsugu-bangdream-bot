import express from 'express';
import { validationResult, body } from 'express-validator';
import { drawCharacterList } from '@/view/characterList';
import { drawCharacterDetail } from '@/view/characterDetail';
import { isInteger } from '@/routers/utils';
import { fuzzySearch } from '@/routers/fuzzySearch';
import { Server } from '@/types/Server';
import { listToBase64, isServerList } from '@/routers/utils';

const router = express.Router();

router.post('/', [
    body('default_servers').custom(isServerList),
    body('text').isString(),
    body('compress').optional().isBoolean(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send([{ type: 'string', string: '参数错误' }]);
    }

    const { default_servers, text, compress } = req.body;

    try {
        const result = await commandCharacter(default_servers, text, compress);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandCharacter(default_servers: Server[], text: string, compress:boolean): Promise<Array<Buffer | string>> {
    if (isInteger(text)) {
        return await drawCharacterDetail(parseInt(text), default_servers, compress)
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawCharacterList(fuzzySearchResult, default_servers, compress)

}

export { router as searchCharacterRouter }