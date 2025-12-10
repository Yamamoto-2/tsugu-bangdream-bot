import { Character } from "@/types/Character";
import mainAPI from "@/types/_Main"
import { match, FuzzySearchResult } from "@/fuzzySearch"
import { Canvas } from 'skia-canvas'
import { drawDatablock, } from '@/components/dataBlock';
import { drawTitle } from '@/components/title';
import { outputFinalBuffer } from '@/image/output'
import { Server } from '@/types/Server'
import { globalDefaultServer } from '@/config';
import { drawCharacterHalfBlock } from '@/components/dataBlock/characterHalf'
import { drawList } from '@/components/list'
import { drawCharacterDetail } from './characterDetail'

const maxWidth = 1370

export async function drawCharacterList(matches: FuzzySearchResult, displayedServerList: Server[] = globalDefaultServer, compress: boolean): Promise<Array<Buffer | string>> {
    //计算模糊搜索结果
    var tempCharacterList: Array<Character> = [];//最终输出的角色列表
    var characterIdList: Array<number> = Object.keys(mainAPI['characters']).map(Number);//所有卡牌ID列表
    for (let i = 0; i < characterIdList.length; i++) {
        const tempCharacter = new Character(characterIdList[i]);
        var isMatch = match(matches, tempCharacter, ['scoreUpMaxValue']);
        //如果在所有所选服务器列表中都不存在，则不输出
        var numberOfNotReleasedServer = 0;
        for (var j = 0; j < displayedServerList.length; j++) {
            var server = displayedServerList[j];
            //通过该服务器是否有角色名来判断是否已经发布
            if (tempCharacter.characterName[server] == null) {
                numberOfNotReleasedServer++;
            }
        }
        if (numberOfNotReleasedServer == displayedServerList.length) {
            isMatch = false;
        }
        if (isMatch) {
            tempCharacterList.push(tempCharacter);
        }
    }
    if (tempCharacterList.length == 0) {
        return ['没有搜索到符合条件的角色']
    }
    if (tempCharacterList.length == 1) {
        return (await drawCharacterDetail(tempCharacterList[0].characterId, displayedServerList, compress))
    }
    const characterImageList: Canvas[] = []
    for (let i = 0; i < tempCharacterList.length; i++) {
        const element = tempCharacterList[i];
        characterImageList.push(await drawCharacterHalfBlock(element, displayedServerList))
    }
    const characterListImage = drawList({
        content: characterImageList,
        maxWidth: maxWidth,
        spacing: 20,
        lineHeight: 820,
        textSize: 800
    })
    let all = []
    all.push(drawTitle('查询', '角色列表'))
    all.push(drawDatablock({
        list: [characterListImage]
    }))
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true,
        compress: compress,
    })
    return [buffer];
}