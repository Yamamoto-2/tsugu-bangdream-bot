import { globalDefaultServer } from '../../config';
import { Server } from '../../types/Server';
import { drawListByServerList } from '../list'
import { Canvas } from 'canvas'

interface timeInListOptions {
    key?: string;
    content: Array<number | null>
}
export async function drawTimeInList({
    key,
    content
}: timeInListOptions, defaultServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    var formatedTimeList: Array<string> = []
    for (let i = 0; i < content.length; i++) {
        const element = content[i];
        if (element == null) {
            formatedTimeList.push(null)
            continue
        }
        formatedTimeList.push(changeTimefomant(element))
    }
    var canvas = await drawListByServerList(formatedTimeList, key, defaultServerList)
    return canvas
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

export function changeTimePeriodFormat(period: number): string {//时间戳的差值到月日时分秒
    if (period == null) {
        return '?'
    }
    
    var months = Math.floor(period / (1000 * 60 * 60 * 24 * 30));
    var days = Math.floor((period % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    var hours = Math.floor((period % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((period % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((period % (1000 * 60)) / 1000);

    var temp = "";

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