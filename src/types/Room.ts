import { BandoriStationurl } from "../config";
import { callAPIAndCacheResponse } from "../api/getApi";
import { Player } from "./Player";
import { unescape } from "querystring";
import { getServerByName } from "./Server";
import { getJson } from "../api/downloader";
import { Session } from "koishi";
import { Server } from "./Server";
import {BindingStatus} from "../commands/bindPlayer"


//栈函数
class Stack<T> {
    stack: T[];
    private maxLength: number;

    constructor(maxLength: number) {
        this.stack = [];
        this.maxLength = maxLength;
    }

    push(item: T): void {
        this.stack.unshift(item); // 将新元素插入到堆栈的最前面

        if (this.stack.length > this.maxLength) {
            this.stack.pop(); // 如果堆栈长度超过指定的最大长度，自动弹出最后一个元素
        }
    }

    pop(): T | undefined {
        return this.stack.shift(); // 弹出并返回最前面的元素
    }

    isEmpty(): boolean {
        return this.stack.length === 0;
    }

    size(): number {
        return this.stack.length;
    }

    clear(): void {
        this.stack = [];
    }
}

interface RoomOption {
    number: number;
    rawMessage: string;
    source: string;
    userId: string;
    time: number;
    avanter?: string;
    userName?: string;
    bandoriStationToken?: string;
}

export class Room {
    number: number;
    rawMessage: string;
    source: string;
    userId: string;
    time: number;
    player: Player;
    avanter?: string;
    userName?: string;
    constructor({ number, rawMessage, source, userId, time, avanter, userName }: RoomOption) {
        this.number = number
        this.rawMessage = rawMessage
        this.source = source
        this.userId = userId
        this.time = time
        this.avanter = avanter
        this.userName = userName
    }
    setPlayer(player: Player) {
        this.player = player
    }
}

//房间栈
const roomStack = new Stack<Room>(100)

//获取所有房间
export async function queryAllRoom(): Promise<Room[]> {
    //获取房间号列表
    const roomList = roomStack.stack
    //如果本地已经有房间号列表，就不再从BandoriStation获取
    const localNumberList = roomList.map((room) => {
        return room.number
    })
    const roomListBandoriStation = await queryRoomNumberFromBandoriStation()
    for (let i = 0; i < roomListBandoriStation.length; i++) {
        const room = roomListBandoriStation[i];
        if (!localNumberList.includes(room.number)) {
            roomList.push(room)
        }
    }


    //按时间排序
    roomList.sort((a, b) => {
        return b.time - a.time
    })
    //清除所有150秒以前的车牌
    const now = Date.now()
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        if (now - room.time > 1000 * 150) {
            roomList.splice(i, 1)
            i--
        }
    }
    //去重，每个房间号只保留最新的一条
    const finalRoomList: Room[] = []
    const numberList: number[] = []//用于去重
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        if (!numberList.includes(room.number)) {
            numberList.push(room.number)
            finalRoomList.push(room)
        }
    }
    return finalRoomList
}

//从BandoriStation获取房间号
export async function queryRoomNumberFromBandoriStation(): Promise<Room[]> {
    const Data = await getJson(BandoriStationurl + '?function=query_room_number')
    const response = Data['response']
    const roomList: Room[] = []
    for (let i = 0; i < response.length; i++) {
        const roomData = response[i];
        let source = decode(roomData['source_info']['name'])
        const room = new Room({
            number: Number(roomData['number']),
            rawMessage: decode(roomData['raw_message']),
            source: source,
            userName: decode(roomData['user_info']['username']),
            userId: roomData['user_info']['user_id'],
            time: roomData['time'],
            avanter: roomData['user_info']['avatar']
            
        })
        if (roomData['user_info']?.['bandori_player_brief_info']?.['user_id'] != undefined) {
            const player = new Player(
                roomData['user_info']['bandori_player_brief_info']['user_id'],
                getServerByName(roomData['user_info']['bandori_player_brief_info']['server'])
            )
            await player.initFull()
            room.setPlayer(player)
        }
        roomList.push(room)
    }
    return roomList
}

function decode(text: string): string {
    if (text == undefined) {
        return ''
    }
    return unescape(text.replace(/\%u/g, "%u"))
}

//向BandoriStation提交房间号
export async function submitRoomNumber({ number, rawMessage, source, userId, time, userName,bandoriStationToken }: RoomOption,session:Session<'tsugu', never>) {
    if (source == 'onebot') {
        source = 'qq'
    }
    const room = new Room({
        number: number,
        rawMessage: rawMessage,
        source: source,
        userId: userId,
        time: time,
        userName: userName
    })

    //玩家数据
    const playerBinding = session.user.tsugu
    const server = playerBinding.server_mode
    if (server != undefined) {
        const curServer = playerBinding.server_list[server]
        if (curServer.bindingStatus == BindingStatus.Success) {
            const player = new Player(curServer.gameID,server)
            await player.initFull()
            room.setPlayer(player)
        }
    }
    roomStack.push(room)
    if(bandoriStationToken == undefined){
        return
    }
    if(source == 'qq'){
        const url = `${BandoriStationurl}index.php?function=submit_room_number&number=${number}&user_id=${userId}&raw_message=${encodeURIComponent(rawMessage)}&source=Tsugu&token=${bandoriStationToken}`
        try {
            const Data = await getJson(url)
            return Data
        } catch (e) {
            console.log(e)
        }
    }
}

