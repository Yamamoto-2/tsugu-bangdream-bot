import { Canvas, Image, createCanvas } from 'canvas';
import { drawRoundedRectWithText, drawRoundedRect } from '../image/drawRect';
import { drawText, drawTextWithImages } from './text';
import { drawDottedLine } from '../image/dottedLine'
import { Server } from '../types/Server'

//表格用默认虚线
var line: Canvas = drawDottedLine({
    width: 1000,
    height: 30,
    startX: 100,
    startY: 15,
    endX: 900,
    endY: 15,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

interface ListOptions {
    key: string;
    text?: string;
    content?: Array<string | Canvas | Image>
    textSize?: number;
    lineHeight?: number;
    spacing?: number;

}

//画表格中的一行
function drawList({
    key,
    text,
    content,
    textSize = 40,
    lineHeight = textSize * 1.5,
    spacing = textSize / 3

}: ListOptions): Canvas {
    const xmax = 760
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
            spacing
        });
    }
    else {
        textImage = createCanvas(1, 1)
    }
    var ymax = textImage.height + keyImage.height + 10;
    const canvas = createCanvas(1000, ymax);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(keyImage, 100, 0);
    ctx.drawImage(textImage, 120, keyImage.height + 10);
    return canvas;
}

interface tipsOptions {
    text?: string;
    content?: Array<string | Canvas | Image>
    textSize?: number;
    lineHeight?: number;
    spacing?: number;
}
function drawTips({
    text,
    content,
    textSize = 30,
    lineHeight = textSize * 1.5,
    spacing = textSize / 3
}: tipsOptions) {
    const xmax = 790
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
        textImage = createCanvas(1, 1)
    }
    const canvas = createCanvas(1000, textImage.height + 10);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f1f1f1'
    ctx.fillRect(100, 10, 800, textImage.height);
    ctx.drawImage(textImage, 105, 10);
    return canvas;
}

var defaultserverList: Array<Server> = []
defaultserverList.push(new Server('jp'))
defaultserverList.push(new Server('cn'))
interface ListByServerListOptions {
    key: string;
    content: Array<string | null>
    serverList?: Array<Server>
}

//通过服务器列表获得内容，服务器icon开头，每一行为服务器对应内容，默认仅日服与简中服
async function drawListByServerList({
    key,
    content,
    serverList = defaultserverList
}) {
    var tempcontent: Array<string | Image | Canvas> = []
    //如果只有2个服务器，且内容相同
    if (serverList.length == 2) {
        if (serverList[0].getContentByServer(content) == serverList[1].getContentByServer(content)) {
            var canvas = drawList({
                key: key,
                text: serverList[0].getContentByServer(content)
            })
            return canvas
        }
    }

    function removeElement<T>(arr: T[], n: number): T | undefined {
        if (n >= 0 && n < arr.length) {
            return arr.splice(n, 1)[0];
        }
        return undefined;
    }

    // 移除是content内容是null的服务器
    for (let i = serverList.length - 1; i >= 0; i--) {
        const tempServer = serverList[i];
        if (tempServer.getContentByServer(content) === null) {
            // 移除
            removeElement(serverList, i);
        }
    }

    for (let i = 0; i < serverList.length; i++) {
        const tempServer = serverList[i];
        tempcontent.push(await tempServer.getIcon())
        if (i == serverList.length - 1) {
            tempcontent.push(tempServer.getContentByServer(content))
        }
        else {
            tempcontent.push(tempServer.getContentByServer(content) + '\n')
        }
    }
    var canvas = drawList({
        key: key,
        content: tempcontent
    })
    return canvas
}


//组合表格子程序，使用block当做底，通过最大高度换行，默认高度无上限
var drawDatablock = async function (list: Array<Image | Canvas>, BG = true): Promise<Canvas> {
    if (BG) {
        var allH = 100
    }
    else {
        var allH = 0
    }

    for (var i = 0; i < list.length; i++) {
        allH = allH + list[i].height
    }
    var tempcanv = createCanvas(1000, allH)
    var ctx = tempcanv.getContext("2d")
    if (BG) {
        ctx.drawImage(drawRoundedRect({
            width: 900,
            height: allH
        }), 50, 0)
    }
    if (BG) {
        var allH2 = 50
    }
    else {
        var allH2 = 0
    }
    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], 0, allH2)
        allH2 = allH2 + list[i].height
    }

    return (tempcanv)
}



export { drawList, drawDatablock, line, drawListByServerList, drawTips };
