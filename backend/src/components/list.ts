import { Canvas, Image } from 'skia-canvas';
import { drawRoundedRectWithText } from '@/image/drawRect';
import { drawText, drawTextWithImages } from '@/image/text';
import { drawDottedLine } from '@/image/dottedLine'
import { Server, getServerByPriority, getIcon } from '@/types/Server'
import { stackImageHorizontal } from '@/components/utils';
import { globalDefaultServer } from '@/config';

//表格用默认虚线
export const line: Canvas = drawDottedLine({
    width: 800,
    height: 30,
    startX: 5,
    startY: 15,
    endX: 795,
    endY: 15,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

interface ListOptions {
    key?: string;
    text?: string;
    content?: Array<string | Canvas | Image>
    textSize?: number;
    lineHeight?: number;
    spacing?: number;
    color?: string;
    maxWidth?: number;
}

//画表格中的一行
export function drawList({
    key,
    text,
    content,
    textSize = 40,
    lineHeight = textSize * 1.5,
    spacing = textSize / 3,
    color = '#505050',
    maxWidth = 800

}: ListOptions): Canvas {
    const xmax = maxWidth - 40
    const keyImage = drawRoundedRectWithText({
        text: key,
        textSize: 30,
    });

    var textImage: Canvas
    if (typeof text == "string") {
        textImage = drawText({ text, maxWidth: xmax, lineHeight });
    }
    else if (content != undefined) {
        textImage = drawTextWithImages({
            content,
            maxWidth: xmax,
            lineHeight,
            textSize,
            spacing,
            color
        });
    }
    else {
        textImage = new Canvas(0, 0)
    }
    if (key == undefined) {
        return stackImageHorizontal([new Canvas(20, 1), textImage])
    }
    var ymax = textImage.height + keyImage.height + 10;
    const canvas = new Canvas(maxWidth, ymax);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(keyImage, 0, 0);
    ctx.drawImage(textImage, 20, keyImage.height + 10);
    return canvas;
}

interface tipsOptions {
    text?: string;
    content?: Array<string | Canvas | Image>
    textSize?: number;
    lineHeight?: number;
    spacing?: number;
}
export function drawTipsInList({
    text,
    content,
    textSize = 30,
    lineHeight = textSize * 1.5,
    spacing = textSize / 3
}: tipsOptions) {
    const xmax = 760
    var textImage: Canvas
    if (typeof text == "string") {
        textImage = drawText({ text, textSize, maxWidth: xmax, lineHeight });
    }
    else if (content != undefined) {
        textImage = drawTextWithImages({
            textSize,
            content,
            maxWidth: xmax,
            lineHeight,
            spacing
        });
    }
    else {
        textImage = new Canvas(1, 1)
    }
    const canvas = new Canvas(800, textImage.height + 10);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f1f1f1'
    ctx.fillRect(0, 10, 800, textImage.height);
    ctx.drawImage(textImage, 20, 10);
    return canvas;
}

//通过服务器列表获得内容，服务器icon开头，每一行为服务器对应内容，默认仅日服与简中服
export async function drawListByServerList(content: Array<string | null>, key?: string, serverList: Server[] = globalDefaultServer, maxWidth = 800) {
    var tempcontent: Array<string | Image | Canvas> = []
    //如果只有2个服务器，且内容相同
    if (serverList.length == 2) {
        if (content[serverList[0]] == content[serverList[1]]) {
            var canvas = drawList({
                key: key,
                text: content[serverList[0]],
                maxWidth
            })
            return canvas
        }
    }

    for (let i = 0; i < serverList.length; i++) {
        const tempServer = serverList[i];
        if (content[tempServer] == null) {
            continue
        }
        tempcontent.push(await getIcon(tempServer))
        tempcontent.push(content[tempServer])
        tempcontent.push('\n')

    }
    if (tempcontent.length == 0) {
        const tempServer = getServerByPriority(content, serverList)
        tempcontent.push(await getIcon(tempServer))
        tempcontent.push(content[tempServer])
        tempcontent.push('\n')
    }
    tempcontent.pop()
    var canvas = drawList({
        key: key,
        content: tempcontent,
        maxWidth
    })
    return canvas
}

//横向组合较短list，高度为最高的list，宽度平分
export function drawListMerge(imageList: Array<Canvas | Image>): Canvas {
    var maxHeight = 0
    for (let i = 0; i < imageList.length; i++) {
        const element = imageList[i];
        if (element.height > maxHeight) {
            maxHeight = element.height
        }
    }
    var canvas = new Canvas(800, maxHeight)
    var ctx = canvas.getContext('2d')
    var x = 0
    for (let i = 0; i < imageList.length; i++) {
        const element = imageList[i];
        ctx.drawImage(element, x, 0)
        x += 800 / imageList.length
    }
    return canvas
}

//横向组合image/canvas array，居中，超过宽度则换行
export function drawImageListCenter(imageList: Array<Canvas | Image>, maxWidth = 800): Canvas {
    interface imageLine {
        imageList: Array<Canvas | Image>,
        width: number,
        height: number
    }
    var lineList: Array<imageLine> = []
    let tempWidth = 0
    let tempHeight = 0
    let tempImageList: Array<Canvas | Image> = []
    //换行函数
    function newLine() {
        lineList.push({
            imageList: tempImageList,
            width: tempWidth,
            height: tempHeight
        })
        tempWidth = 0
        tempHeight = 0
        tempImageList = []
    }
    if (imageList.length == 0) {
        return new Canvas(1, 10)
    }
    //遍历imageList，计算每一行的宽度，高度，imageList
    for (let i = 0; i < imageList.length; i++) {
        const element = imageList[i];
        if (element.width > maxWidth) {
            newLine()
            tempImageList.push(element)
            continue
        }
        if (tempWidth + element.width > maxWidth) {
            newLine()
        }
        tempWidth += element.width
        if (element.height > tempHeight) {
            tempHeight = element.height
        }
        tempImageList.push(element)
    }
    if (tempImageList.length > 0) {//最后一行
        newLine()
    }
    //计算总高度，生成canvas
    var Height = 0
    for (let i = 0; i < lineList.length; i++) {
        const element = lineList[i];
        Height += element.height
    }
    var canvas = new Canvas(maxWidth, Height)
    var ctx = canvas.getContext('2d')
    //画每一行
    const middleWidth = maxWidth / 2
    var y = 0
    for (let i = 0; i < lineList.length; i++) {
        const element = lineList[i];
        var x = middleWidth - element.width / 2
        for (let j = 0; j < element.imageList.length; j++) {
            const image = element.imageList[j];
            ctx.drawImage(image, x, y)
            x += image.width
        }
        y += element.height
    }
    return canvas
}

//画左侧有竖线的排版，用于画block时展示数据
export function drawListWithLine(textImageList: Array<Canvas | Image>): Canvas {
    var x = 10
    var y = 10
    var height = 0
    for (let i = 0; i < textImageList.length; i++) {
        const element = textImageList[i];
        height += element.height
    }
    var canvas = new Canvas(800, height + 10)
    var ctx = canvas.getContext('2d')
    ctx.fillStyle = '#a8a8a8'
    ctx.fillRect(10, 10, 5, height + 20)
    for (let i = 0; i < textImageList.length; i++) {
        const element = textImageList[i];
        ctx.drawImage(element, x, y)
        y += element.height
    }
    return canvas
}

