import { drawText } from "@/image/text";
import { Image, Canvas } from 'skia-canvas'

export function drawEventTeamIconBlock(teamIcons: Image[], teamNames: string[],themeNames:string, maxWidth = 760): Canvas {
    let iconSize = 160
    const textSize = 30;
    const textLineHeight = 40;
    const count = Math.min(teamIcons.length, teamNames.length, 2);
    const textCanvases = teamNames.slice(0, count).map((name) => drawText({
        text: name,
        maxWidth: iconSize,
        textSize,
        lineHeight: textLineHeight,
        font: 'old',
        forceSingleLine:true
    }));
    const titleCanvas = drawText({
        text: themeNames,
        maxWidth: textSize,
        textSize,
        lineHeight: textSize,
        font: 'old',
        forceSingleLine:true
    })
    let textMaxWidth = 160
    textCanvases.map((canvas)=> (canvas.width >textMaxWidth)?textMaxWidth= canvas.width:null)
    iconSize = iconSize > textMaxWidth?160:textMaxWidth;
    const iconSpacing = iconSize;
    const topPadding = 20 + titleCanvas.height ;
    const titleTopPadding = 15;

    let blockWidth = iconSize * count + iconSpacing * (count - 1);

    const textHeight = Math.max(...textCanvases.map((canvas) => canvas.height), 0);
    const height = topPadding + iconSize + 10 + textHeight + topPadding;
    const canvas = new Canvas(maxWidth, height);
    const ctx = canvas.getContext('2d');
    //console.log(textMaxWidth)
    const startX = Math.round((maxWidth - blockWidth) / 2);
    ctx.drawImage(titleCanvas, Math.round((maxWidth - titleCanvas.width) / 2), titleTopPadding);
    for (let i = 0; i < count; i++) {
        const icon = teamIcons[i];
        const textCanvas = textCanvases[i];
        const x = startX + i * (iconSize + iconSpacing);
        ctx.drawImage(icon, x, topPadding + titleTopPadding + 5, iconSize, iconSize);
        const textX = x + Math.round((iconSize - textCanvas.width) / 2) ;
        const textY = topPadding + titleTopPadding + iconSize +20 ;
        ctx.drawImage(textCanvas, textX, textY);
    }
    const vsCanvas = drawText({
        text: 'VS',
        maxWidth: 20,
        textSize:20,
        lineHeight: 20,
        font: 'old',
        forceSingleLine:true
    })
    let w =  maxWidth/2 - (vsCanvas.width / 2)
    ctx.drawImage(vsCanvas, w, topPadding + titleTopPadding + 10 + (iconSize-vsCanvas.height)/2);
    return canvas;
}