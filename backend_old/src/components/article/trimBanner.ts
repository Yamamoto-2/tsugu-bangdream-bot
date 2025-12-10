import { Canvas } from 'skia-canvas';
import { Event } from "@/types/Event";
import { createRoundedRectangleCanvas } from "@/image/createRoundedRectangleCanvas";
import { Server } from "@/types/Server";
import { resizeImage } from "@/components/utils";
import { drawImageWithShadow } from "@/image/drawImageWithShadow"


export async function drawArticleTrimBanner(event: Event): Promise<Canvas> {
    //Trim
    const topscreenTrimImage = await event.getEventTopscreenTrimImage()

    //BG
    const BG = await event.getEventBGImage()
    const cutBGCanvas = new Canvas(900, 450)
    const cutBGCtx = cutBGCanvas.getContext('2d')
    cutBGCtx.drawImage(BG, 0, 0, 900, BG.height * 900 / BG.width)
    const RoundedBG = await createRoundedRectangleCanvas(cutBGCanvas, 25)

    //Logo
    const logo = await event.getEventLogoImage(Server.tw)
    const resizedLogo = resizeImage({ image: logo, widthMax: 450 })

    const canvas = new Canvas(1000, 550)
    const ctx = canvas.getContext('2d')

    //画Image
    ctx.drawImage(RoundedBG, 50, 100)
    drawImageWithShadow(ctx, topscreenTrimImage, 200, -100, 750, 750)
    drawImageWithShadow(ctx, resizedLogo, 50, 550 - resizedLogo.height)

    return canvas
}