import { createCanvas, registerFont, Image, Canvas, CanvasRenderingContext2D } from 'canvas';
import { assetsRootPath } from '../config';
registerFont(assetsRootPath + "/Fonts/default.ttf", { family: "default" })
registerFont(assetsRootPath + "/Fonts/old.ttf", { family: "old" })

interface warpTextOptions {
    text: string,
    textSize?: number,
    maxWidth: number,
    lineHeight?: number
}

//画文字,自动换行
function drawText({
    text,
    textSize = 40,
    maxWidth,
    lineHeight = textSize * 4 / 3
}: warpTextOptions): Canvas {
    var wrappedTextData = wrapText({ text, maxWidth, lineHeight, textSize });
    const canvas = createCanvas(maxWidth, lineHeight * wrappedTextData.numberOfLines);
    const ctx = canvas.getContext('2d');
    let y = lineHeight / 2 + textSize / 3
    ctx.textBaseline = 'alphabetic'
    setFontStyle(ctx, textSize, "default");
    ctx.fillStyle = '#5b5b5b';
    var wrappedText = wrappedTextData.wrappedText
    for (var i = 0; i < wrappedText.length; i++) {
        ctx.fillText(wrappedText[i], 0, y);
        y += lineHeight;
    }
    return canvas;
}

function wrapText({
    text,
    textSize,
    maxWidth,
    lineHeight
}: warpTextOptions) {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    const temp = text.split('\n');
    ctx.textBaseline = 'alphabetic';
    setFontStyle(ctx, textSize, "default");

    for (var i = 0; i < temp.length; i++) {
        let temptext = temp[i]
        let a = 0
        for (var n = 0; n < temptext.length; n++) {
            if (maxWidth > ctx.measureText(temptext.slice(0, temptext.length - n)).width) {
                a = n
                break
            }

        }
        if (a != 0) {
            temp.splice(i + 1, 0, temp[i].slice(temp[i].length - a, temp[i].length))
            temp[i] = temp[i].slice(0, temp[i].length - a)
        }
    }

    for (var i = 0; i < temp.length; i++) {
        if (temp[i] == "") {
            temp.splice(i, 1);
            //去除空值
            i--;
        }
    }
    return {
        numberOfLines: temp.length,
        wrappedText: temp,
    };
}

interface TextWithImagesOptions {
    textSize?: number;
    maxWidth: number;
    lineHeight?: number;
    content: (string | Canvas | Image)[];
    spacing?: number;
    color?: string;
    font?: "default" | "old"
}



// 画文字包含图片
function drawTextWithImages({
    textSize = 40,
    maxWidth,
    lineHeight = textSize * 4 / 3,
    content,
    spacing = textSize / 3,
    color = '#5b5b5b',
    font = 'default'
}: TextWithImagesOptions) {
    var wrappedTextData = warpTextWithImages({ textSize, maxWidth, lineHeight, content });
    var wrappedText = wrappedTextData.wrappedText
    var canvas:Canvas
    //单行文字，宽度为第一行的宽度
    if(wrappedTextData.numberOfLines == 1){
        canvas = createCanvas(1, 1);
        const ctx = canvas.getContext('2d');
        setFontStyle(ctx, textSize, font);
        var Width = 0
        for (var n = 0; n < wrappedText[0].length; n++) {
            if (typeof wrappedText[0][n] === "string") {
                Width += ctx.measureText(wrappedText[0][n] as string).width
            } else {
                //等比例缩放图片，至高度与textSize相同
                let tempImage = wrappedText[0][n] as Canvas | Image
                let tempWidth = textSize * tempImage.width / tempImage.height//等比例缩放到高度与字体大小相同后，图片宽度
                Width += tempWidth
            }
            Width += spacing
        }
        canvas = createCanvas(Width, lineHeight);
    }
    //多行文字
    else{
        canvas = createCanvas(maxWidth, lineHeight * wrappedTextData.numberOfLines);

    }
    const ctx = canvas.getContext('2d');
    let y = lineHeight / 2 + textSize / 3
    ctx.textBaseline = 'alphabetic'
    setFontStyle(ctx, textSize, font);
    ctx.fillStyle = color;
    for (var i = 0; i < wrappedText.length; i++) {
        let tempX = 0
        for (var n = 0; n < wrappedText[i].length; n++) {
            if (typeof wrappedText[i][n] === "string") {
                ctx.fillText(wrappedText[i][n] as string, tempX, y);
                tempX += ctx.measureText(wrappedText[i][n] as string).width
            } else {
                //等比例缩放图片，至高度与textSize相同
                let tempImage = wrappedText[i][n] as Canvas | Image
                let tempWidth = textSize * tempImage.width / tempImage.height//等比例缩放到高度与字体大小相同后，图片宽度
                ctx.drawImage(tempImage, tempX, y -(textSize / 3) - (textSize / 2) , tempWidth, textSize)
                tempX += tempWidth
            }
            tempX += spacing
        }
        y += lineHeight;
    }
    return canvas;
}

// 画文字包含图片 的计算换行
function warpTextWithImages({
    textSize = 40,
    maxWidth,
    lineHeight = textSize * 4 / 3,
    content,
    spacing = textSize / 3
}: TextWithImagesOptions) {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    setFontStyle(ctx, textSize, "default");
    const temp: Array<Array<string | Image | Canvas>> = [[]]//二维数组,每个元素为一行,例如: [[string,Image],[Image,string]]
    var linenumber = 0
    var tempX = 0
    function newLine() {//新起一行
        linenumber++//行数加一
        tempX = 0//tempX归零
        temp.push([])//temp增加一行(一个Array)
    }
    for (var i = 0; i < content.length; i++) {
        if (typeof content[i] === "string") {
            let temptext = content[i] as string
            if (tempX + ctx.measureText(temptext).width > maxWidth) {
                //如果string的宽度超过maxWidth,则分割string,并且分割后的string的宽度也超过maxWidth,则分割string
                for (var n = 0; n < temptext.length; n++) {
                    if ((maxWidth - tempX) > ctx.measureText(temptext.slice(0, temptext.length - n)).width) {
                        temp[linenumber].push(temptext.slice(0, temptext.length - n))
                        newLine()
                        temptext = temptext.slice(temptext.length - n , temptext.length)
                        n = -1
                    }
                }
                //去除多的一行
                tempX = ctx.measureText( temp[linenumber-1][0] as string ).width
                temp.pop()
                linenumber--
            } else {
                temp[linenumber].push(temptext)
                tempX += ctx.measureText(temptext).width
            }
        } else if (content[i] instanceof Canvas || content[i] instanceof Image) {
            //图片等比例放大至高度与字体大小相同
            let tempImage = content[i] as Image
            let tempWidth = tempImage.width * (textSize / tempImage.height)
            if (tempX + tempWidth > maxWidth) {
                newLine()
            }
            temp[linenumber].push(tempImage)
            tempX += tempWidth
        }
        tempX += spacing
        if (tempX > maxWidth) {
            newLine()
        }
    }
    return {
        numberOfLines: temp.length,
        wrappedText: temp,
    };
}



var setFontStyle = function (ctx: CanvasRenderingContext2D, textSize: number, font: string) {//设置字体大小
    ctx.font = textSize + 'px ' + font + ",Microsoft Yahei"
}

export { drawText, wrapText, drawTextWithImages, setFontStyle }