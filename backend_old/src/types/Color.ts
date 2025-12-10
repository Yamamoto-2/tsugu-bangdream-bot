import { Canvas } from 'skia-canvas'

export class Color {
    r: number
    g: number
    b: number
    constructor(r: number, g: number, b: number) {
        this.r = r
        this.g = g
        this.b = b
    }
    getRGBA(alpha = 1): string {
        return `rgba(${this.r},${this.g},${this.b}, ${alpha})`
    }

    setRGB(r: number, g: number, b: number) {
        this.r = r
        this.g = g
        this.b = b
    }

    generateColorBlock(alpha = 1): Canvas {
        const colorCanvas = new Canvas(50, 50)
        const colorCtx = colorCanvas.getContext('2d')
        colorCtx.fillStyle = this.getRGBA(alpha)
        colorCtx.fillRect(0, 0, 50, 50)
        return colorCanvas
    }
}

//getcolorfrom #xxxxxx
export function getColorFromHex(hex: string): Color {
    const color = new Color(
        parseInt(hex.substring(1, 3), 16),
        parseInt(hex.substring(3, 5), 16),
        parseInt(hex.substring(5, 7), 16)
    )
    return color
}

//用于图表的随机颜色
const presetColorList = [
    { r: 254, g: 65, b: 111 },  // 玫瑰红
    { r: 179, g: 49, b: 255 },  // 紫色
    { r: 64, g: 87, b: 227 },   // 宝石蓝
    { r: 68, g: 197, b: 39 },   // 草绿色
    { r: 255, g: 255, b: 81 },  // 柠檬黄
    { r: 0, g: 132, b: 255 },   // 天蓝色
    { r: 240, g: 128, b: 128 }, // 浅珊瑚色
    { r: 60, g: 179, b: 113 },  // 春绿色
    { r: 255, g: 165, b: 0 },   // 橙色
    { r: 106, g: 90, b: 205 }   // 石蓝色
];

function randomRGB(): { r: number, g: number, b: number } {
    function generateNumber255() {
        return Math.floor(Math.random() * 255);
    };
    return {
        r: generateNumber255(),
        g: generateNumber255(),
        b: generateNumber255(),
    };
}

export function getPresetColor(index?: number): Color {
    let tempColor: { r: number, g: number, b: number }
    if (index == undefined) {
        tempColor = randomRGB();
    }
    else if (index < presetColorList.length) {
        tempColor = presetColorList[index];
    } else {
        // 当索引超过预定义颜色列表长度时，生成随机颜色
        tempColor = randomRGB();
    }
    return new Color(tempColor.r, tempColor.g, tempColor.b);
}

