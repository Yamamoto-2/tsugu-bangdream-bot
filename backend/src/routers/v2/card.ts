import express from 'express';
import { body, validationResult } from 'express-validator';
import { drawCardDetail } from '@/view/cardDetail';
import { drawCardList } from '@/view/cardList';
import { isInteger, isServerList, listToBase64 } from '@/routers/utils';
import { fuzzySearch } from '@/routers/fuzzySearch';
import { Server } from '@/types/Server';

const router = express.Router();

router.post(
    '/',
    [
        body('default_servers').custom(isServerList),
        body('text').isString(),
        body('useEasyBG').isBoolean(),
        body('compress').optional().isBoolean(),
    ],
    async (req, res) => {
        console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send([{ type: 'string', string: '参数错误' }]);
        }
        const { default_servers, text, useEasyBG, compress } = req.body;
        try {
            const result = await commandCard(default_servers, text, useEasyBG, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);


export async function commandCard(default_servers: Server[], text: string, useEasyBG: boolean, compress:boolean): Promise<Array<string | Buffer>> {
    if (isInteger(text)) {
        return await drawCardDetail(parseInt(text), default_servers, useEasyBG, compress)
    }
    var fuzzySearchResult = fuzzySearch(text.split(' '))
    console.log(fuzzySearchResult)
    // 当输入为空时，返回错误信息
    if (text.trim() == '') {
        return ['错误: 没有有效的关键词']
    }
    if (Object.keys(fuzzySearchResult).length == 0) {
        return ['错误: 没有有效的关键词']
    }
    return await drawCardList(fuzzySearchResult, default_servers, compress)

}

export { router as cardRouterV2 }