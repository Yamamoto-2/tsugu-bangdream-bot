import { drawSongInList } from "../list/song"
import { Song } from "../../types/Song"
import { drawDatablock } from '../dataBlock'
import { Image, Canvas, createCanvas } from "canvas"
import { drawDottedLine } from '../../image/dottedLine'
import { resizeImage, stackImage, stackImageHorizontal } from "../utils"
import { Server, getServerByPriority } from "../../types/Server"
import { Band } from "../../types/Band"
import { drawText } from "../text"
import { drawDifficulityList } from "../list/difficulty"

// 紧凑化虚线分割
const line = drawDottedLine({
    width: 365,
    height: 20,
    startX: 5,
    startY: 10,
    endX: 360,
    endY: 10,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

export async function drawSongDataBlock(song: Song, text?: string) {
    var server = getServerByPriority(song.publishedAt)
    var songJacketImage = await song.getSongJacketImage()
    // 缩放封面
    var songJacketCanvas = resizeImage({
        image: songJacketImage,
        widthMax: 400
    })
    var songName = server.getContentByServer(song.musicTitle)
    var bandName = server.getContentByServer(new Band(song.bandId).bandName)
    var songTipsName = song.getTagName()

    // 绘制歌曲名
    var songNameImage = drawText({
        text: songName,
        textSize: 40,
        maxWidth: 365
    })
    // 绘制歌曲信息
    var songDetail = `${bandName}\n${songTipsName}\nID:${song.songId}`
    if (text != undefined) {
        songDetail = `${songDetail}\n${text}`
    }
    var songDetailImage = drawText({
        text: songDetail,
        textSize: 30,
        maxWidth: 365
    })
    var difficultyImage = drawDifficulityList(song, 60, 10)
    var list = [songNameImage, line, songDetailImage, createCanvas(1, 60)]
    var rightCanvas = stackImage(list)
    var canvas = stackImageHorizontal([songJacketCanvas, createCanvas(35, 1), rightCanvas])
    var ctx = canvas.getContext("2d")
    ctx.drawImage(difficultyImage, 435, canvas.height - difficultyImage.height)
    return (drawDatablock({ list: [canvas] }))
}