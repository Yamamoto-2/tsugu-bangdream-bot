import {CreateBG} from './utils/image/BG';
import { canvasToBuffer } from './utils/image';
import { assetsRootPath } from './config';
import path from 'path';
import { loadImage, createCanvas, Image,Canvas } from 'canvas';
import {drawRoundedRect} from './utils/image/drawRect';


var imagepath = path.join(assetsRootPath, "/BG/default.png");

async function test() {
    var tempimage = await loadImage(imagepath);
    var BG = await CreateBG({ image: tempimage, text: "BanGDream!",width: 1000, height: 2000 });
    //const rect = drawRoundedRect(900, 1800,25,1,"#bbbbbb",2);
    const rect = drawRoundedRect({
        width:900,
        height:1800,
        radius:25,
        opacity:1,
        strokeColor:"#bbbbbb",
        strokeWidth:2
    });
    const canvas = createCanvas(1000, 2000)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(BG, 0, 0)
   // ctx.drawImage(rect, 50, 100)
    
    
    const buffer = canvasToBuffer(canvas);


    return buffer;
}

export { test }