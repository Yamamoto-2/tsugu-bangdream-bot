import { h, Element } from 'koishi'
import { Event } from '../types/Event';
import { Card } from '../types/Card'
import { drawList, line, drawListByServerList, drawTips, drawListMerge } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { drawGachaDatablock } from '../components/dataBlock/gacha'
import { Image, Canvas, createCanvas } from 'canvas'
import { drawBannerImageCanvas } from '../components/dataBlock/utils'
import { changeTimefomant } from '../components/list/time';
import { drawTimeInList } from '../components/list/time';
import { drawAttributeInList } from '../components/list/attribute'
import { drawCharacterInList } from '../components/list/character'
import { statConfig } from '../components/list/stat'
import { drawCardListInList } from '../components/list/cardIconList'
import { getPresentGachaList, Gacha } from '../types/Gacha'
import { Server, defaultserverList } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { drawDegreeListOfEvent } from '../components/list/degreeList';
import { Song, getPresentSongList } from '../types/Song'
import { drawSongListDataBlock } from '../components/dataBlock/songList';
import { Cutoff } from "../types/Cutoff";
import {drawCutoffChart} from '../components/chart/cutoffChat'

var statusName = {
    'not_start': '未开始',
    'in_progress': '进行中',
    'ended': '已结束'
}

export async function drawCutoffDetail(eventId: number, tier: number, server: Server) {
    var cutoff = new Cutoff(eventId, server, tier)
    if (cutoff.isExist == false) {
        return '错误: 活动或档线不存在'
    }
    await cutoff.initFull()
    /*
    if (cutoff.isExist == false) {
        return '错误: 活动或档线数据错误'
    }
    */
    console.log(cutoff)
    var list: Array<Image | Canvas> = []
    var event = new Event(eventId)

    //banner
    var eventBannerImage = await event.getBannerImage()
    var eventBannerImageCanvas = drawBannerImageCanvas(eventBannerImage)
    list.push(eventBannerImageCanvas)
    list.push(createCanvas(800, 30))

    //状态
    var time = new Date().getTime()
    var status = ''
    if (time < cutoff.startAt) {
        status = 'not_start'
    }
    else if (time > cutoff.endAt) {
        status = 'ended'
    }
    else {
        status = 'in_progress'
    }
    list.push(drawList({
        key: '状态',
        text: statusName[status]
    }))
    list.push(line)

    //如果活动在进行中    
    if (status == 'in_progress') {
        cutoff.predict()

        if (cutoff.predictEP == null || cutoff.predictEP == 0) {
            var predictText = '?'
        }
        else {
            var predictText = cutoff.predictEP.toString()
        }
        //预测线
        list.push(drawList({
            key: '预测线',
            text: predictText
        }))
        list.push(line)

        //最新分数线
        list.push(drawList({
            key: '最新分数线',
            text: cutoff.latestCutoff.ep.toString()
        }))
        list.push(line)

        //更新时间
        list.push(drawList({
            key: '更新时间',
            text: changeTimefomant(cutoff.latestCutoff.time)
        }))
        list.push(line)
    }
    else if (status == 'ended') {

        //最新分数线
        list.push(drawList({
            key: '最终分数线',
            text: cutoff.latestCutoff.ep.toString()
        }))
        list.push(line)
    }
    list.pop()

    //折线图
    list.push(await drawCutoffChart(cutoff))

    //创建最终输出数组
    var listImage = await drawDatablock({ list })
    var all = []
    all.push(drawTitle('查询', '活动'))
    all.push(listImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })

    return h.image(buffer, 'image/png')

}