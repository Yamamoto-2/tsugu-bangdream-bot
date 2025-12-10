import { drawSongInList } from "@/components/list/song"
import { Song } from "@/types/Song"
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { drawDottedLine } from '@/image/dottedLine'

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

export async function drawSongListDataBlock(songList: Song[], topLeftText?: string) {
    var list: Array<Image | Canvas> = []
    for (let i = 0; i < songList.length; i++) {
        list.push(await drawSongInList(songList[i]))
        list.push(line)
    }
    list.pop()
    return (drawDatablock({ list, topLeftText }))
}