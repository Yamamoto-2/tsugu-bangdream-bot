import { BandoriStationurl } from "@/config";
import { Player } from "@/types/Player";
import { unescape } from "querystring";
import { Server, getServerByName } from "@/types/Server";
import { getJsonAndSave } from "@/api/downloader";
import { tsuguUser, userPlayerInList } from '@/database/userDB'
import { Stack } from '@/types/utils'
import { logger } from "@/logger";
import * as axios from 'axios'
import * as dotenv from 'dotenv';
dotenv.config();


interface RoomOption {
    number: number;
    rawMessage: string;
    source: string;
    userId: string;
    time: number;
    avatarUrl?: string;
    userName?: string;
    bandoriStationToken?: string;
}

export class Room {
    number: number;
    rawMessage: string;
    source: string;
    userId: string;
    time: number;
    player: userPlayerInList
    avatarUrl?: string;
    userName?: string;
    constructor({ number, rawMessage, source, userId, time, avatarUrl, userName }: RoomOption) {
        this.number = number
        this.rawMessage = rawMessage
        this.source = source
        this.userId = userId
        this.time = time
        this.avatarUrl = avatarUrl
        this.userName = userName
    }
    setPlayer(player: Player) {
        this.player = {
            playerId: player.playerId,
            server: player.server
        }
    }
}

//房间栈
const roomStack = new Stack<Room>(100)

//获取所有房间
export async function queryAllRoom(): Promise<Room[]> {
    //获取房间号列表
    const roomList = roomStack.stack
    //从BandoriStation获取房间号
    if (process.env.USE_BANDORISTATION == 'true') {
        const localNumberList = roomList.map((room) => {
            return room.number
        })
        try {
            const roomListBandoriStation = await queryRoomNumberFromBandoriStation()
            for (let i = 0; i < roomListBandoriStation.length; i++) {
                const room = roomListBandoriStation[i];
                if (!localNumberList.includes(room.number)) {
                    roomList.push(room)
                }
            }
        }
        catch (e) {
            logger('station', `error: ${e}`)
        }
    }
    //如果本地已经有房间号列表，就不再从BandoriStation获取


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
    const Data = await axios.default.post(BandoriStationurl, { function: 'query_room_number' })
    const response = Data.data?.response
    const roomList: Room[] = []
    for (let i = 0; i < response.length; i++) {
        const roomData = response[i];
        let source = decodeUrl(roomData['source_info']['name'])
        const room = new Room({
            number: Number(roomData['number']),
            rawMessage: decodeUrl(roomData['raw_message']),
            source: source,
            userName: decodeUrl(roomData['user_info']['username']),
            userId: roomData['user_info']['user_id'],
            time: roomData['time'],
            avatarUrl: roomData['user_info']['avatar'] == '' ? undefined : `https://asset.bandoristation.com/images/user-avatar/${roomData['user_info']['avatar']}`
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

function decodeUrl(text: string): string {
    if (text == undefined) {
        return ''
    }
    return unescape(text.replace(/\%u/g, "%u"))
}

//提交房间号
export async function submitRoomNumber({ number, rawMessage, source, userId, time, userName, bandoriStationToken, avatarUrl }: RoomOption, userpPlayerInList?: userPlayerInList) {
    if (source == 'onebot' || source == 'red' || source == 'chronocat') {
        source = 'qq'
    }
    const room = new Room({
        number: number,
        rawMessage: rawMessage,
        source: source,
        userId: userId,
        time: time,
        userName: userName,
        avatarUrl: avatarUrl
    })

    //玩家数据
    if (userpPlayerInList) {
        const player = new Player(userpPlayerInList.playerId, userpPlayerInList.server)
        await player.initFull(false, 2)
        if (!player.initError && player.isExist) {
            room.setPlayer(player)
        }
    }
    roomStack.push(room)

    if (process.env.USE_BANDORISTATION == 'true' && source == 'qq') {
        if (bandoriStationToken == '' || bandoriStationToken == undefined) {
            bandoriStationToken = 'ZtV4EX2K9Onb'
        }

        const url = `${BandoriStationurl}`
        const data = {
            function: 'submit_room_number',
            number: number,
            user_id: userId,
            raw_message: rawMessage,
            source: 'Tsugu',
            token: bandoriStationToken
        }
        try {
            await axios.default.post(url, data)
        } catch (e) {
            logger('station', `error: ${e}`)
        }
    }
}
