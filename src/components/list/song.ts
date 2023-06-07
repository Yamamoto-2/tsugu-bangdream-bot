import { Canvas, createCanvas } from "canvas"
import { Band } from "../../types/Band"
import { Server, getServerByPriority } from "../../types/Server"
import { Song } from "../../types/Song"
import { drawText, setFontStyle } from "../text"
import { resizeImage } from "../utils"
import { drawDifficulityList, drawDifficulity } from "./difficulty"
import { globalDefaultServer } from "../../config"

export async function drawSongInList(song: Song, difficulty?: number, text?: string, defaultServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    var server = getServerByPriority(song.publishedAt, defaultServerList)
    var songImage = resizeImage({
        image: await song.getSongJacketImage(),
        widthMax: 80,
        heightMax: 80
    })

    var canvas = createCanvas(800, 75)
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