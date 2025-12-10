import { Canvas } from 'skia-canvas';
import { drawText } from "@/image/text";
import { drawImageWithShadow } from "@/image/drawImageWithShadow"
import { Event } from "@/types/Event";
import { Server } from "@/types/Server";
import { resizeImage } from "@/components/utils";
import { outputFinalCanv } from "@/image/output"

export async function drawArticleTitle1(text: string, subText?: string, event?: Event, BG: boolean = false): Promise<Canvas> {
    let baseX = 0
    if (event) {
        baseX = 450
    }
    const canvas = new Canvas(1000, 130)
    const ctx = canvas.getContext("2d")
    // 画EventLogo
    if (event) {
        const logoImage = await event.getEventLogoImage(Server.tw)
        const logoResized = resizeImage({ image: logoImage, heightMax: 140 })
        drawImageWithShadow(ctx, logoResized, 500 - logoResized.width, -10)
    }

    // 画一个矩形
    const rectCanvas = new Canvas(5, 120)
    const rectCtx = rectCanvas.getContext("2d")
    rectCtx.fillStyle = "#ffffff"
    rectCtx.fillRect(0, 0, 5, 120)
    drawImageWithShadow(ctx, rectCanvas, 50 + baseX, 0)

    // 画文字
    const textImage = drawText({
        text,
        maxWidth: 800,
        textSize: 66,
        color: "#ffffff",
        font: "FangZhengHeiTi"
    })
    drawImageWithShadow(
        ctx,
        textImage,
        70 + baseX,
        0,
    )

    if (subText) {
        const subTextImage = drawText({
            text: subText,
            maxWidth: 800,
            textSize: 33,
            color: "#ffffff",
            font: "FangZhengHeiTi"
        })
        drawImageWithShadow(
            ctx,
            subTextImage,
            70 + baseX,
            77,
        )
    }
    if (BG) {
        const BGimage = await event.getEventBGImage()
        return (await outputFinalCanv({
            startWithSpace: true,
            imageList: [canvas],
            useEasyBG: false,
            BGimage: BGimage,
            text: ''
        }))
    }
    else {
        return canvas
    }
}