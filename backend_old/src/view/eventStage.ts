import { Event } from '@/types/Event';
import { Server } from '@/types/Server';
import { EventStage, Stage } from '@/types/EventStage';
import { serverNameFullList } from '@/config';
import { drawTitle } from '@/components/title'
import { Canvas } from 'skia-canvas'
import { drawEventStageTypeTop, drawEventStageSongHorizontal } from '@/components/list/eventStage'
import { outputFinalBuffer } from '@/image/output'
import { drawDatablock } from '@/components/dataBlock'
import { stackImage, stackImageHorizontal } from '@/components/utils'

export async function drawEventStage(eventId: number, mainServer: Server, meta: boolean = false, compress: boolean): Promise<Array<Buffer | string>> {
    const event = new Event(eventId);
    if (!event.isExist) {
        return [`错误: 活动不存在`];
    }
    if (event.eventType != 'festival') {
        return [`错误: 活动不是festival类型`];
    }
    if (event.startAt[mainServer] == null) {
        return [`错误: ${serverNameFullList[mainServer]} ID:${eventId} 活动没有时间数据`];
    }

    const eventStage = new EventStage(eventId);
    await eventStage.initFull();
    if (!eventStage.isExist) {
        return [`错误: 活动stage数据不足`];
    }

    var all = []
    all.push(drawTitle('查试炼', `国服 ID:${eventId} 活动试炼`))

    //获得活动stage列表
    const stageList = eventStage.getStageList();

    let eventStagePromises = []

    //绘制活动stage，每个stage一个图片
    async function drawStageSong(stage: Stage) {
        return stackImage([
            await drawEventStageTypeTop(stage),
            await drawEventStageSongHorizontal(stage, meta)
        ])

    }

    for (let i = 0; i < stageList.length; i++) {
        const stage = stageList[i];
        eventStagePromises.push(drawStageSong(stage))
    }

    var eventStageResults = await Promise.all(eventStagePromises)

    //将活动stage图片纵向并横向合并
    var tempH = 0;
    const maxHeight = 6000;

    var tempEventStageImageList: Canvas[] = [];
    var eventStageImageListHorizontal: Canvas[] = [];

    for (var i = 0; i < eventStageResults.length; i++) {
        var tempImage = eventStageResults[i];
        tempH += tempImage.height;
        if (tempH > maxHeight) {
            if (tempEventStageImageList.length > 0) {
                eventStageImageListHorizontal.push(drawDatablock({ list: tempEventStageImageList }));
            }
            tempEventStageImageList = [];
            tempH = tempImage.height;
        }
        tempEventStageImageList.push(tempImage);

        if (i == eventStageResults.length - 1) {
            eventStageImageListHorizontal.push(drawDatablock({ list: tempEventStageImageList }));
        }
    }

    const eventStageListImage = stackImageHorizontal(eventStageImageListHorizontal)

    all.push(eventStageListImage)

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress: compress,
    })

    return [buffer];

}