import { h, Element } from 'koishi'
import { Canvas, createCanvas, Image, loadImage } from "canvas"
import { outputFinalBuffer } from '../image/output'
import { Server } from '../types/Server'
import { Player } from '../types/Player';
import { drawPlayerDetailBlockWithIllust } from '../components/dataBlock/playerDetail'
import { assetsRootPath } from '../config'
import * as path from 'path'
import { drawPlayerCardInList } from '../components/list/playerCardIconList'
import { line, drawList, drawTipsInList} from '../components/list'
import { drawStatInList } from '../components/list/stat';
import { drawDatablock } from '../components/dataBlock';
import { drawPlayerBandRankInList, drawPlayerStageChallengeRankInList, drawPlayerDeckTotalRatingInList } from '../components/list/bandDetail'
import { drawPlayerDifficultyDetailInList } from '../components/list/difficultyDetail'

let BGDefaultImage: Image
async function loadImageOnce() {
    BGDefaultImage = await loadImage(path.join(assetsRootPath, "/BG/common.png"));
}
loadImageOnce()

export async function drawPlayerDetail(playerId: number, server: Server): Promise<Element | string> {
    var player = new Player(playerId, server)
    await player.initFull()
    if (!player.isExist) {
        return '错误: 玩家不存在，请检查服务器是否正确'
    }/*
    var stat = await player.calcStat()
    console.log(stat)
    console.log(stat.performance+stat.technique+stat.visual)
    */

    const list: Array<Canvas | Image> = []
    //卡组
    list.push(await drawPlayerCardInList(player, '卡牌信息', true))
    list.push(line)
    //综合力
    if (player.profile.publishTotalDeckPowerFlg) {
        var stat = await player.calcStat()
        list.push(await drawStatInList(stat))
        list.push(drawTipsInList({
            text:'因为无法获得角色等级加成，综合力可能会出现偏差'
        }))
        list.push(line)
    }

    //难度完成信息
    if (player.profile.publishMusicClearedFlg) {
        list.push(drawPlayerDifficultyDetailInList(player, 'clearedMusicCount', '完成歌曲数'))
        list.push(line)
    }
    if (player.profile.publishMusicFullComboFlg) {
        list.push(drawPlayerDifficultyDetailInList(player, 'fullComboMusicCount', 'FullCombo 歌曲数'))
        list.push(line)
    }
    if (player.profile.publishMusicAllPerfectFlg) {
        list.push(drawPlayerDifficultyDetailInList(player, 'allPerfectMusicCount', 'AllPerfect 歌曲数'))
        list.push(line)
    }
    //乐队等级
    if (player.profile.publishBandRankFlg) {
        list.push(await drawPlayerBandRankInList(player, "乐队等级"))
        list.push(line)
    }
    //stageChallenge完成情况
    if (player.profile.publishStageChallengeAchievementConditionsFlg && player.profile.publishStageChallengeFriendRankingFlg) {
        list.push(await drawPlayerStageChallengeRankInList(player, 'StageChallenge达成情况'))
        list.push(line)
    }
    //乐队编成等级
    if (player.profile.publishDeckRankFlg) {
        list.push(await drawPlayerDeckTotalRatingInList(player, '乐队编成等级'))
        list.push(line)
    }
    //hsr
    if (player.profile.publishHighScoreRatingFlg) {
        list.push(drawList({
            key: 'High Score Rating',
            text: player.calcHSR().toString()
        }))
        list.push(line)
    }

    list.pop()
    const all: Array<Canvas | Image> = []
    //玩家信息 顶部 
    all.push(await drawPlayerDetailBlockWithIllust(player))
    var listImage = await drawDatablock({ list })
    all.push(listImage)
    var buffer = await outputFinalBuffer({
        imageList: all,
        useEazyBG: false,
        text: ' ',
        BGimage: BGDefaultImage
    })
    return h.image(buffer, 'image/png')
}