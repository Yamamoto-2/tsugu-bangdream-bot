import { createCanvas } from "canvas"
import { setFontStyle } from "../text"

const difficultyColor = ["#8eb4fd", "#a6f692", "#fbdf8c", "#ff898b", "#f383cb"] //画难度时使用的配色
export async function drawDifficulity(difficulty: number, playLevel: number) {
    var tempcanv = createCanvas(80, 80)
    var ctx = tempcanv.getContext("2d")
    setFontStyle(ctx, 40, "old")
    ctx.textAlign = "center" //画难度，判断是否有SP
    ctx.textBaseline = "middle"
    ctx.fillStyle = difficultyColor[difficulty]
    ctx.arc(40, 40, 30, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = "#505050"
    ctx.fillText(playLevel.toString(), 40, 38)
    return (tempcanv)
}