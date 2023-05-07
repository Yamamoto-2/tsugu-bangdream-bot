import { CreateBG } from './image/BG';
import { assetsRootPath } from './config';
import path from 'path';
import { loadImage, createCanvas, Canvas, Image } from 'canvas';
import { drawList, drawDatablock, line } from './components/list';
import { callAPIAndCacheResponse } from './api/getApi';
import { downloadFileAndCache } from './api/getFile';
import { BestdoriapiPath, Bestdoriurl } from './config';
import {outputFinalBuffer} from './image/output'


async function test() {
    var list = []
    var temp = drawList("测试用1测试用1测试用1", '这是第一行\n这是第二行\n第三行1第三行2第三行3第三行4第三行5第三行6第三行7第三行8', '第三行第三行第三行第三行第三行第三行第三行第三行第三行第三行\n第三行第三行第三行第三行')
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
    //downloadFileAndCache('https://bestdori.com/assets/jp/characters/resourceset/res021069_rip/card_after_training.png')
    var imageList = []
    imageList.push(listImage)
    imageList.push(listImage)
    var buffer = outputFinalBuffer(imageList, "Test")
    return buffer
}

export { test }