import { Canvas, createCanvas } from "canvas"
import { Band } from "../../types/Band"
import { defaultserverList,getServerByPriority } from "../../types/Server"
import { Song } from "../../types/Song"
import { drawText, setFontStyle } from "../text"
import { resizeImage } from "../utils"
import { drawDifficulity } from "./difficulty"

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
    // 写法存在一些小问题，English Ver歌曲会炸
    var bandId = song.bandId
    var bandName = drawText({
        text: server.getContentByServer(new Band(bandId).bandName),
        textSize: 26,
        maxWidth: 800
    })
    var tempcanv = createCanvas(800, 75)
    var ctx = tempcanv.getContext("2d")
    ctx.drawImage(songImage, 50, 5, 65, 65)
    ctx.textAlign = "start"
    ctx.textBaseline = "middle"
    setFontStyle(ctx, 23, "old")
    ctx.fillStyle = "#505050"
    for (var d in song.difficulty) {
        let i = parseInt(d)
        ctx.drawImage(await drawDifficulity(i, song.difficulty[i].playLevel), 800 - 55 * Object.keys(song.difficulty).length + 55 * i, 7.5, 60, 60)
    }
    ctx.fillText(song.songId.toString(), 0, 17.5)
    ctx.drawImage(songName, 120, 0)
    ctx.drawImage(bandName, 120, 34.5)
    return tempcanv
}