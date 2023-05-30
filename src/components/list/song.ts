import { Canvas, createCanvas } from "canvas"
import { Band } from "../../types/Band"
import { defaultserverList, getServerByPriority } from "../../types/Server"
import { Song } from "../../types/Song"
import { drawText, setFontStyle } from "../text"
import { resizeImage } from "../utils"
import { drawDifficulityList } from "./difficulty"

export async function drawSongInList(song: Song): Promise<Canvas> {
    var server = getServerByPriority(song.publishedAt)
    var songImage = resizeImage({
        image: await song.getSongJacketImage(),
        widthMax: 80,
        heightMax: 80
    })
    var songName = drawText({
        text: server.getContentByServer(song.musicTitle),
        textSize: 26,
        maxWidth: 800
    })
    var bandId = song.bandId
    var bandName = drawText({
        text: server.getContentByServer(new Band(bandId).bandName),
        textSize: 26,
        maxWidth: 800
    })
    var tempcanv = createCanvas(800, 75)
    var ctx = tempcanv.getContext("2d")
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
    var songNameAndBandName = drawText({
        text: `${server.getContentByServer(song.musicTitle)}\n${server.getContentByServer(new Band(bandId).bandName)}`,
        textSize: 23,
        lineHeight: 37.5,
        maxWidth: 800
    })
    ctx.drawImage(songNameAndBandName, 120, 0)

    //难度
    var difficultyImage = drawDifficulityList(song, 45, 10)
    ctx.drawImage(difficultyImage, 800 - difficultyImage.width, 75 / 2 - difficultyImage.height / 2)
    return tempcanv
}