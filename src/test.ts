import { Context, Schema, h, Session } from 'koishi'
import { CreateBG } from './image/BG';
import { assetsRootPath } from './config';
import path from 'path';
import { loadImage, createCanvas, Canvas, Image } from 'canvas';
import { drawList, drawDatablock, drawListWithImages, line } from './components/list';
import { callAPIAndCacheResponse } from './api/getApi';
import { downloadFile } from './api/downloadFile';
import { drawTextWithImages } from './components/text'
import { BestdoriapiPath, Bestdoriurl } from './config';
import { outputFinalBuffer } from './image/output'
import { Skill } from './types/Skill'
import { Card } from './types/Card'
import { Server } from './types/Server'
import { Character } from './types/Character'
import { Band } from './types/Band'
import { Event } from './types/Event'
import { Degree } from './types/Drgree';
import { Gacha } from './types/Gacha';
import { Song } from './types/Song';
import {drawCardIcon,drawCardIllustration} from './components/card'

async function test(session: Session) {
    /*
    //list测试部分
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
    */

    /*
    //技能测试部分
    session.send('测试开始')
    var skills = await callAPIAndCacheResponse(Bestdoriurl + BestdoriapiPath['skills'])
    for (var i in skills) {
        console.log(" ")
        console.log(parseInt(i))
        var tempskill = new Skill(parseInt(i))
        await tempskill.init()
        console.log(tempskill.getSkillDescription()[0])
        console.log(tempskill.effectType)
        console.log(tempskill.scoreUpMaxValue)
    }
    */
    /*
    卡牌测试部分
    var card = new Card(1692)
    console.log(card.isExist)
    console.log(await card.calcStat())
    var skill = card.getSkill()
    console.log(skill.simpleDescription)
    console.log(card.isReleased(new Region('jp')))
    */
    /*
    //角色测试部分
    var chara = new Character(10)
    await chara.initFull()
    console.log(chara)
    */
    /*
    //乐队,活动测试部分
    var band = new Band(1)
    console.log(band)
    var event = new Event(207)
    await event.initFull()
    console.log(event)
    */

    /*
    //牌子测试部分
    var degree = new Degree(1)
    console.log(degree)
    */
    /*
        //歌曲测试部分
        var gacha = new Gacha(820)
        await gacha.initFull()
        console.log(gacha)
    */
    /*
        //歌曲测试部分
        var song = new Song(494)
        await song.initFull()
        console.log(song)
    */

    /*
    var list = []

    var buffer1 = await downloadFile('https://bestdori.com/res/icon/jp.svg')
    var buffer2 = await downloadFile('https://bestdori.com/res/icon/cool.svg')
    var image1 = await loadImage(buffer1)
    var image2 = await loadImage(buffer2)
    var textarray = []

    textarray.push("测试用1测试用1测试用1")
    textarray.push(image1)
    textarray.push("测试用1测试用2测试用3 测试用1测试用2测试用3 测试用1测试用2测试用3 测试用1测试用2测试用3 测试用1测试用2测试用")
    textarray.push(image2)
    textarray.push("测试用1测试用1测试用1")
    textarray.push(image2)
    textarray.push("测试用1测试用2测试用3 测试用1测试用2测试用3 测试用1测试用2测试用3 测试用1测试用2测试用3 测试用1测试用2测试用")
    var temp2 = drawListWithImages("test",textarray,"test")
    list.push(temp2)
    list.push(line)
    var temp = drawListWithImages("test",textarray)
    list.push(temp)
    var textarray2 = []
    textarray2.push(image1)
    textarray2.push(image1)
    textarray2.push(image1)
    textarray2.push(image1)
    textarray2.push(image1)
    textarray2.push(image1)
    var temp3 = drawListWithImages("test",textarray2,undefined,150,200)
    list.push(line)
    list.push(temp3)

  


    var listImage = await drawDatablock(list)
    var imageList = []
    imageList.push(listImage)
    var buffer = await outputFinalBuffer(imageList, "Test")
    session.send(h.image(buffer, 'image/png'));
    
    */
    var list = []
        /*
    var card = new Card(1330)

    var tempImage = await drawCardIcon({
        card: card,
        trainningStatus:true
    })
    list.push(tempImage)
    var tempImage2 = await drawCardIcon({
        card: card,
        trainningStatus:false,
        skillLevel:5,
        cardIdVisible:true,
        limitBreakRank:4,
        skillTypeVisible:true
    })

    list.push(tempImage2)
    var card = new Card(1692)
    var tempImage3 = await drawCardIcon({
        card: card,
        trainningStatus:false,
        skillLevel:5,
        cardIdVisible:true,
        //limitBreakRank:4,
        skillTypeVisible:true
    })
        list.push(tempImage3)
    */
    var card = new Card(1399)
    var tempImage = await drawCardIllustration({
        card: card,
       trainningStatus:true
    })
    list.push(tempImage)

    var listImage = await drawDatablock(list)
    var imageList = []
    imageList.push(listImage)
    var buffer = await outputFinalBuffer(imageList, "Test")
    session.send(h.image(buffer, 'image/png'));
    console.log("测试完成")
}

export { test }