import { Room, submitRoomNumber } from "../types/Room";
import * as fs from 'fs'
import { carKeywordPath, tsuguUser, Channel } from "../config";
import { Session } from 'koishi'

interface Config {
    [type: string]: string[];
}

function loadConfig(): Config {
    const fileContent = fs.readFileSync(carKeywordPath, 'utf-8');
    return JSON.parse(fileContent);
}

const config = loadConfig();


export async function queryRoomNumber(session: Session<'tsugu', never>, number: number, raw_message: string, bandoriStationToken?: string) {
    const user = session.user.tsugu
    if (!user.car) {
        return
    }
    console.log(user)
    let isCar = false
    for (let i = 0; i < config['car'].length; i++) {
        const element = config['car'][i];
        if (raw_message.indexOf(element) != -1) {
            isCar = true
        }
    }
    for (let i = 0; i < config['fake'].length; i++) {
        const element = config['fake'][i];
        if (raw_message.indexOf(element) != -1) {
            isCar = false
        }
    }
    if (isCar) {
        let platform = user.platform
        if (platform == 'onebot'  || platform == 'red') {
            platform = 'qq'
        }
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

