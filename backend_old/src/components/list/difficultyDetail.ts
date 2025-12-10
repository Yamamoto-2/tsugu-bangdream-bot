import { difficultyColorList, difficultyNameList } from "@/types/Song"
import { drawRoundedRectWithText } from "@/image/drawRect"
import { Canvas, Image } from 'skia-canvas';
import { drawTextWithImages } from "@/image/text";
import { drawList, drawImageListCenter } from '@/components/list'
import { resizeImage, stackImage } from "@/components/utils";
import { Player } from "@/types/Player";

interface drawDifficultyDetailInListOptions {
    [difficultyId: number]: Array<Canvas | Image | string>
}
//画难度详情
function DifficultyDetailInList(DifficultyDetailInListOptions: drawDifficultyDetailInListOptions, key?: string) {
    const difficultyAndContentList: Array<Canvas> = []
    for (let i in DifficultyDetailInListOptions) {
        const content = DifficultyDetailInListOptions[i]
        const maxWidth = 152
        const logoWidth = 140
        const tempBandIcon = drawRoundedRectWithText({
            text: difficultyNameList[i].toUpperCase(),
            width: logoWidth,
            textSize: 30,
            radius: 5,
            color: difficultyColorList[i]
        })

        const tempBandRankText = drawTextWithImages({
            content,
            maxWidth: maxWidth,
            lineHeight: 40,
        })
        const canvas = new Canvas(maxWidth, tempBandRankText.height + 50)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(tempBandIcon, (maxWidth - logoWidth) / 2, 0)
        ctx.drawImage(tempBandRankText, (maxWidth / 2) - tempBandRankText.width / 2, 50)
        difficultyAndContentList.push(canvas)
    }
    const difficultyAndContentListImage =  drawList({
        key,
        content: difficultyAndContentList,
        spacing:0,
        lineHeight: difficultyAndContentList?.[0].height,
        textSize :difficultyAndContentList?.[0].height
    })
    return difficultyAndContentListImage
}
//画玩家信息内不同类型的玩家详情
export function drawPlayerDifficultyDetailInList(player: Player, type: 'clearedMusicCount' | 'fullComboMusicCount' | 'allPerfectMusicCount', key?: string) {
    let DifficultyDetailInListOptions = {}
    const userMusicClearInfoMap = player.profile.userMusicClearInfoMap.entries
    for (const difficultyName in userMusicClearInfoMap) {
        if (Object.prototype.hasOwnProperty.call(userMusicClearInfoMap, difficultyName)) {
            const element = userMusicClearInfoMap[difficultyName];
            const difficultyId = difficultyNameList.indexOf(difficultyName)
            const content = [element[type].toString()]
            DifficultyDetailInListOptions[difficultyId] = content
        }
    }
    return DifficultyDetailInList(DifficultyDetailInListOptions, key)
}