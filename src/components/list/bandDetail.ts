import { Player } from "../../types/Player";
import { Canvas, createCanvas, Image, loadImage } from "canvas";
import { drawList, drawImageListCenter } from '../list'
import { resizeImage, stackImage } from "../utils";
import { Band } from "../../types/Band";
import { drawTextWithImages } from "../text";
import { starList } from './rarity'
import mainAPI from "../../types/_Main";
import { downloadFileCache } from "../../api/downloadFileCache";
import { Bestdoriurl } from "../../config";

interface drawBandDetailsInListOptions {
    [bandId: number]: Array<Canvas | Image | string>
}
//画乐队详情
async function drawBandDetailsInList(BandDetailsInListOptions: drawBandDetailsInListOptions, key?: string) {

    const bandAndContentList: Array<Canvas> = []
    for (let i in BandDetailsInListOptions) {
        const tempBand = new Band(parseInt(i))
        const content = BandDetailsInListOptions[i]
        const maxWidth = 152
        const logoWidth = 110
        const tempBandIcon = resizeImage({
            image: await tempBand.getLogo(),
            widthMax: logoWidth
        })
        const canvas = createCanvas(maxWidth, 100)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(tempBandIcon, (maxWidth - logoWidth) / 2, 0)
        const tempBandRankText = drawTextWithImages({
            content,
            maxWidth: maxWidth,
            lineHeight: 40,
        })
        ctx.drawImage(tempBandRankText, (maxWidth / 2) - tempBandRankText.width / 2, 50)
        bandAndContentList.push(canvas)
    }
    const bandAndContentListImage = drawList({
        key,
        content: bandAndContentList,
        spacing: 0,
        lineHeight: bandAndContentList?.[0].height,
        textSize:bandAndContentList?.[0].height
    })
    return bandAndContentListImage

}
//画玩家信息内乐队等级
export async function drawPlayerBandRankInList(player: Player, key?: string): Promise<Canvas> {
    const bandRankMap = player.profile.bandRankMap?.entries
    let BandDetails = {}
    for (let i in mainAPI['bands']) {
        if (bandRankMap[i] != undefined) {
            BandDetails[i] = [bandRankMap[i].toString()]
        }
        else {
            BandDetails[i] = ['0']
        }
    }
    return drawBandDetailsInList(BandDetails, key)
}
//画玩家信息内stage challenge等级
export async function drawPlayerStageChallengeRankInList(player: Player, key?: string): Promise<Canvas> {
    const stageChallengeAchievementConditionsMap = player.profile.stageChallengeAchievementConditionsMap.entries;

    const BandDetails = {};
    for (const band in mainAPI['bands']) {
        const level = stageChallengeAchievementConditionsMap?.[band] || 0;
        BandDetails[band] = [starList.normal, level.toString()];
    }
    return drawBandDetailsInList(BandDetails, key);
}

//画玩家信息内乐队卡组最高等级
const DeckTotalRatingIdList = {
    d: 0,
    c: 1,
    b: 2,
    a: 3,
    s: 4,
    ss: 5
}

export async function drawPlayerDeckTotalRatingInList(player: Player, key?: string) {
    const userDeckTotalRatingMap = player.profile.userDeckTotalRatingMap.entries
    let BandDetails = {}

    for (let i in mainAPI['bands']) {
        if (userDeckTotalRatingMap[i] != undefined) {
            const content = []
            const rankName = userDeckTotalRatingMap[i].rank
            const rankImage = await loadImage(await downloadFileCache(`${Bestdoriurl}/res/icon/rank_${DeckTotalRatingIdList[rankName]}.png`))
            content.push(rankImage)
            if (userDeckTotalRatingMap[i].level != 0) {
                content.push(userDeckTotalRatingMap[i].level.toString())
            }
            BandDetails[i] = content
        }
        else {
            BandDetails[i] = ['?']
        }
    }

    return drawBandDetailsInList(BandDetails, key)
}