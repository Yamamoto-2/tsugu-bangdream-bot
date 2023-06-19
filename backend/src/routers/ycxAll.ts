import { drawCutoffListOfEvent } from '../view/cutoffListOfEvent'
import { Server, getServerByServerId } from '../types/Server';
import { getPresentEvent } from '../types/Event'
import { listToBase64, isServerList } from './utils';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    console.log(req.baseUrl, req.body)

    const { server, eventId } = req.body;
    // 检查类型是否正确
    if (
        !isServerList(server) ||
        (typeof eventId !== 'number' && eventId !== undefined)
    ) {
        res.status(404).send('错误: 参数类型不正确');
        return;
    }
    try {
        const result = await commandYcxAll(getServerByServerId(server), eventId);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e)
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