import { callAPIAndCacheResponse } from '../api/getApi';
import { Bestdoriurl } from '../config';
import { Server, getServerByPriority, defaultserverList } from './Server'


/*
- mode=0 只从缓存取，无需等待队列立即返回缓存数据
- mode=1 同上立即返回缓存数据，但同时再放入队列请求服务器后台更新
- mode=2 放入队列等待新鲜数据，如果耗时过长就返回缓存数据
- mode=3 放入队列持续等待新鲜数据
*/

export class Player {
    playerId: number;
    isExist: boolean = false;
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
                trainingStatus: string;
                duplicateCount: number;
                illust: string;
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
            illust: string;
            viewProfileSituationStatus: string;
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
    }

    constructor(playerId: number, server: Server, cache: boolean = false) {
        this.playerId = playerId;
        var cacheTime = cache ? 1/0 : 0;
        try{
            var playerData = callAPIAndCacheResponse(`${Bestdoriurl}/api/player/${server.serverName}/${playerId}`, cacheTime);
        }
        catch{
            this.isExist = false;
            return
        }
        if(playerData['data']['profile'] == null){
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.cache = playerData['data']['cache'];
        this.time = playerData['data']['time'];
        this.profile = playerData['data']['profile'];
    }

}
