import { drawList, line, drawListByServerList, drawListMerge, drawImageListCenter, drawTipsInList } from '@/components/list';
import { drawDatablock } from '@/components/dataBlock'
import { Image, Canvas } from 'skia-canvas'
import { Server, getServerByPriority } from '@/types/Server';
import { drawTitle } from '@/components/title';
import { outputFinalBuffer } from '@/image/output'
import { globalDefaultServer, serverNameFullList } from '@/config';
import { Character } from '@/types/Character';
import { drawCharacterHalfBlock } from '@/components/dataBlock/characterHalf'
import { drawDottedLine } from '@/image/dottedLine'
import { Band } from '@/types/Band';
import { changeTimefomantMonthDay } from '@/components/list/time';
import { stackImage, stackImageHorizontal } from '@/components/utils';
import { drawBandInList } from '@/components/list/band';
import { config } from '@/fuzzySearch'
import { getColorFromHex } from '@/types/Color'


const rightListWidth = 500
const rightListLine: Canvas = drawDottedLine({
    width: rightListWidth,
    height: 30,
    startX: 5,
    startY: 15,
    endX: rightListWidth - 5,
    endY: 15,
    radius: 2,
    gap: 10,
    color: "#a8a8a8"
})

const constellationList = {
    'capricorn': '摩羯座',
    'aquarius': '水瓶座',
    'pisces': '双鱼座',
    'aries': '白羊座',
    'taurus': '金牛座',
    'gemini': '双子座',
    'cancer': '巨蟹座',
    'leo': '狮子座',
    'virgo': '处女座',
    'libra': '天秤座',
    'scorpio': '天蝎座',
    'sagittarius': '射手座',
}

export async function drawCharacterDetail(characterId: number, displayedServerList: Server[] = globalDefaultServer, compress: boolean): Promise<Array<Buffer | string>> {
    const character = new Character(characterId)
    if (!character.isExist) {
        return ['错误: 角色不存在']
    }
    await character.initFull()
    let all: Array<Canvas | Image> = []
    //右侧文字
    let listRight: Array<Canvas | Image> = []
    //角色名
    listRight.push(await drawListByServerList(
        character.characterName,
        '角色名',
        displayedServerList,
        rightListWidth
    ))
    listRight.push(rightListLine)

    //ruby
    listRight.push(await drawListByServerList(
        character.ruby,
        'ruby',
        displayedServerList,
        rightListWidth
    ))
    listRight.push(rightListLine)

    //nickname
    if (!character.nickname.every((element) => element === null)) {//如果有昵称
        listRight.push(await drawListByServerList(
            character.nickname,
            '昵称',
            displayedServerList,
            rightListWidth
        ))
        listRight.push(rightListLine)
    }
    //配音
    listRight.push(await drawListByServerList(
        character.profile.characterVoice,
        '配音',
        displayedServerList,
        rightListWidth
    ))
    listRight.push(rightListLine)
    //应援色
    const tempColor = getColorFromHex(character.colorCode)
    listRight.push(drawList(
        {
            key: '应援色',
            content: [character.colorCode, tempColor.generateColorBlock(1)],
            maxWidth: rightListWidth
        }
    ))


    //画上部图片
    const imageLeft = stackImage(listRight)
    const characterHalfBlock = await drawCharacterHalfBlock(character)
    const imageUp = stackImageHorizontal([imageLeft, new Canvas(50, 50), characterHalfBlock])

    //画下部文字
    let list: Array<Canvas | Image> = []
    //描述
    list.push(line)
    const tempServer = getServerByPriority(character.characterName)
    list.push(drawTipsInList({
        text: character.profile.selfIntroduction[tempServer]
    }))
    list.push(line)

    //乐队
    const band = new Band(character.bandId)
    list.push(await drawBandInList({
        key: '乐队',
        content: [band]
    }))
    list.push(line)
    //生日
    const birthdayTextImage = drawList({
        text: changeTimefomantMonthDay(Number(character.profile.birthday)),
        key: '生日',
    })
    //星座
    const constellationTextImafe = drawList({
        text: constellationList[character.profile.constellation],
        key: '星座',
    })
    list.push(drawListMerge([birthdayTextImage, constellationTextImafe]))
    list.push(line)
    //身高
    const heightTextImage = drawList({
        text: `${character.profile.height}cm`,
        key: '身高',
    })
    //part
    const partTextImage = drawList({
        text: character.profile.part,
        key: '位置',
    })
    list.push(drawListMerge([heightTextImage, partTextImage]))
    list.push(line)
    //学校
    list.push(await drawListByServerList(
        character.profile.school,
        '学校',
        displayedServerList,
    ))
    list.push(line)

    //年级
    const schoolYearTextImage = await drawListByServerList(
        character.profile.schoolYear,
        '年级',
        displayedServerList,
    )
    //班级
    const schoolClsTextImage = await drawListByServerList(
        character.profile.schoolCls,
        '班级',
        displayedServerList,
    )
    list.push(drawListMerge([schoolYearTextImage, schoolClsTextImage]))
    list.push(line)

    //兴趣
    list.push(await drawListByServerList(
        character.profile.hobby,
        '兴趣',
        displayedServerList
    ))
    list.push(line)
    //喜欢的食物
    list.push(await drawListByServerList(
        character.profile.favoriteFood,
        '喜欢的食物',
        displayedServerList
    ))
    list.push(line)

    //讨厌的食物
    list.push(await drawListByServerList(
        character.profile.hatedFood,
        '讨厌的食物',
        displayedServerList
    ))
    list.push(line)

    //角色模糊搜索文字
    list.push(drawList({
        text: config.characterId[character.characterId].toString(),
        key: '角色模糊搜索关键字',
    }))
    list.push(line)

    //乐队模糊搜索文字
    list.push(drawList({
        text: config.bandId[character.bandId].toString(),
        key: '乐队模糊搜索关键字',
    }))

    //总体
    all.push(drawTitle('查询', '角色'))
    all.push(drawDatablock({
        list: [
            drawImageListCenter([await character.getNameBanner()]),
            new Canvas(50, 50),
            imageUp,
            stackImage(list)]
    }))

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress: compress,
    })

    return [buffer]
}