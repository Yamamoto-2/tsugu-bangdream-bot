import { callAPIAndCacheResponse } from '../api/getApi';
import mainAPI from './_Main';
import { Bestdoriurl } from '../config';
import { Server } from './Server';
import { Event } from './Event';
import { predict } from '../api/cutoff.cjs'

export const tierListOfServer = {
    'jp': [10, 100, 500, 1000, 2000, 5000, 10000],
    'tw': [10, 100, 500],
    'en': [10, 50, 100, 300, 500, 1000, 2000, 2500],
    'kr': [10, 100],
    'cn': [10, 50, 100, 300, 500, 1000, 2000]
}

export class Cutoff {
    eventId: number;
    server: Server;
    tier: number;
    isExist = false;
    cutoffs: { time: number, ep: number }[];
    eventType: string;
    latestCutoff: { time: number, ep: number };
    rate: number | null;
    constructor(eventId: number, server: Server, tier: number) {
        const event = new Event(eventId)
        //如果活动不存在，直接返回
        if (!event.isExist) {
            this.isExist = false;
            return
        }
        this.eventType = event.eventType
        this.eventId = eventId
        this.server = server
        //如果该档线不在该服的档线列表中，直接返回
        if (!tierListOfServer[server.serverName].includes(tier)) {
            this.isExist = false;
            return
        }
        this.tier = tier
        this.isExist = true;
    }
    async initFull() {
        const cutoffData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/tracker/data?server=${this.server.serverId}&event=${this.eventId}&tier=${this.tier}`)
        if (cutoffData == undefined) {
            this.isExist = false;
            return
        }
        else if (cutoffData['result'] == false) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.cutoffs = cutoffData['cutoffs'] as { time: number, ep: number }[]
        if (this.cutoffs.length == 0) {
            this.latestCutoff = { time: 0, ep: 0 }
            return
        }
        else {
            this.latestCutoff = this.cutoffs[this.cutoffs.length - 1]
        }
        //rate
        var rateDataList = mainAPI['rates'] as [{ server: number, type: string, tier: number, rate: number }]
        var rateData = rateDataList.find((element) => {
            return element.server == this.server.serverId && element.type == this.eventType && element.tier == this.tier
        }
        )
        if (rateData == undefined) {
            this.rate = null
        }
        else {
            this.rate = rateData.rate
        }
    }
    predict(): number {
        if (this.isExist == false) {
            return
        }
        const event = new Event(this.eventId)
        var start_ts = Math.floor(this.server.getContentByServer(event.startAt) / 1000)
        var end_ts = Math.floor(this.server.getContentByServer(event.endAt) / 1000)
        var cutoff_ts: { time: number, ep: number }[] = []
        for (let i = 0; i < this.cutoffs.length; i++) {
            const element = this.cutoffs[i];
            cutoff_ts.push({ time: Math.floor(element.time/1000), ep: element.ep })
        }
        var result = predict(cutoff_ts, start_ts, end_ts, this.rate)
        return result.ep
    }
}