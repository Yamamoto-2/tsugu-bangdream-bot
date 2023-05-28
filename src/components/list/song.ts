import { Canvas, createCanvas } from "canvas"
import { Band } from "../../types/Band"
import { defaultserverList } from "../../types/Server"
import { Song } from "../../types/Song"
import { drawText, setFontStyle } from "../text"
import { resizeImage } from "../utils"
import { drawDifficulity } from "./difficulty"

export async function drawSongInList(song: Song): Promise<Canvas> {
    await song.initFull()
    var songImage = resizeImage({
        image: await song.getSongJacketImage(),
        widthMax: 80,
        heightMax: 80
    })
    var songName = drawText({
        text: song.musicTitle[defaultserverList[0].serverId] ?? song.musicTitle[0],
        textSize: 26,
        maxWidth: 500
    })
    // 写法存在一些小问题，English Ver歌曲会炸
    var bandId = song.bandId
    var bandName = drawText({
        text: new Band(bandId).bandName[defaultserverList[0].serverId],
        textSize: 26,
        maxWidth: 500
    })
    var tempcanv = createCanvas(800, 75)
    var ctx = tempcanv.getContext("2d")
    ctx.drawImage(songImage, 45, 5, 65, 65)
    ctx.textAlign = "start"
    ctx.textBaseline = "middle"
    setFontStyle(ctx, 23, "old")
    ctx.fillStyle = "#505050"
    for (var d in song.difficulty) {
        let i = parseInt(d)
        ctx.drawImage(await drawDifficulity(i, song.difficulty[i].playLevel), 800 - 55 * Object.keys(song.difficulty).length + 55 * i, 7.5, 60, 60)
    }
    ctx.fillText(song.songId.toString(), 16, 17.5)
    ctx.drawImage(songName, 116, 0)
    ctx.drawImage(bandName, 116, 34.5)
    return tempcanv
}