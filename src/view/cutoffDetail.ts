import { h, Element } from 'koishi'
import {  getPresentEvent } from '../types/Event';
import { drawList, line, drawListByServerList, drawTips, drawListMerge } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { Image, Canvas } from 'canvas'
import { drawTimeInList } from '../components/list/time';
import { Server, defaultserverList } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { Song} from '../types/Song'
import { drawSongDataBlock } from '../components/dataBlock/song';
import { Band } from '../types/Band';
import { drawEventDatablock } from '../components/dataBlock/event';
import { drawSongMetaListDataBlock } from '../components/dataBlock/songMetaList'
import { Cutoff } from "../types/Cutoff";
import { Event } from "../types/Event";

export async function drawCutoffDetail(eventId:number,tier:number,server:Server){
    var cutoff = new Cutoff(eventId,server,tier)
    if(cutoff.isExist == false){
        return '错误: 活动或档线不存在'
    }
    await cutoff.initFull()
    if(cutoff.isExist == false){
        return '错误: 活动或档线数据错误'
    }
    console.log(cutoff.predict())
}