import { createCanvas, Canvas } from 'canvas'
import { Song } from "../../types/Song"
import { drawText } from "../text"

export const difficultyColorList = ["#8eb4fd", "#a6f692", "#fbdf8c", "#ff898b", "#f383cb"] //画难度时使用的配色
export const difficultyNameList = ['easy', 'normal', 'hard', 'expert', 'special'] //难度名称

export function drawDifficulityList(song: Song, imageHeight: number = 60, spacing: number = 10): Canvas {
    var difficultyCount = Object.keys(song.difficulty).length
    var canvas = createCanvas(imageHeight * difficultyCount + (difficultyCount - 1) * spacing, imageHeight)
    var ctx = canvas.getContext("2d")
    for (var d in song.difficulty) {
        let i = parseInt(d)
        ctx.drawImage(drawDifficulity(i, song.difficulty[i].playLevel, imageHeight), i * (imageHeight + spacing), 0)
    }
    return canvas
}

export function drawDifficulity(difficultyType: number, playLevel: number, imageHeight: number) {
    var tempcanv = createCanvas(imageHeight, imageHeight)
    var ctx = tempcanv.getContext("2d")
    if (difficultyColorList[difficultyType] != undefined) {
        ctx.fillStyle = difficultyColorList[difficultyType]
    }
    else {
        ctx.fillStyle = "#f1f1f1"
    }
    ctx.arc(imageHeight / 2, imageHeight / 2, imageHeight / 2, 0, 2 * Math.PI)
    ctx.fill()
    var levelText = drawText({
        textSize: imageHeight / 3 * 2,
        text: playLevel.toString(),
        maxWidth: imageHeight * 3
    })
    ctx.drawImage(levelText, imageHeight / 2 - levelText.width / 2, imageHeight / 2 - levelText.height / 2)
    return (tempcanv)
}