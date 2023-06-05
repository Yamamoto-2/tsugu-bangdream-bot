import { h, Element } from 'koishi'
import { Event } from '../types/Event';
import { drawList, line } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { Image, Canvas, createCanvas } from 'canvas'
import { drawBannerImageCanvas } from '../components/dataBlock/utils'
import { changeTimefomant } from '../components/list/time';
import { Server } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { Cutoff, tierListOfServer } from "../types/Cutoff";
import { drawCutoffChart } from '../components/chart/cutoffChat'
import { serverNameFullList } from '../config';

var statusName = {
    'not_start': '未开始',
    'in_progress': '进行中',
    'ended': '已结束'
}

export async function drawCutoffListOfEvent(eventId: number, server: Server): Promise<Element | string> {
    var event = new Event(eventId)
    const list: Array<Image | Canvas> = []
    //banner
    var eventBannerImage = await event.getBannerImage()
    var eventBannerImageCanvas = drawBannerImageCanvas(eventBannerImage)
    list.push(eventBannerImageCanvas)
    list.push(createCanvas(800, 30))
    //状态
    var time = new Date().getTime()
    var status = ''
    if (time < event.startAt[server]) {
        status = 'not_start'
    }
    else if (time > event.endAt[server]) {
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

    //初始化档线列表
    var tierList = tierListOfServer[Server[server]]
    var cutoffList: Array<Cutoff> = []
    for (var i in tierList) {
        var tempCutoff = new Cutoff(eventId, server, tierList[i])
        await tempCutoff.initFull()
        if (status == 'in_progress') {
            tempCutoff.predict()
        }
        cutoffList.push(tempCutoff)
    }
    //每个档线详细数据
    for (var i in cutoffList) {
        const cutoff = cutoffList[i]
        let cutoffContent: string[] = []
        if (status == 'in_progress') {
            let predictText: string
            if (cutoff.predictEP == null || cutoff.predictEP == 0) {
                predictText = '?'
            }
            else {
                predictText = cutoff.predictEP.toString()
            }
            cutoffContent.push(`当前预测线: ${predictText}\n`)
            cutoffContent.push(`最新分数线: ${cutoff.latestCutoff.ep.toString()}\n`)
            cutoffContent.push(`更新时间:${changeTimefomant(cutoff.latestCutoff.time)}`)
        }
        else if (status == 'ended') {
            cutoffContent.push(`最终分数线:${cutoff.latestCutoff.ep.toString()}\n`)
        }


        list.push(drawList({
            key: `T${cutoff.tier}`,
            content: cutoffContent
        }))
        list.push(line)
    }
    list.pop()
    list.push(createCanvas(800, 50))

    //折线图
    list.push(await drawCutoffChart(cutoffList))

    //创建最终输出数组
    var listImage = await drawDatablock({ list })
    var all = []
    all.push(drawTitle('档线列表', `${serverNameFullList[server]}`))
    all.push(listImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })

    return h.image(buffer, 'image/png')
}