import { Player } from '@/types/Player';
import { drawImageListCenter } from "@/components/list";
import { drawDatablock } from '@/components/dataBlock'
import { drawText, drawTextWithImages } from "@/image/text";
import { Image, Canvas } from 'skia-canvas';
import { drawDegree } from '@/components/degree';
import { Degree } from '@/types/Degree';
import { Card } from '@/types/Card';
import { drawTitle } from '@/components/title';
import { getIcon } from '@/types/Server';

export async function drawPlayerDetailBlockWithIllust(player: Player): Promise<Canvas> {
    var list: Array<Canvas | Image> = []
    //玩家名
    var playerText = drawText({
        text: player.profile.userName,
        maxWidth: 800,
        textSize: 75
    })
    list.push(drawImageListCenter([playerText]))
    //等级
    var levelText = drawText({
        text: `等级 ${player.profile.rank}`,
        maxWidth: 800,
        textSize: 35
    })
    list.push(drawImageListCenter([levelText]))
    list.push(new Canvas(1, 25))
    //degree(牌子)列表
    var degreeImageList: Array<Canvas | Image> = []
    var userProfileDegreeMap = player.profile.userProfileDegreeMap.entries
    for (var i in userProfileDegreeMap) {
        var tempDegree = userProfileDegreeMap[i]
        var tempDegreeImage = await drawDegree(new Degree(tempDegree.degreeId), player.server)
        degreeImageList.push(tempDegreeImage)
        degreeImageList.push(new Canvas(20, 1))
    }
    degreeImageList.pop()
    list.push(drawImageListCenter(degreeImageList))
    list.push(new Canvas(1, 25))
    //玩家描述
    var introductionText = drawText({
        text: player.profile.introduction,
        maxWidth: 800,
        textSize: 35
    })
    list.push(drawImageListCenter([introductionText]))
    list.push(new Canvas(1, 25))
    //玩家ID与服务器
    let userId: string
    if (player.profile.publishUserIdFlg) {
        userId = player.profile.userId.toString()
    }
    else {
        userId = 'ID未公开'
    }
    var idText = drawTextWithImages({
        content: [await getIcon(player.server), userId],
        maxWidth: 800,
        textSize: 35
    })
    list.push(drawImageListCenter([idText]))
    var dataBlock = drawDatablock({ list, opacity: 1 })
    //获取玩家首页卡面插画
    const userIllustData = player.profile.userIllust
    const illustCard = new Card(userIllustData.cardId)
    var illust = await illustCard.getCardTrimImage(userIllustData.trainingStatus)
    //最终绘图
    var titleImage = drawTitle('查询', '玩家信息')
    var canvas = new Canvas(1000, 900 + dataBlock.height)
    var ctx = canvas.getContext('2d')
    ctx.drawImage(illust, 0, 0, 1000, 1000)
    ctx.drawImage(titleImage, 0, 0)
    ctx.drawImage(dataBlock, 0, 900)
    return canvas
}
