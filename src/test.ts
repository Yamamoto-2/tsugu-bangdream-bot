import { CreateBG } from './image/BG';
import { assetsRootPath } from './config';
import path from 'path';
import { loadImage, createCanvas, Canvas, Image } from 'canvas';
import { drawList, drawDatablock, line } from './components/list';
import { callAPIAndCacheResponse } from './api/getApi';
import { downloadFileAndCache } from './api/getFile';
import { BestdoriapiPath, Bestdoriurl } from './config';


var imagepath = path.join(assetsRootPath, "/BG/default.png");

async function test() {
    var tempimage = await loadImage(imagepath);
    var BG = await CreateBG({ image: tempimage, text: "BanGDream!", width: 1000, height: 2000 });
    const canvas = createCanvas(1000, 2000);
    const ctx = canvas.getContext('2d');
    var list = []
    var temp = drawList("测试用1", '这是第一行\n这是第二行\n第三行1第三行2第三行3第三行4第三行5第三行6第三行7第三行8', '第三行第三行第三行第三行第三行第三行第三行第三行第三行第三行\n第三行第三行第三行第三行')
    list.push(temp)
    list.push(line)
    var temp2 = drawList("测试用2", '这是第一行\n这是第二行\n第三行1第三行2第三行3第三行4第三行5第三行6第三行7第三行8', '第三行第三行第三行第三行第三行第三行第三行第三行第三行第三行\n第三行第三行第三行第三行')
    list.push(temp2)
    list.push(line)
    var temp4 = drawList("测试用4", "只有一行")
    list.push(temp4)
    list.push(line)
    var temp3 = drawList("测试用3", "这是第一行\n这是第二行\n第三行1第三行2第三行3第三行4第三行5第三行6第三行7第三行8")
    list.push(temp3)
    var listImage = await drawDatablock(list)
    ctx.drawImage(listImage, 0, 0)
    const buffer = canvas.toBuffer('image/png');

    downloadFileAndCache('https://bestdori.com/assets/jp/characters/resourceset/res021069_rip/card_after_training.png')
    return buffer;
}

export { test }