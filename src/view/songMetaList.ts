import { h, Element, Context } from 'koishi'
import { Song, getMetaRanking } from "../types/Song";
import { Canvas, createCanvas, Image, loadImage } from "canvas"
import { drawTitle } from '../components/title';
import { outputFinalBuffer } from '../image/output'
import { drawSongInList } from '../components/list/song';
import { drawDottedLine } from '../image/dottedLine';
import {  stackImageHorizontal } from '../components/utils';
import { Server} from '../types/Server';
import { serverNameFullList } from '../config';
import { drawDatablock } from '../components/dataBlock'

// 紧凑化虚线分割
const line = drawDottedLine({
    width: 800,
    height: 10,
    startX: 5,
    startY: 5,
    endX: 795,
    endY: 5,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

export async function drawSongMetaList(server: Server) {
    const feverMode = [true, false]
    const imageList = []
    for (let i = 0; i < feverMode.length; i++) {
        const element = feverMode[i];
        imageList.push(await drawMetaRankListDatablock(element, server))
    }
    var all = []
    all.push(drawTitle('查询', `${serverNameFullList[server]} 效率排行榜`))
    all.push(stackImageHorizontal(imageList))
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: true
    })
    return h.image(buffer, 'image/png')
}

async function drawMetaRankListDatablock(Fever: boolean, server: Server): Promise<Canvas> {
    const metaRanking = getMetaRanking(Fever, server);
    const maxMeta = metaRanking[0].meta
    let list: Array<Canvas> = []
    for (let i = 0; i < 50; i++) {
        let song = new Song(metaRanking[i].songId)
        let difficultyId = metaRanking[i].difficulty
        let precent = metaRanking[i].meta / maxMeta * 100
        precent = Math.round(precent * 100) / 100
        list.push(await drawSongInList(song, difficultyId, `相对效率: ${precent}% #${metaRanking[i].rank + 1}`))
        list.push(line)
    }
    list.pop()
    const topLeftText = Fever ? '有Fever' : '无Fever'
    return (drawDatablock({ list, topLeftText }))
}

