import { Canvas } from 'skia-canvas'
import { Band } from "@/types/Band"
import { Server, getServerByPriority } from "@/types/Server"
import { Song } from "@/types/Song"
import { drawText, setFontStyle } from "@/image/text"
import { resizeImage } from "@/components/utils"
import { drawDifficulityList, drawDifficulity } from "@/components/list/difficulty"
import { globalDefaultServer } from "@/config"
import { drawList } from '../list'
import { drawDottedLine } from '@/image/dottedLine'

export async function drawSongInList(song: Song, difficulty?: number, text?: string, displayedServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    var server = getServerByPriority(song.publishedAt, displayedServerList)
    var songImage = resizeImage({
        image: await song.getSongJacketImage(),
        widthMax: 80,
        heightMax: 80
    })

    var canvas = new Canvas(800, 75)
    var ctx = canvas.getContext("2d")
    ctx.drawImage(songImage, 50, 5, 65, 65)
    //id
    var IDImage = drawText({
        text: song.songId.toString(),
        textSize: 23,
        lineHeight: 37.5,
        maxWidth: 800
    })
    ctx.drawImage(IDImage, 0, 0)
    //曲名与乐队名
    var fullText = `${song.musicTitle[server]}`
    if (!text) {
        //如果没有传入text参数，使用乐队名
        fullText += `\n${new Band(song.bandId).bandName[server]}`
    }
    else {
        //如果传入了text参数，使用text参数代替乐队名
        fullText += `\n${text}`
    }
    var textImage = drawText({
        text: fullText,
        textSize: 23,
        lineHeight: 37.5,
        maxWidth: 800
    })
    ctx.drawImage(textImage, 120, 0)

    //难度
    if (difficulty == undefined) {
        var difficultyImage = drawDifficulityList(song, 45, 10)
    }
    else {
        var difficultyImage = drawDifficulity(difficulty, song.difficulty[difficulty].playLevel, 45)
    }
    ctx.drawImage(difficultyImage, 800 - difficultyImage.width, 75 / 2 - difficultyImage.height / 2)
    return canvas
}

export async function drawSongListInList(songs: Song[], difficulty?: number, text?: string, displayedServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    let height: number = 75 * songs.length + 10 * (songs.length - 1)
    let canvas = new Canvas(760, height)
    let ctx = canvas.getContext("2d")
    let x = 0
    let y = 0
    let views: Canvas[] = []
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
    for (let i = 0; i < songs.length; i++) {
        views.push(resizeImage({ image: await drawSongInList(songs[i], difficulty, text, displayedServerList), widthMax: 760 }))
        views.push(line)
    }
    views.pop()
    for (let i = 0; i < views.length; i++) {
        ctx.drawImage(views[i], x, y)
        y += views[i].height
    }
    return await drawList({
        key: '歌榜歌曲',
        content: [canvas],
        textSize: canvas.height,
        lineHeight: canvas.height + 20,
        spacing: 0
    })
}