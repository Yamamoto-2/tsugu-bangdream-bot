import { FontLibrary, Image, Canvas, CanvasRenderingContext2D } from 'skia-canvas';
import { assetsRootPath } from '@/config';
FontLibrary.use("old", [`${assetsRootPath}/Fonts/old.ttf`])
FontLibrary.use("FangZhengHeiTi", [`${assetsRootPath}/Fonts/FangZhengHeiTi_GBK.ttf`])


interface warpTextOptions {
    text: string,
    textSize?: number,
    maxWidth: number,
    lineHeight?: number
    color?: string,
    font?: "FangZhengHeiTi" | "old" | "default"
}

//画文字,自动换行
export function drawText({
    text,
    textSize = 40,
    maxWidth,
    lineHeight = textSize * 4 / 3,
    color = "#505050",
    font = "old"
}: warpTextOptions): Canvas {
    var wrappedTextData = wrapText({ text, maxWidth, lineHeight, textSize });
    if (wrappedTextData.numberOfLines == 0) {
        var canvas: Canvas = new Canvas(1, lineHeight);
    }
    else if (wrappedTextData.numberOfLines == 1) {
        var canvas: Canvas = new Canvas(1, 1);
        var ctx = canvas.getContext('2d');
        setFontStyle(ctx, textSize, font);
        var width = maxWidth = ctx.measureText(wrappedTextData.wrappedText[0]).width
        canvas = new Canvas(width, lineHeight);
    }
    else {
        var canvas: Canvas = new Canvas(maxWidth, lineHeight * wrappedTextData.numberOfLines);
    }
    var ctx = canvas.getContext('2d');
    let y = lineHeight / 2 + textSize / 3
    ctx.textBaseline = 'alphabetic'
    setFontStyle(ctx, textSize, font);
    ctx.fillStyle = color;
    var wrappedText = wrappedTextData.wrappedText
    for (var i = 0; i < wrappedText.length; i++) {
        ctx.fillText(wrappedText[i], 0, y);
        y += lineHeight;
    }
    return canvas;
}

export function wrapText({
    text,
    textSize,
    maxWidth,
    lineHeight,
    font = "old"
}: warpTextOptions) {
    const canvas = new Canvas(1, 1);
    const ctx = canvas.getContext('2d');
    const temp = text.split('\n');
    ctx.textBaseline = 'alphabetic';
    setFontStyle(ctx, textSize, font);

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
export function drawTextWithImages({
    textSize = 40,
    maxWidth,
    lineHeight = textSize * 4 / 3,
    content,
    spacing = textSize / 3,
    color = '#505050',
    font = 'old'
}: TextWithImagesOptions) {
    var wrappedTextData = warpTextWithImages({ textSize, maxWidth, lineHeight, content, spacing });
    var wrappedText = wrappedTextData.wrappedText
    var canvas: Canvas
    if (wrappedTextData.numberOfLines == 0) {
        var canvas: Canvas = new Canvas(1, lineHeight);
    }
    //单行文字，宽度为第一行的宽度
    else if (wrappedTextData.numberOfLines == 1) {
        canvas = new Canvas(1, 1);
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
        canvas = new Canvas(Width - spacing, lineHeight);
    }
    //多行文字
    else {
        canvas = new Canvas(maxWidth, lineHeight * wrappedTextData.numberOfLines);

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
                ctx.drawImage(tempImage, tempX, y - (textSize / 3) - (textSize / 2), tempWidth, textSize)
                tempX += tempWidth
            }
            if (tempX != 0) {
                tempX += spacing
            }
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
    spacing = textSize / 3,
    font = 'old'
}: TextWithImagesOptions) {
    const canvas = new Canvas(1, 1);
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    setFontStyle(ctx, textSize, font);
    const temp: Array<Array<string | Image | Canvas>> = [[]];
    let lineNumber = 0;
    let tempX = 0;

    function newLine() {
        lineNumber++;
        tempX = 0;
        temp.push([]);
    }

    for (let i = 0; i < content.length; i++) {
        if (content[i] == undefined || content[i] == null) {
            content[i] = "?"
        }
        if (typeof content[i] === "string") {
            let temptext = content[i] as string;
            while (temptext.length > 0) {
                const lineBreakIndex = temptext.indexOf("\n");
                if (lineBreakIndex !== -1) {
                    const substring = temptext.slice(0, lineBreakIndex);
                    temp[lineNumber].push(substring);
                    newLine();
                    temptext = temptext.slice(lineBreakIndex + 1);
                    continue;
                }

                const remainingWidth = maxWidth - tempX;
                const measuredWidth = ctx.measureText(temptext).width;
                if (remainingWidth >= measuredWidth) {
                    temp[lineNumber].push(temptext);
                    tempX += measuredWidth;
                    break;
                } else {
                    let splitIndex = 0;
                    for (let j = temptext.length - 1; j >= 0; j--) {
                        const substr = temptext.slice(0, j);
                        const substrWidth = ctx.measureText(substr).width;
                        if (substrWidth <= remainingWidth) {
                            splitIndex = j;
                            break;
                        }
                    }
                    const substring = temptext.slice(0, splitIndex);
                    temp[lineNumber].push(substring);
                    newLine();
                    temptext = temptext.slice(splitIndex);
                }
            }
        } else if (content[i] instanceof Canvas || content[i] instanceof Image) {
            let tempImage = content[i] as Image;
            let tempWidth = tempImage.width * (textSize / tempImage.height);
            if (tempX + tempWidth > maxWidth) {
                newLine();
            }
            temp[lineNumber].push(tempImage);
            tempX += tempWidth;
        }
        tempX += spacing;
    }

    if (temp[temp.length - 1].length === 0) {
        temp.pop();
    }

    return {
        numberOfLines: temp.length,
        wrappedText: temp,
    };
}

export var setFontStyle = function (ctx: CanvasRenderingContext2D, textSize: number, font: string) {//设置字体大小
    ctx.font = textSize + 'px ' + font + ",Microsoft Yahei"
}
