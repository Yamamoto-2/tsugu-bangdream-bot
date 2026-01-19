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
    // 待查的活动
    const tempEvent = new Event(eventId)

    // 查询已经进行过的活动并加入偏移量
    const eventsData = mainAPI['events'];
    const eventsRecord: Record<number,Event> = {};
    eventsRecord[currentEvent.eventId] = currentEvent;
    const completedEvent =
        Object.keys(eventsData).map(Number).filter((theEventId) => {
            // 活动ID层过滤
            if(theEventId <= currentEvent.eventId || theEventId >= eventId) return false;
            const theEvent = new Event(theEventId);
            // 防止undefined
            if (!theEvent.startAt[Server.jp] || !tempEvent.startAt[Server.jp] || !currentEvent.startAt[Server.jp]) return false;
            // 活动时间层过滤
            if(theEvent.startAt[Server.jp] <= currentEvent.startAt[Server.jp]
              || theEvent.startAt[Server.jp] >= tempEvent.startAt[Server.jp]) return false;
            eventsRecord[theEventId] = theEvent;
            return !!(theEvent.startAt[Server.cn]);
        });

    // 已完成活动需要调整的时间偏移（为负数），包括活动时间和活动前的无邦日
    const finishOffset = completedEvent.reduce((acc, cur) => {
        const theEvent = eventsRecord[cur];
        const preEvent = eventsRecord[cur-1];
        return acc + (preEvent.endAt[Server.jp] - theEvent.endAt[Server.jp]);
    }, 0)

    // 当期时长偏移，使得当期更改活动时长后（如294）对未来活动时间的预测仍准确
    const eventLengthOffset = (
        occupiedDays(currentEvent.startAt[Server.cn], currentEvent.endAt[Server.cn])
        - occupiedDays(currentEvent.startAt[Server.jp], currentEvent.endAt[Server.jp])
    )*24*3600*1000;

    const timeStamp = tempEvent.startAt[Server.jp] + (currentEvent.startAt[Server.cn] - currentEvent.startAt[Server.jp]) + finishOffset + eventLengthOffset;
    return timeStamp;
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
