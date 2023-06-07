import { callAPIAndCacheResponse } from '../api/getApi';
import { Bestdoriurl } from '../config';
import { Server } from './Server'
import { Card, addStat, Stat } from './Card'
import { AreaItem } from './AreaItem';
import { Event } from './Event';

/*
- mode=0 只从缓存取，无需等待队列立即返回缓存数据
- mode=1 同上立即返回缓存数据，但同时再放入队列请求服务器后台更新
- mode=2 放入队列等待新鲜数据，如果耗时过长就返回缓存数据
- mode=3 放入队列持续等待新鲜数据
*/

export class Player {
    playerId: number;
    isExist: boolean = false;
    initError: boolean = false;
    cache: boolean;
    time: number;
    profile: {
        userId: string;
        userName: string;
        rank: number;
        degree: number;
        introduction: string;
        publishTotalDeckPowerFlg: boolean;
        publishBandRankFlg: boolean;
        publishMusicClearedFlg: boolean;
        publishMusicFullComboFlg: boolean;
        publishHighScoreRatingFlg: boolean;
        publishUserIdFlg: boolean;
        searchableFlg: boolean;
        publishUpdatedAtFlg: boolean;
        friendApplicableFlg: boolean;
        publishMusicAllPerfectFlg: boolean;
        publishDeckRankFlg: boolean;
        publishStageChallengeAchievementConditionsFlg: boolean;
        publishStageChallengeFriendRankingFlg: boolean;
        publishCharacterRankFlg: boolean;
        mainDeckUserSituations: {
            entries: Array<{
                userId: string;
                situationId: number;
                level: number;
                exp: number;
                createdAt: string;
                addExp: number;
                trainingStatus: 'not_doing' | 'done';
                duplicateCount: number;
                illust: 'after_training' | 'normal';
                skillExp: number;
                skillLevel: number;
                userAppendParameter: {
                    userId: string;
                    situationId: number;
                    performance: number;
                    technique: number;
                    visual: number;
                    characterPotentialPerformance: number;
                    characterPotentialTechnique: number;
                    characterPotentialVisual: number;
                };
                limitBreakRank: number;
            }>
        };
        enabledUserAreaItems: {
            entries: Array<{
                userId: string;
                areaItemId: number;
                areaItemCategory: number;
                level: number;
            }>
        };
        bandRankMap: {
            entries: {
                [bandId: number]: number
            }
        };
        userHighScoreRating: {
            [bandHighScoreRatingName: string]: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            /*
            userPoppinPartyHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            userAfterglowHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            userPastelPalettesHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            userHelloHappyWorldHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            userRoseliaHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            userOtherHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            userMorfonicaHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            userRaiseASuilenHighScoreMusicList: {
                entries: Array<{
                    musicId: number;
                    difficulty: string;
                    rating: number;
                }>
            };
            */
        };
        mainUserDeck: {
            deckId: number;
            deckName: string;
            leader: number;
            member1: number;
            member2: number;
            member3: number;
            member4: number;
            deckType: string;
        };
        userProfileSituation: {
            userId: string;
            situationId: number;
            illust: 'after_training' | 'normal';
            viewProfileSituationStatus: 'deck_leader' | 'profile_situation';
        };
        userProfileDegreeMap: {
            entries: {
                first: {
                    userId: string;
                    profileDegreeType: string;
                    degreeId: number;
                };
                second: {
                    userId: string;
                    profileDegreeType: string;
                    degreeId: number;
                };
            }
        };
        userTwitter?: {
            twitterId: string;
            twitterName: string;
            screenName: string;
            url: string;
            profileImageUrl: string;
        };
        userDeckTotalRatingMap: {
            entries: {
                [bandId: number]: {
                    rank: string;
                    score: number;
                    level: number;
                    lowerRating: number;
                    upperRating: number;
                }
            }
        };
        stageChallengeAchievementConditionsMap: {
            entries: {
                [bandId: number]: number;
            }
        };
        userMusicClearInfoMap: {
            entries: {
                [difficultyName: string]: {
                    clearedMusicCount: number;
                    fullComboMusicCount: number;
                    allPerfectMusicCount: number;
                };
            }
        };
        userCharacterRankMap: {
            entries: {
                [characterId: number]: {
                    rank: 3,
                    exp: number,
                    addExp: number,
                    nextExp: number,
                    totalExp: number,
                    releasedPotentialLevel: number
                }
            }
        };

        //其他
        //卡牌列表
        cardList: Card[];
        //插画
        userIllust: { cardId: number, trainingStatus: boolean };

    }
    server: Server;
    constructor(playerId: number, server: Server) {
        this.playerId = playerId;
        this.server = server;
    }
    async initFull(cache: boolean = false) {
        var cacheTime = cache ? 1 / 0 : 0;
        try {
            var playerData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/player/${Server[this.server]}/${this.playerId}?mode=2`, cacheTime);
        }
        catch {
            this.isExist = false;
            this.initError = true;
            return
        }
        if (!playerData["result"] || playerData['data']['profile'] == null) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.cache = playerData['data']['cache'];
        this.time = playerData['data']['time'];
        this.profile = playerData['data']['profile'];
        //卡牌列表
        this.profile.cardList = []
        for (let i = 0; i < this.profile.mainDeckUserSituations.entries.length; i++) {
            const cardData = this.profile.mainDeckUserSituations.entries[i];
            var card = new Card(cardData.situationId)
            this.profile.cardList.push(card)
        }
        //插画
        this.profile.userIllust = this.getUserIllust()

        //修复新旧API难度信息不兼容问题
        if (this.profile.userMusicClearInfoMap == undefined) {
            const difficultyNameList = ['easy', 'normal', 'hard', 'expert', 'special'] //难度名称
            this.profile.userMusicClearInfoMap = { entries: {} }
            for (let i = 0; i < difficultyNameList.length; i++) {
                const difficultyName = difficultyNameList[i];
                this.profile.userMusicClearInfoMap.entries[difficultyName] = {
                    clearedMusicCount: 0,
                    fullComboMusicCount: 0,
                    allPerfectMusicCount: 0,
                }
            }
            if (this.profile['clearedMusicCountMap']?.['entries'] != undefined) {
                for (let i = 0; i < difficultyNameList.length; i++) {
                    const difficultyName = difficultyNameList[i];
                    const number = this.profile['clearedMusicCountMap']['entries'][difficultyName] || 0
                    this.profile.userMusicClearInfoMap.entries[difficultyName]['clearedMusicCount'] = number
                }
            }
            if (this.profile['fullComboMusicCountMap']?.['entries'] != undefined) {
                for (let i = 0; i < difficultyNameList.length; i++) {
                    const difficultyName = difficultyNameList[i];
                    const number = this.profile['fullComboMusicCountMap']['entries'][difficultyName] || 0
                    this.profile.userMusicClearInfoMap.entries[difficultyName]['fullComboMusicCount'] = number
                }
            }
            if (this.profile['allPerfectMusicCountMap']?.['entries'] != undefined) {
                for (let i = 0; i < difficultyNameList.length; i++) {
                    const difficultyName = difficultyNameList[i];
                    const number = this.profile['allPerfectMusicCountMap']['entries'][difficultyName] || 0
                    this.profile.userMusicClearInfoMap.entries[difficultyName]['allPerfectMusicCount'] = number
                }
            }
        }

    }
    async calcStat(event?: Event): Promise<Stat> {
        if (this.profile.publishTotalDeckPowerFlg == false) {
            return ({
                performance: 0,
                technique: 0,
                visual: 0,
            })
        }
        //计算卡牌本身属性
        var cardDataList = this.profile.mainDeckUserSituations.entries
        var cardStatList = []
        var cardStat: Stat = {//所有卡牌的属性总和
            performance: 0,
            technique: 0,
            visual: 0,
        }
        for (let i = 0; i < cardDataList.length; i++) {
            const cardData = cardDataList[i];
            var card = new Card(cardData.situationId)
            var trainingStatus = cardData.trainingStatus === 'done' ? true : false
            var tempStat = await card.calcStat(cardData.level, trainingStatus, cardData.limitBreakRank, false, false)
            addStat(cardStat, tempStat)
            cardStatList.push(tempStat)
        }
        //计算区域道具属性
        var extraStat: Stat = {//所有卡牌的额外属性总和
            performance: 0,
            technique: 0,
            visual: 0,
        }
        var areaItemList = this.profile.enabledUserAreaItems.entries
        for (let i = 0; i < areaItemList.length; i++) {
            const element = areaItemList[i];
            const areaItem = new AreaItem(element.areaItemCategory)
            const areaItemLevel = element.level
            for (let j = 0; j < cardStatList.length; j++) {
                const cardStat = cardStatList[j];
                const card = this.profile.cardList[j]
                var tempStat = areaItem.calcStat(card, areaItemLevel, cardStat, this.server)
                addStat(extraStat, tempStat)
            }
        }
        var eventStat: Stat = {//所有卡牌的额外属性总和
            performance: 0,
            technique: 0,
            visual: 0,
        }
        if (event != undefined) {
            for (let i = 0; i < cardStatList.length; i++) {

                const cardStat = cardStatList[i];
                const card = this.profile.cardList[i]
                var isCharacter = false
                var isAttribute = false
                for (let j = 0; i < event.characters.length; j++) {
                    const characterPercent = event.characters[j]
                    if (card.characterId == characterPercent.characterId) {
                        let tempStat = {
                            performance: cardStat.performance * characterPercent.percent / 100,
                            technique: cardStat.technique * characterPercent.percent / 100,
                            visual: cardStat.visual * characterPercent.percent / 100,
                        }
                        addStat(eventStat, tempStat)
                        isCharacter = true
                    }
                }
                for (let j = 0; j < event.attributes.length; j++) {
                    const attributePercent = event.attributes[j];
                    if (card.attribute == attributePercent.attribute) {
                        let tempStat = {
                            performance: cardStat.performance * attributePercent.percent / 100,
                            technique: cardStat.technique * attributePercent.percent / 100,
                            visual: cardStat.visual * attributePercent.percent / 100,
                        }
                        addStat(eventStat, tempStat)
                        isAttribute = true
                    }
                }
                if (isCharacter && isAttribute && event.eventAttributeAndCharacterBonus != undefined) {
                    if (event.eventAttributeAndCharacterBonus.parameterPercent != 0) {
                        let tempStat = {
                            performance: cardStat.performance * event.eventAttributeAndCharacterBonus.parameterPercent / 100,
                            technique: cardStat.technique * event.eventAttributeAndCharacterBonus.parameterPercent / 100,
                            visual: cardStat.visual * event.eventAttributeAndCharacterBonus.parameterPercent / 100,
                        }
                        addStat(eventStat, tempStat)
                    }
                }


            }
            addStat(extraStat, eventStat)
        }
        //相加
        addStat(cardStat, extraStat)
        //将cardStat所有参数向下取整
        cardStat.performance = Math.floor(cardStat.performance)
        cardStat.technique = Math.floor(cardStat.technique)
        cardStat.visual = Math.floor(cardStat.visual)

        return cardStat
    }
    calcHSR(): number {
        var hsr = 0
        var userHighScoreRating = this.profile.userHighScoreRating
        for (const i in userHighScoreRating) {
            if (Object.prototype.hasOwnProperty.call(userHighScoreRating, i)) {
                const userBandHighScoreRating = userHighScoreRating[i].entries;
                for (let j = 0; j < userBandHighScoreRating.length; j++) {
                    const element = userBandHighScoreRating[j];
                    hsr += element.rating
                }
            }
        }
        return hsr
    }
    getUserIllust(): { cardId: number, trainingStatus: boolean } {
        let illustCardId: number
        let trainingStatus: boolean
        let viewProfileSituationStatus: string
        if (Object.keys(this.profile.userProfileSituation).length != 0) {
            viewProfileSituationStatus = this.profile.userProfileSituation.viewProfileSituationStatus
        }
        else {
            viewProfileSituationStatus = 'deck_leader'
        }
        if (viewProfileSituationStatus == 'deck_leader') {
            illustCardId = this.profile.mainDeckUserSituations.entries[0].situationId
            trainingStatus = this.profile.mainDeckUserSituations.entries[0].illust === 'after_training' ? true : false
        }
        else {
            illustCardId = this.profile.userProfileSituation.situationId
            trainingStatus = this.profile.userProfileSituation.illust === 'after_training' ? true : false
        }
        var illustCard = new Card(illustCardId)
        return { cardId: illustCardId, trainingStatus: trainingStatus }
    }
}
