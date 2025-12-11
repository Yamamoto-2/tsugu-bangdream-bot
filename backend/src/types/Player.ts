/**
 * Player domain type
 * Migrated from backend_old/src/types/Player.ts
 * Removed: HTTP calls (init, initFull)
 * 
 * Note: Player data should be fetched via BestdoriClient/PlayerService
 */

import { Server } from './Server';
import { Card, Stat } from './Card';
import { AreaItem } from './AreaItem';
import { Event } from './Event';
import { difficultyNameList } from './Song';

/**
 * Player profile structure
 * Matches Bestdori API response structure exactly
 */
export interface PlayerProfile {
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
                characterBonusPerformance?: number;
                characterBonusTechnique?: number;
                characterBonusVisual?: number
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
            }
        }
    };
    userMusicDifficultyClearInfoMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: {
                    clearedFlg: boolean;
                    fullComboFlg: boolean;
                    allPerfectFlg: boolean;
                }
            }
        }
    };
    userMusicDifficultyScoreMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: number
            }
        }
    };
    userMusicDifficultyRankMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: string
            }
        }
    };
    userCharacterRankMap: {
        entries: {
            [characterId: number]: number
        }
    };
    userAreaItemMap: {
        entries: {
            [areaItemId: number]: number
        }
    };
    userCardMap: {
        entries: {
            [cardId: number]: number
        }
    };
    userGachaPointMap: {
        entries: {
            [gachaId: number]: number
        }
    };
    userLoginCampaignMap: {
        entries: {
            [loginCampaignId: number]: number
        }
    };
    userMiracleTicketExchangeMap: {
        entries: {
            [miracleTicketExchangeId: number]: number
        }
    };
    userComicMap: {
        entries: {
            [comicId: number]: number
        }
    };
    userMusicMetaMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: {
                    score: number;
                    rank: string;
                }
            }
        }
    };
    userMusicFullComboMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: boolean
            }
        }
    };
    userMusicAllPerfectMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: boolean
            }
        }
    };
    userMusicPlayCountMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: number
            }
        }
    };
    userMusicAchievementMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: {
                    achievementType: string;
                    rewardType: string;
                    quantity: number;
                }
            }
        }
    };
    userMusicDifficultyAchievementMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: {
                    achievementType: string;
                    rewardType: string;
                    quantity: number;
                }
            }
        }
    };
    userMusicDifficultyFullComboMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: boolean
            }
        }
    };
    userMusicDifficultyAllPerfectMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: boolean
            }
        }
    };
    userMusicDifficultyPlayCountMap: {
        entries: {
            [musicId: string]: {
                [difficultyName: string]: number
            }
        }
    };
    cardList?: Card[];
    userIllust?: { cardId: number, trainingStatus: boolean };
}

export class Player {
    playerId: number;
    server: Server;
    isExist: boolean = false;
    initError: boolean = false;
    cache!: boolean;
    time!: number;
    profile!: PlayerProfile;
    userCards!: {
        entries: {
            [cardId: number]: Card
        }
    };
    userAreaItems!: {
        entries: {
            [areaItemId: number]: AreaItem
        }
    };
    isInitFull: boolean = false;

    /**
     * Constructor - creates Player from playerId and server
     * TODO: In the future, playerData should be provided via BestdoriClient/PlayerService
     */
    constructor(playerId: number, server: Server, playerData?: any) {
        this.playerId = playerId
        this.server = server
        
        if (!playerData) {
            this.isExist = false;
            return
        }

        this.isExist = true;
        this.profile = playerData.profile;
        this.userCards = playerData.userCards || { entries: {} };
        this.userAreaItems = playerData.userAreaItems || { entries: {} };
        this.cache = playerData.cache || false;
        this.time = playerData.time || Date.now();
    }

    /**
     * Initialize full player data from provided playerData
     * This replaces the old init()/initFull() which made HTTP calls
     */
    initFromFullData(playerData: any): void {
        if (this.isInitFull) {
            return
        }
        if (this.isExist == false) {
            return
        }

        this.profile = playerData.profile;
        this.userCards = playerData.userCards || { entries: {} };
        this.userAreaItems = playerData.userAreaItems || { entries: {} };
        this.cache = playerData.cache || false;
        this.time = playerData.time || Date.now();
        this.isInitFull = true;
    }

    /**
     * Get user illustration card info
     * Pure function - no IO
     */
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
        return { cardId: illustCardId, trainingStatus: trainingStatus }
    }

    /**
     * Calculate High Score Rating (HSR)
     * Pure calculation function - no IO
     */
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
}

