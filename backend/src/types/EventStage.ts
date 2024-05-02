import { Event } from '@/types/Event';
import { Song } from './Song';
import { globalDefaultServer, Bestdoriurl } from '@/config';
import { callAPIAndCacheResponse } from '@/api/getApi';

export interface Stage {
    type: string,
    startAt: number,
    endAt: number,
    songIdList: Array<number>
}

export const stageTypeList = ['judge', 'combo', 'life']

export const stageTypeTextStrokeColor = {
    judge: '#b48335',
    combo: '#bc5e19',
    life: '#549b20',
    undefined: '#757575'
}

export const stageTypeName = {
    judge: '判定试炼',
    combo: 'COMBO试炼',
    life: 'LIFE试炼',
    undefined: '未知类型试炼'
}

export class EventStage {
    eventId: number;
    isExist: boolean = false;
    isInitFull = false;
    stageType: Array<{ type: string, startAt: string, endAt: string }>;
    rotationMusics: Array<{ musicId: string, startAt: string, endAt: string }>;
    constructor(eventId: number) {
        this.eventId = eventId;
        const event = new Event(eventId)
        if (!event.isExist) {
            this.isExist = false;
            return;
        }
        if (event.eventType != 'festival') {
            this.isExist = false;
            return;
        }
        this.isExist = true;
    }
    async initFull() {
        if (!this.isExist) {
            return;
        }
        if (this.isInitFull) {
            return;
        }
        try {
            let stageData = await this.getData(true, 'stages')
            let rotationMusicsData = await this.getData(true, 'rotationMusics')
            this.stageType = stageData as any
            this.rotationMusics = rotationMusicsData as any
            this.isInitFull = true;
        }
        catch (e) {
            this.isExist = false;
        }
    }
    async getData(update: boolean = true, type: 'stages' | 'rotationMusics') {
        var time = update ? 0 : 1 / 0;
        var eventData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/festival/${type}/${this.eventId}.json`, time);
        return eventData;
    }

    getStageList(): Stage[] {//获取所有的stage,并且按照时间排序 [{type,startAt,endAt,songIdList}]
        if (!this.isInitFull) {
            return;
        }
        let temp = {}
        for (let i in this.rotationMusics) {
            let tempStartAt = this.rotationMusics[i].startAt;
            if (temp[tempStartAt] == undefined) {
                temp[tempStartAt] = { startAt: this.rotationMusics[i].startAt, endAt: this.rotationMusics[i].endAt, music: [] }
            };
            temp[tempStartAt].music.push(this.rotationMusics[i].musicId);
        }
        let tempStageList: Stage[] = []
        for (let i in temp) {
            const element = temp[i];
            let tempStartAt = parseInt(element.startAt);
            let tempEndAt = parseInt(element.endAt);
            let tempStageType = this.getStageTypeByTime(tempStartAt, tempEndAt);
            tempStageList.push({ type: tempStageType, startAt: tempStartAt, endAt: tempEndAt, songIdList: temp[i].music });
        }
        //排序
        tempStageList.sort((a, b) => {
            return a.startAt - b.startAt;
        });

        return tempStageList;
    }

    getStageTypeByTime(startAt: number, endAt: number): string {//根据时间获取当前stage类型
        if (!this.isInitFull) {
            return;
        };
        let stage = this.stageType.find(x => {
            let startTime = parseInt(x.startAt);
            let endTime = parseInt(x.endAt);
            if (startTime <= endAt && endTime >= startAt) {
                return true;
            }
            return false;
        });
        return stage?.type || 'undefined';
    }
}

