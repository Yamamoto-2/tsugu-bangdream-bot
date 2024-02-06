import { Config } from '../config'
import { queryAllRoom, Room } from '../types/Room'
import { getDataFromBackend } from './utils'
import * as axios from 'axios'


export async function commandRoomList(config: Config, compress: boolean, keyWord?: string): Promise<Array<string | Buffer>> {
    let tempRoomList: Room[] = []  
    //如果从远程服务器获取
    if (config.RemoteDBSwitch) {
        const res = await axios.default.get(`${config.RemoteDBHost}/station/queryAllRoom`)
        if (res.data.status == 'success') {
            tempRoomList = res.data.data
        }
        else {
            return [`从远程服务器获取房间列表失败`]
        }
    }
    //如果从本地获取
    else {
        tempRoomList = await queryAllRoom()
    }
    if (tempRoomList.length == 0) {
        return ['myc']
    }
    let roomList: Room[] = []
    for (let i = 0; i < tempRoomList.length; i++) {
        const room = tempRoomList[i]
        if (keyWord != undefined) {
            if (!room.rawMessage.includes(keyWord)) {
                continue
            }
        }
        roomList.push(room)
    }
    if (roomList.length == 0 && keyWord != undefined) {
        return [`没有找到包含 ${keyWord} 的房间`]
    }
    return await getDataFromBackend(`${config.backendUrl}/roomList`, {
        roomList,
        compress
    })
}
