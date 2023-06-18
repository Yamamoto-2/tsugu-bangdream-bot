import { drawCutoffListOfEvent } from '../view/cutoffListOfEvent'
import { Server, getServerByName } from '../types/Server';
import { getPresentEvent } from '../types/Event'
import { listToBase64, isServerList } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { server, eventId } = req.body;
    // 检查类型是否正确
    if (
        !isServerList(server) ||
        (typeof eventId !== 'number' && eventId !== undefined)
    ) {
        res.status(400).send('错误: 参数类型不正确');
        return;
    }
    try {
        const result = await commandYcxAll(server, eventId);
        res.send(listToBase64(result));
    } catch (e) {
        res.status(400).send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandYcxAll(server: Server, eventId?: number): Promise<Array<Buffer | string>> {

    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }
    return drawCutoffListOfEvent(eventId, server)

}

export { router as ycxAllRouter }