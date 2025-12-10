import { Event } from '@/types/Event';
import { drawList, line, drawListMerge } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { changeTimePeriodFormat } from '@/components/list/time';
import { Server } from '@/types/Server';
import { drawTitle } from '@/components/title'
import { outputFinalBuffer } from '@/image/output'
import { Cutoff } from "@/types/Cutoff";
import { drawCutoffChart } from '@/components/chart/cutoffChart'
import { serverNameFullList } from '@/config';
import { drawEventDatablock } from '@/components/dataBlock/event';
import { statusName } from '@/config';
import { loadImageFromPath } from '@/image/utils';

export async function drawCutoffDetail(eventId: number, tier: number, mainServer: Server, compress: boolean): Promise<Array<Buffer | string>> {
    var cutoff = new Cutoff(eventId, mainServer, tier)
    if (cutoff.isExist == false) {
        return [`错误: ${serverNameFullList[mainServer]} 活动或档线不存在`]
    }
    await cutoff.initFull()
    /*
    if (cutoff.isExist == false) {
        return '错误: 活动或档线数据错误'
    }
    */
    var all = []
    all.push(drawTitle('预测线', `${serverNameFullList[mainServer]} ${cutoff.tier}档线`))
    var list: Array<Image | Canvas> = []
    var event = new Event(eventId)
    all.push(await drawEventDatablock(event, [mainServer]))

    //状态
    var time = new Date().getTime()


    //如果活动在进行中    
    if (cutoff.status == 'in_progress') {
        cutoff.predict()
        if (cutoff.predictEP == null || cutoff.predictEP == 0) {
            var predictText = '?'
        }
        else {
            var predictText = cutoff.predictEP.toString()
        }

        //预测线和时速
        const cutoffs = cutoff.cutoffs
        const lastep = cutoffs.length > 1 ? cutoffs[cutoffs.length - 2].ep : 0
        const timeSpan = (cutoffs.length > 1 ? cutoff.latestCutoff.time - cutoffs[cutoffs.length - 2].time : cutoff.latestCutoff.time - cutoff.startAt) / (1000 * 3600)
        list.push(drawListMerge([
            drawList({
                key: '预测线',
                text: predictText
            }),
            drawList({
                key: '当前时速',
                text: `${Math.round((cutoff.latestCutoff.ep - lastep) / timeSpan)} pt/h`
            })
        ]))
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

        //活动剩余时间
        list.push(drawList({
            key: '活动剩余时间',
            text: `${changeTimePeriodFormat(cutoff.endAt - time)}`
        }))
        list.push(line)

    }
    else if (cutoff.status == 'ended') {
        list.push(drawList({
            key: '状态',
            text: statusName[cutoff.status]
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
    list.push(new Canvas(800, 50))

    //折线图
    list.push(await drawCutoffChart([cutoff]))

    //创建最终输出数组
    var listImage = drawDatablock({ list })

    all.push(listImage)
    /*
    all.push(drawTips({
        text: '想给我们提供数据?\n可以在B站 @Tsugu_Official 的置顶动态留言\n或者在群238052000中提供数据\n也可以扫描右侧二维码进行上传\n手机可以长按图片扫描二维码\n我们会尽快将数据上传至服务器',
        image: await loadImageFromPath(path.join(assetsRootPath, 'tsugu.png'))
    }))
    */
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress: compress,
    })

    return [buffer];

}
