import { globalDefaultServer } from '@/config';
import { getPresentEvent } from '@/types/Event';
import { Server, getServerByName } from '@/types/Server';
import { drawListByServerList } from '@/components/list'
import { Canvas } from 'skia-canvas'
import { Event } from '@/types/Event'
import mainAPI from "@/types/_Main";

interface timeInListOptions {
    key?: string;
    content: Array<number | null>;
    eventId?: number;
    estimateCNTime?: boolean;
}
export async function drawTimeInList({
    key,
    content,
    eventId,
    estimateCNTime = false
}: timeInListOptions, displayedServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    var formatedTimeList: Array<string> = []
    for (let i = 0; i < content.length; i++) {
        const element = content[i];
        if (element == null) {
            if (i == 3 && estimateCNTime) {
                const currentEvent = getPresentEvent(getServerByName("cn"));
                const currentEventId = currentEvent.eventId;
                if (eventId > currentEventId) {
                    formatedTimeList.push(changeTimefomant(GetProbablyTimeDifference(eventId, currentEvent)) + " (预计开放时间)")
                }
            }
            formatedTimeList.push(null)
            continue
        }
        formatedTimeList.push(changeTimefomant(element))
    }
    var canvas = await drawListByServerList(formatedTimeList, key, displayedServerList)
    return canvas
}
//获取当前活动与查询活动的大致时间差(国服)
//注: 返回的并非时间差，而是活动预计开始的时间戳
export function GetProbablyTimeDifference(eventId: number, currentEvent: Event): number {
    let eventsData = mainAPI['events'];
    let sureEndEvent = 298  // 确定已经结束的Event，减少循环量
    let blockEventIdList:number[] = []  // 对于国服而言，涉及预估逻辑之内但不会举办的活动
    let presentEventJP = getPresentEvent(Server.jp).eventId   // 取得日服最新一期的活动
    let currentEventWithNoBanGDaysTotalOffset = 0
    let currentEventId = currentEvent.eventId
    // 计算当前活动日服与国服的实际持续天数偏移
    let eventLenOffset = occupiedDays(new Event(currentEventId).startAt[Server.cn],new Event(currentEventId).endAt[Server.cn])
                        - occupiedDays(new Event(currentEventId).startAt[Server.jp],new Event(currentEventId).endAt[Server.jp])
    let defaultNoBanGDays = 1   // 对于没有推断无邦日的，默认一天无邦日。
    // 计算当前正在进行的活动含无邦日当天一共有多少天
    if (currentEventId < presentEventJP){
        currentEventWithNoBanGDaysTotalOffset = (occupiedDays(new Event(currentEventId).startAt[Server.jp],new Event(currentEventId+1).startAt[Server.jp])-1+eventLenOffset)*24*3600*1000
    }
    else if(currentEventId == presentEventJP){
        // 如果当前活动与日服并行，则计算无邦日就从上一个endAt到这一个endAt
        currentEventWithNoBanGDaysTotalOffset = (occupiedDays(new Event(currentEventId-1).endAt[Server.jp],new Event(currentEventId).endAt[Server.jp])-1+eventLenOffset)*24*3600*1000
    }
    else{
        // 预防国服可能出现与台服一样存在自有活动的情形，如台服5001。
        currentEventWithNoBanGDaysTotalOffset = (occupiedDays(new Event(currentEventId).startAt[Server.cn],new Event(currentEventId).endAt[Server.cn])+defaultNoBanGDays)*24*3600*1000
    }
    let ProbablyTimeOffset = currentEvent.startAt[Server.cn]    // 等于正在举办活动的StartAt
    for(var i = sureEndEvent ;i<presentEventJP;i++){
        if (!eventsData[i.toString()]["startAt"][Server.cn]){   // 对于国服来说当前活动未举办
            // 计算活动相对于日服（含无邦日）的时长。
            ProbablyTimeOffset +=(occupiedDays(new Event(i).startAt[Server.jp],new Event(i+1).startAt[Server.jp]) -1 )*24*3600*1000
        }
        if (i + 1 == eventId) return (ProbablyTimeOffset + currentEventWithNoBanGDaysTotalOffset) //如果下一个循环是要获取的时间
        if (blockEventIdList.includes(i+1)) continue    // 对于国服而言不会举办的活动，跳过
    }
    let presentEventJPLen=(occupiedDays(new Event(presentEventJP).startAt[Server.jp],new Event(presentEventJP).endAt[Server.jp])+defaultNoBanGDays)*24*3600*1000
    return ProbablyTimeOffset + currentEventWithNoBanGDaysTotalOffset + presentEventJPLen  // 日服321，预测322+
}

