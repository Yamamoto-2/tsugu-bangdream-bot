import { Room, submitRoomNumber } from "../types/Room";
import * as fs from 'fs'
import { carKeywordPath } from "../config";
import { Database, Random, Session, h } from "koishi";

interface Config {
    [type: string]: string[];
}

function loadConfig(): Config {
    const fileContent = fs.readFileSync(carKeywordPath, 'utf-8');
    return JSON.parse(fileContent);
}

const config = loadConfig();


export async function queryRoomNumber(session:Session<'tsugu', never>, number: number, raw_message: string) {
    if(!session.user.tsugu.car){
        return
    }
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
        let platform = session.platform
        if(platform == 'onebot'){
            platform = 'qq'
        }
        await submitRoomNumber({
            number: number,
            rawMessage: raw_message,
            source: platform,
            userId: session.userId,
            userName:session.username,
            time: Date.now()
        },session)
    }
}

