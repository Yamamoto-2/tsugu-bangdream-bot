import { Room, submitRoomNumber } from "../types/Room";
import * as fs from 'fs'
import { carKeywordPath, tsuguUser, Config } from "../config";
import { Session } from 'koishi'
import * as axios from 'axios'

interface CarKeyword {
    [type: string]: string[];
}

function loadConfig(): CarKeyword {
    const fileContent = fs.readFileSync(carKeywordPath, 'utf-8');
    return JSON.parse(fileContent);
}

const carKeywordConfig = loadConfig();

export async function roomNumber(config:Config,session: Session<'tsugu', never>,user:tsuguUser, number: number, raw_message: string, bandoriStationToken?: string) {
    if (!user.car) {
        return
    }
    console.log(user)
    let isCar = false
    for (let i = 0; i < carKeywordConfig['car'].length; i++) {
        const element = carKeywordConfig['car'][i];
        if (raw_message.indexOf(element) != -1) {
            isCar = true
        }
    }
    for (let i = 0; i < carKeywordConfig['fake'].length; i++) {
        const element = carKeywordConfig['fake'][i];
        if (raw_message.indexOf(element) != -1) {
            isCar = false
        }
    }
    if (isCar) {
        if(config.RemoteDBSwitch){
            const res = await axios.default.post(`${config.RemoteDBHost}/station/submitRoomNumber`,{
                number: number,
                rawMessage: raw_message,
                platform: user.platform,
                user_id: user.user_id,
                userName: session.username,
                time: Date.now(),
                bandoriStationToken
            })
            console.log(res.data?.data)
        }
        else{
            let platform = user.platform
            await submitRoomNumber({
                number: number,
                rawMessage: raw_message,
                source: platform,
                userId: user.user_id,
                time: Date.now(),
                userName:session.username,
                bandoriStationToken
            }, user)
        }
    }
}

