import { callAPIAndCacheResponse } from '@/api/getApi';
import mainAPI from '@/types/_Main';
import { Bestdoriurl, tierListOfServer } from '@/config';
import { Server } from '@/types/Server';
import { Event } from '@/types/Event';
import { predict } from '@/api/cutoff.cjs'

export class Cutoff {
    eventId: number;
    server: Server;
    tier: number;
    isExist = false;
    cutoffs: { time: number, ep: number }[];
    eventType: string;
    latestCutoff: { time: number, ep: number };
    rate: number | null;
    predictEP: number;
    startAt: number;
    endAt: number;
    status: 'not_start' | 'in_progress' | 'ended';
    isInitfull: boolean = false;
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
        if (!tierListOfServer[Server[server]].includes(tier)) {
            this.isExist = false;
            return
        }
        this.tier = tier
        this.isExist = true;
        this.startAt = event.startAt[server]
        this.endAt = event.endAt[server]
        const tempEvent = new Event(this.eventId)

        //状态
        var time = new Date().getTime()
        if (time < tempEvent.startAt[this.server]) {
            this.status = 'not_start'
        }
        else if (time > tempEvent.endAt[this.server]) {
            this.status = 'ended'
        }
        else {
            this.status = 'in_progress'
        }
    }
    async initFull() {
        if (this.isInitfull) {
            return
        }
        if (this.isExist == false) {
            return
        }
        let cutoffData
        //如果cutoff的活动已经结束，则使用缓存
        const time = new Date().getTime()
        if (time < this.endAt + 1000 * 60 * 60 * 24 * 2) {
            cutoffData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/tracker/data?server=${<number>this.server}&event=${this.eventId}&tier=${this.tier}`)
        }
        else {
            cutoffData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/tracker/data?server=${<number>this.server}&event=${this.eventId}&tier=${this.tier}`, 1 / 0)
        }
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
            const event = new Event(this.eventId)
            this.latestCutoff = { time: event.startAt[this.server], ep: 0 }
            return
        }
        else {
            this.latestCutoff = this.cutoffs[this.cutoffs.length - 1]
        }
        //rate
        let rateDataList = mainAPI['rates'] as [{ server: number, type: string, tier: number, rate: number }]
        let rateData = rateDataList.find((element) => {
            return element.server == this.server && element.type == this.eventType && element.tier == this.tier
        }
        )
        if (rateData == undefined) {
            this.rate = null
        }
        else {
            this.rate = rateData.rate
        }
        if (this.status == 'in_progress') {
            this.predict()
        }
        this.isInitfull = true
    }
    predict(): number {
        if (this.isExist == false) {
            return
        }
        const event = new Event(this.eventId)
        let start_ts = Math.floor(event.startAt[this.server] / 1000)
        let end_ts = Math.floor(event.endAt[this.server] / 1000)
        let cutoff_ts: { time: number, ep: number }[] = []
        for (let i = 0; i < this.cutoffs.length; i++) {
            const element = this.cutoffs[i];
            cutoff_ts.push({ time: Math.floor(element.time / 1000), ep: element.ep })
        }
        try {
            var result = predict(cutoff_ts, start_ts, end_ts, this.rate)
        } catch (e) {
            console.log(e)
            this.predictEP = 0
            return this.predictEP
        }
        this.predictEP = Math.floor(result.ep)
        return this.predictEP
    }
    getChartData(setStartToZero = false): { x: Date, y: number }[] {
        if (this.isExist == false) {
            return [];
        }
        let chartData: { x: Date, y: number }[] = [];
        if (setStartToZero) {
            chartData.push({ x: new Date(0), y: 0 });
        } else {
            chartData.push({ x: new Date(this.startAt), y: 0 });
        }

        // 在访问 this.cutoffs[0].time 之前检查 this.cutoffs 是否存在且长度大于0
        let tempTime = this.cutoffs && this.cutoffs.length > 0 ? this.cutoffs[0].time : null;
        // 如果 tempTime 为 null，则后续逻辑应当考虑这种情况以避免错误

        for (let i = 0; i < this.cutoffs.length; i++) {
            const element = this.cutoffs[i];
            if (setStartToZero) {
                // 确保 tempTime 不为 null 才执行减法操作
                chartData.push({ x: tempTime ? new Date(element.time - this.startAt) : new Date(0), y: element.ep });
            } else {
                chartData.push({ x: new Date(element.time), y: element.ep });
            }
            tempTime = element.time;
        }
        return chartData;
    }

}