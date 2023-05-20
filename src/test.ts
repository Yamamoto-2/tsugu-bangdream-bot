import { Context, Schema, h, Session } from 'koishi'
import { drawList, drawDatablock, line, drawTips } from './components/list';
import { outputFinalBuffer } from './image/output'
import { Card } from './types/Card'
import { drawTitle } from './components/title';
import { drawTimeInList } from './components/list/time'

async function test(session: Session) {

    var list = []
    var card = new Card(1599)
    /*
    var tempImage = await drawCardIllustration({
        card: card,
       trainningStatus:true
    })
    list.push(tempImage)
    */
    var timelist = await drawTimeInList('test', card.releasedAt)
    var tips = drawTips({ text: "测试用的tips\n测试用的tips测试用的tips测试用的tips" })
    list.push(timelist)
    list.push(tips)
    var listImage = await drawDatablock(list)
    var imageList = []
    imageList.push(drawTitle("测试用啊哈哈ahaha123", "测试用欸嘿嘿eiheihei123"))
    imageList.push(listImage)


    var buffer = await outputFinalBuffer(imageList, "Test")

    session.send(h.image(buffer, 'image/png'));
    console.log("测试完成")
}

export { test }