export function changeTimefomant(timeStamp: number | null) {//时间戳到年月日 精确到分钟
    if (timeStamp == null) {
        return '?'
    }
    var date = new Date(Math.floor(timeStamp / 1000) * 1000)
    var nMinutes: string
    if (date.getMinutes() < 10) {
        nMinutes = "0" + date.getMinutes().toString()
        if (date.getMinutes() == 0) { nMinutes = "00" }
    }
    else {
        nMinutes = date.getMinutes().toString()
    }
    var temp = date.getFullYear().toString() + "年" + (date.getMonth() + 1).toString() + "月" + date.getDate().toString() + "日 " + date.getHours().toString() + ":" + nMinutes
    return temp
}

export function changeTimefomantMonthDay(timeStamp: number | null) {//获取生日的月与日
    function toJapanTime(dateString) {
        // 创建一个新的Date实例，表示当前时间。
        let date = new Date(dateString);

        // 获取本地时间与UTC的时间差（分钟）。
        let offset = date.getTimezoneOffset() * 60000;

        // 将本地时间转换为UTC时间。
        let utcTime = date.getTime() + offset;

        // 日本时区的偏移量是UTC+9。
        let japanTimeOffset = 9 * 60 * 60 * 1000;

        // 将UTC时间转换为日本时间。
        let japanTime = new Date(utcTime + japanTimeOffset);

        // 返回日本时间的字符串表示。
        return japanTime;
    }

    if (timeStamp == null) {
        return '?'
    }
    var date = toJapanTime(timeStamp)
    var nMinutes: string
    if (date.getMinutes() < 10) {
        nMinutes = "0" + date.getMinutes().toString()
        if (date.getMinutes() == 0) { nMinutes = "00" }
    }
    else {
        nMinutes = date.getMinutes().toString()
    }
    var temp = (date.getMonth() + 1).toString() + "月" + date.getDate().toString() + "日 "
    return temp
}

export function changeTimePeriodFormat(period: number): string {//时间戳的差值到年月日时分秒
    if (period == null) {
        return '?'
    }

    var centery = Math.floor(period / (1000 * 60 * 60 * 24 * 30 * 12 * 100));
    var years = Math.floor(period / (1000 * 60 * 60 * 24 * 30 * 12));
    var months = Math.floor(period / (1000 * 60 * 60 * 24 * 30));
    var days = Math.floor((period % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    var hours = Math.floor((period % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((period % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((period % (1000 * 60)) / 1000);

    var temp = "";

    if (centery != 0) {
        temp += centery.toString() + "世纪";
    }
    if (years != 0) {
        temp += years.toString() + "年";
    }
    if (months != 0) {
        temp += months.toString() + "月";
    }
    if (days != 0) {
        temp += days.toString() + "日";
    }
    if (hours != 0) {
        temp += hours.toString() + "小时";
    }
    if (minutes != 0) {
        temp += minutes.toString() + "分钟";
    }
    temp += seconds.toString() + "秒";

    return temp;
}

//时间长度转时分秒函数
export function formatSeconds(value: number) {
    var theTime = value;// 秒
    var theTime1 = 0;// 分
    var theTime2 = 0;// 小时
    if (theTime > 60) {
        theTime1 = parseInt((theTime / 60).toString());
        theTime = parseInt((theTime % 60).toString());
        if (theTime1 > 60) {
            theTime2 = parseInt((theTime1 / 60).toString());
            theTime1 = parseInt((theTime1 % 60).toString());
        }
    }
    var result = "" + parseInt(theTime.toString()) + "秒";
    if (theTime1 > 0) {
        result = "" + parseInt(theTime1.toString()) + "分" + result;
    }
    if (theTime2 > 0) {
        result = "" + parseInt(theTime2.toString()) + "小时" + result;
    }
    return result;
}

function occupiedDays(startTs: number, endTs: number): number {
    const start = new Date(startTs);
    const end = new Date(endTs);

    // 取年月日，忽略时分秒
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const msPerDay = 1000 * 60 * 60 * 24;

    // 计算跨越的天数，再加1包含第一天
    return Math.floor((endDay.getTime() - startDay.getTime()) / msPerDay) + 1;
}
