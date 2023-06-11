import { h, Element } from 'koishi'
import { Event } from '../types/Event';
import { drawList, line, drawListMerge } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { Image, Canvas, createCanvas } from 'canvas'
import { changeTimePeriodFormat } from '../components/list/time';
import { Server } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { Cutoff } from "../types/Cutoff";
import { drawCutoffChart } from '../components/chart/cutoffChat'
import { serverNameFullList } from '../config';
import { drawEventDatablock } from '../components/dataBlock/event';

var statusName = {
    'not_start': '未开始',
    'in_progress': '进行中',
    'ended': '已结束'
}

export async function drawCutoffDetail(eventId: number, tier: number, server: Server): Promise<Element | string> {
    var cutoff = new Cutoff(eventId, server, tier)
    if (cutoff.isExist == false) {
        return `错误: ${serverNameFullList[server]} 活动或档线不存在`
    }
    await cutoff.initFull()
    /*
    if (cutoff.isExist == false) {
        return '错误: 活动或档线数据错误'
    }
    */
    var all = []
    all.push(drawTitle('预测线', `${serverNameFullList[server]} ${cutoff.tier}档线`))
    var list: Array<Image | Canvas> = []
    var event = new Event(eventId)
    all.push(await drawEventDatablock(event))

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

        const tempImageList = []
        //最新分数线
        const finalCutoffImage = drawList({
            key: '最新分数线',
            text: cutoff.latestCutoff.ep.toString()
        })
        tempImageList.push(finalCutoffImage)

        //更新时间
        const finalTimeImage = drawList({
            key: '更新时间',
            text: `${changeTimePeriodFormat((new Date().getTime()) - cutoff.latestCutoff.time)}前`
        })
        tempImageList.push(finalTimeImage)

        list.push(drawListMerge(tempImageList)) //合并两个list
        list.push(line)

    }
    else if (status == 'ended') {
        list.push(drawList({
            key: '状态',
            text: statusName[status]
        }))
        list.push(line)

        //最新分数线
        list.push(drawList({
            key: '最终分数线',
            text: cutoff.latestCutoff.ep.toString()
        }))
        list.push(line)
    }
    list.pop()
    list.push(createCanvas(800, 50))

    //折线图
    list.push(await drawCutoffChart([cutoff]))

    //创建最终输出数组
    var listImage = drawDatablock({ list })

    all.push(listImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })

    return h.image(buffer, 'image/png')

}