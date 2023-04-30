import { CreateBG } from './utils/image/BG';
import { assetsRootPath } from './config';
import path from 'path';
import { loadImage, createCanvas, Canvas, Image } from 'canvas';
import { drawList, drawDatablock,line } from './components/list';


var imagepath = path.join(assetsRootPath, "/BG/default.png");

async function test() {
    var tempimage = await loadImage(imagepath);
    var BG = await CreateBG({ image: tempimage, text: "BanGDream!", width: 1000, height: 2000 });
    const canvas = createCanvas(1000, 2000);
    const ctx = canvas.getContext('2d');
    var all = []
    var temp = drawList("测试用1", '这是第一行\n这是第二行\n第三行1第三行2第三行3第三行4第三行5第三行6第三行7第三行8', '第三行第三行第三行第三行第三行第三行第三行第三行第三行第三行\n第三行第三行第三行第三行')
    all.push(temp)
    all.push(line)
    var temp2 = drawList("测试用2", '这是第一行\n这是第二行\n第三行1第三行2第三行3第三行4第三行5第三行6第三行7第三行8', '第三行第三行第三行第三行第三行第三行第三行第三行第三行第三行\n第三行第三行第三行第三行')
    all.push(temp2)
    all.push(line)
    var temp4 = drawList("测试用4","只有一行")
    all.push(temp4)
    all.push(line)
    var temp3 = drawList("测试用3","这是第一行\n这是第二行\n第三行1第三行2第三行3第三行4第三行5第三行6第三行7第三行8")
    all.push(temp3)
    ctx.drawImage(await drawDatablock(all), 0, 0)
    const buffer = canvas.toBuffer('image/png');


    return buffer;
}

export { test }