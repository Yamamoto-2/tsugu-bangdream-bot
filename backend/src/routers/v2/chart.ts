import express from 'express';
import { body, validationResult } from 'express-validator';
import { drawSongList } from '@/view/songList';
import { fuzzySearch } from '@/routers/fuzzySearch';
import { isInteger, listToBase64, isServerList } from '@/routers/utils';
import { drawSongChart } from '@/view/songChart';
import { Song } from '@/types/Song';
import { Server } from '@/types/Server';

const router = express.Router();

router.post(
    '/',
    [
        // Express-validator checks for type validation
        body('default_servers').custom(isServerList),
        body('text').isString(),
        body('compress').optional().isBoolean(),
    ],
    async (req, res) => {
        console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send([{ type: 'string', string: '参数错误' }]);
        }


        const { default_servers, text, compress } = req.body;

        try {
            const result = await commandSongChart(default_servers, text, compress);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);


export async function commandSongChart(default_servers: Server[], text: string, compress: boolean): Promise<Array<Buffer | string>> {
    // 切开text参数测量长度
    const textLength = text.split(' ').length
    // 当输入为空时，返回错误信息
    if (textLength == 0) {
        return ['错误: 没有有效的关键词']
    }
    // 当长度为一时，作为 songId 处理，返回expert难度谱面
    if (textLength == 1) {
        // 必须是数字
        if (!isInteger(text)) {
            return ['错误: 歌曲ID必须是数字']
        }
        return await drawSongChart(parseInt(text), 3, default_servers, compress)
    }
    // 当长度为2时，作为 songId + difficulty 处理

    const [songId, difficultyText] = text.split(' ')
    // 必须是数字
    if (!isInteger(songId)) {
        return ['错误: 歌曲ID必须是数字']
    }
    // 必须是难度关键词

    const LowerCasedifficultyText = difficultyText.toLowerCase()
    var fuzzySearchResult = fuzzySearch(LowerCasedifficultyText.split(' '))
    console.log(fuzzySearchResult)
    if (fuzzySearchResult.difficulty === undefined) {
        return ['错误: 不正确的难度关键词,可以使用以下关键词:easy,normal,hard,expert,special']
    }
    return await drawSongChart(parseInt(text), parseInt(fuzzySearchResult.difficulty[0]), default_servers, compress)
}

export { router as chartRouterV2 }