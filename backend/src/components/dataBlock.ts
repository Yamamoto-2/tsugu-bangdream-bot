import { Canvas, Image } from 'skia-canvas';
import { drawRoundedRect } from '@/image/drawRect';
import { drawText } from '@/image/text';

interface datablockOptions {
    list: Array<Canvas | Image>
    BG?: boolean
    topLeftText?: string
    opacity?: number
}
//组合表格子程序，使用block当做底，通过最大高度换行，默认高度无上限
export function drawDatablock({
    list,
    BG = true,
    topLeftText,
    opacity = 0.9
}: datablockOptions): Canvas {
    const topLeftTextHeight = 70
    //计算高度
    var allH = 0
    var maxW = 0
    if (BG) {
        allH += 100
    }
    for (var i = 0; i < list.length; i++) {
        allH = allH + list[i].height
        if (list[i].width > maxW) {
            maxW = list[i].width
        }
    }

    //创建Canvas
    if (topLeftText != undefined && BG) {
        var tempcanv = new Canvas(maxW + 200, allH + topLeftTextHeight)
    }
    else {
        var tempcanv = new Canvas(maxW + 200, allH)
    }
    var ctx = tempcanv.getContext("2d")

    //画背景
    if (BG) {
        if (topLeftText != undefined) {
            //右上角文字
            ctx.drawImage(drawRoundedRect({//画字底，左下角右下角没有圆角
                opacity: 1,
                color: '#ea4e73',
                width: 380,
                height: topLeftTextHeight + 5,
                radius: [25, 25, 0, 0],
                strokeColor: '#ffffff',
                strokeWidth: 5
            }), 50, 0)

            var textImage = drawText({//画字
                color: '#ffffff',
                text: topLeftText,
                maxWidth: 370,
                lineHeight: topLeftTextHeight - 5
            })
            ctx.drawImage(textImage, 240 - (textImage.width / 2), 5)
            ctx.drawImage(drawRoundedRect({//画总底，左上角没有圆角
                opacity,
                width: maxW + 100,
                height: allH,
                radius: [0, 25, 25, 25]
            }), 50, topLeftTextHeight)
        }
        else {
            ctx.drawImage(drawRoundedRect({//画总底
                opacity,
                width: maxW + 100,
                height: allH
            }), 50, 0)
        }
    }
    var allH2 = 0
    if (BG) {
        allH2 += 50
        if (topLeftText != undefined) {
            allH2 += topLeftTextHeight
        }
    }

    if (BG) {
        var xStart = 100
    }
    else {
        var xStart = 0
    }

    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], xStart, allH2)
        allH2 = allH2 + list[i].height
    }

    return (tempcanv)
}

export function drawDatablockHorizontal({
    list,
    BG = true,
    topLeftText
}: datablockOptions): Canvas {
    const topLeftTextHeight = 70;

    // 计算宽度和高度
    var allW = 0;
    var maxH = 0;
    if (BG) {
        allW += 200;
    }
    for (var i = 0; i < list.length; i++) {
        allW += list[i].width;
        if (list[i].height > maxH) {
            maxH = list[i].height;
        }
    }

    // 创建 Canvas
    if (topLeftText !== undefined && BG) {
        var tempcanv = new Canvas(allW + topLeftTextHeight, maxH + 100);
    } else {
        var tempcanv = new Canvas(allW, maxH + 100);
    }
    var ctx = tempcanv.getContext("2d");

    // 绘制背景
    if (BG) {
        if (topLeftText !== undefined) {
            // 右上角文字
            ctx.drawImage(drawRoundedRect({
                opacity: 1,
                color: '#ea4e73',
                width: topLeftTextHeight + 5,
                height: 380,
                radius: [25, 25, 0, 0],
                strokeColor: '#ffffff',
                strokeWidth: 5
            }), 0, 50);

            var textImage = drawText({
                color: '#ffffff',
                text: topLeftText,
                maxWidth: topLeftTextHeight - 5,
                lineHeight: 370
            });
            ctx.save();
            ctx.translate(topLeftTextHeight - 5, 240);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(textImage, 0, 0);
            ctx.restore();

            ctx.drawImage(drawRoundedRect({
                width: allW - 100,
                height: maxH + 100,
                radius: [25, 0, 25, 25]
            }), topLeftTextHeight, 50);
        } else {
            ctx.drawImage(drawRoundedRect({
                width: allW - 100,
                height: maxH + 100
            }), 50, 0);
        }
    }

    var allW2 = 0;
    if (BG) {
        allW2 += 100;
        if (topLeftText !== undefined) {
            allW2 += topLeftTextHeight;
        }
    }
    for (var i = 0; i < list.length; i++) {
        ctx.drawImage(list[i], allW2, 50);
        allW2 += list[i].width;
    }

    return tempcanv;
}

