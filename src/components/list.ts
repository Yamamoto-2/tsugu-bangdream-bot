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
    text: string;
    text2?: string;
    textSize?: number;
    lineHeight?: number;
}

//画表格中的一行
function drawList({
    key,
    text,
    text2,
    textSize = 40,
    lineHeight = textSize * 1.5
}: ListOptions): Canvas {
    const xmax = 800
    const keyImage = drawRoundedRectWithText({
        text: key,
        textSize: 30,
    });
    const textImage = drawText({ text, maxWidth: xmax, lineHeight });
    var ymax = textImage.height + keyImage.height;
    if (text2) {
        const textImage2 = drawText({ text: text2, maxWidth: xmax - 10, lineHeight: lineHeight * 3 / 4, textSize: textSize * 3 / 4 });
        ymax += textImage2.height;
        const canvas = createCanvas(1000, ymax);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(keyImage, 100, 0);
        ctx.drawImage(textImage, 100, keyImage.height);
        ctx.fillStyle = '#f1f1f1'
        ctx.fillRect(100, keyImage.height + textImage.height, xmax, textImage2.height);
        ctx.drawImage(textImage2, 105, keyImage.height + textImage.height);
        return canvas;
    }
    else {
        const canvas = createCanvas(1000, ymax - ((lineHeight - textSize) / 2));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(keyImage, 100, 0);
        ctx.drawImage(textImage, 100, keyImage.height);
        return canvas;
    }

}

interface ListWithImagesOptions {
    key: string;
    content: Array<string | Canvas | Image>;
    text2?: string;
    textSize?: number;
    lineHeight?: number;
    spacing?: number;
}

function drawListWithImages(
    {
        key,
        content,
        text2,
        textSize = 40,
        lineHeight = textSize * 1.5,
        spacing = textSize / 3

    }: ListWithImagesOptions) {
    const xmax = 800
    const keyImage = drawRoundedRectWithText({
        text: key,
        textSize: 30
    });
    const textImage = drawTextWithImages({
        content,
        maxWidth: xmax,
        lineHeight,
        textSize,
        spacing
    });
    var ymax = textImage.height + keyImage.height;
    if (text2) {
        const textImage2 = drawText({ text: text2, maxWidth: xmax - 40, lineHeight: lineHeight * 3 / 4, textSize: textSize * 3 / 4 });
        ymax += textImage2.height;
        const canvas = createCanvas(1000, ymax);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(keyImage, 100, 0);
        ctx.drawImage(textImage, 100, keyImage.height);
        ctx.fillStyle = '#f1f1f1'
        ctx.fillRect(100, keyImage.height + textImage.height, xmax, textImage2.height);
        ctx.drawImage(textImage2, 120, keyImage.height + textImage.height);
        return canvas;
    }
    else {
        const canvas = createCanvas(1000, ymax - ((lineHeight - textSize) / 2));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(keyImage, 100, 0);
        ctx.drawImage(textImage, 100, keyImage.height);
        return canvas;
    }
}

var defaultserverList: Array<Server> = []
defaultserverList.push(new Server('jp'))
defaultserverList.push(new Server('cn'))

//通过服务器列表获得内容，服务器icon开头，每一行为服务器对应内容
async function drawListByServerList(key: string, content: Array<string|null>, serverList: Array<Server> = defaultserverList) {
    var tempcontent: Array<string | Image | Canvas> = []
    //如果只有2个服务器，且内容相同
    if(serverList.length == 2){
        if(serverList[0].getContentByServer(content) == serverList[1].getContentByServer(content)){
            var canvas = drawList({
                key: key,
                text: serverList[0].getContentByServer(content)
            })
            return canvas
        }
    }

    for (let i = 0; i < serverList.length; i++) {
        const tempServer = serverList[i];
        tempcontent.push(await tempServer.getIcon())
        tempcontent.push(tempServer.getContentByServer(content) + '\n')
    }
    var canvas = drawListWithImages({
        key: key,
        content: tempcontent
    })
    return canvas
}


//组合表格子程序，使用block当做底，通过最大高度换行，默认高度无上限
var drawDatablock = async function (list: Array<Image | Canvas>, BG = true): Promise<Canvas> {
    var allH = 100
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
    var allH2 = 50
    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], 0, allH2)
        allH2 = allH2 + list[i].height
    }

    return (tempcanv)
}



export { drawList, drawDatablock, drawListWithImages, line, drawListByServerList };
