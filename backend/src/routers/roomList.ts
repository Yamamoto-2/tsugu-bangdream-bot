import { drawRoomList } from '../view/roomList';
import { listToBase64, isServerList } from './utils';
import { Room } from '../types/Room';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    const { roomList } = req.body;

    // 检查类型是否正确
    if (
        isRoomList(roomList) == false
    ) {
        res.status(400).send('错误: 参数类型不正确');
        return;
    }

    const result = await commandRoomList(roomList);
    res.send(listToBase64(result));
});

export async function commandRoomList(roomList: Room[]): Promise<Array<string | Buffer>> {
    if (roomList.length == 0) {
        return ['myc']
    }
    return await drawRoomList(roomList)
}

function isRoomList(roomList:any){
    if(!Array.isArray(roomList)){
        return false
    }
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        if(!(room instanceof Room)){
            return false
        }
    }
    return true
}

export { router as roomListRouter }