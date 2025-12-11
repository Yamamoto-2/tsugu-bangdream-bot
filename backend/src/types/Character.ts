/**
 * Character domain type
 * Migrated from backend_old/src/types/Character.ts
 * Removed: HTTP calls (getData, initFull HTTP part), rendering methods (getIcon, getIllustration, getNameBanner)
 * 
 * Note: Constructor still depends on mainAPI
 * This will be refactored to use BestdoriClient in the future
 */

export class Character {
    characterId: number;
    data!: object;
    characterType!: string;
    characterName!: Array<string | null>;
    firstName!: Array<string | null>;
    lastName!: Array<string | null>;
    nickname!: Array<string | null>;
    bandId!: number;
    colorCode!: string;
    sdAssetBundleName!: string;
    defaultCostumeId!: number;
    ruby!: Array<string | null>;
    isExist: boolean = false;
    profile!: {
        characterVoice: Array<string | null>;
        favoriteFood: Array<string | null>;
        hatedFood: Array<string | null>;
        hobby: Array<string | null>;
        selfIntroduction: Array<string | null>;
        school: Array<string | null>;
        schoolCls: Array<string | null>;
        schoolYear: string[];
        part: string;
        birthday: string;
        constellation: string;
        height: number;
    };
    isInitFull: boolean = false;

    /**
     * Constructor - creates Character from characterId
     * TODO: In the future, characterData should be provided via BestdoriClient
     */
    constructor(characterId: number, characterData?: any) {
        this.characterId = characterId;
        
        if (!characterData) {
            this.isExist = false;
            return
        }

        this.data = characterData;
        this.characterName = characterData["characterName"];
        this.firstName = characterData["firstName"];
        this.lastName = characterData["lastName"];
        this.nickname = characterData["nickname"];
        this.bandId = characterData["bandId"];

        this.isExist = true;
    }

    /**
     * Initialize full character data from provided characterData
     * This replaces the old initFull() which made HTTP calls
     */
    initFromFullData(characterData: any): void {
        if (this.isInitFull) {
            return
        }
        if (this.isExist == false) {
            return
        }

        this.isExist = true;
        this.data = characterData
        this.characterType = characterData["characterType"];
        this.characterName = characterData["characterName"];
        this.firstName = characterData["firstName"];
        this.lastName = characterData["lastName"];
        this.nickname = characterData["nickname"];
        this.bandId = characterData["bandId"];
        this.colorCode = characterData["colorCode"];
        this.sdAssetBundleName = characterData["sdAssetBundleName"];
        this.defaultCostumeId = characterData["defaultCostumeId"];
        this.ruby = characterData["ruby"];
        this.profile = characterData["profile"];
        
        //修复学年类型错误
        for (var i = 0; i < this.profile.schoolYear.length; i++) {
            if(this.profile.schoolYear[i] != null){
                this.profile.schoolYear[i] = this.profile.schoolYear[i].toString()
            }
        }

        this.isInitFull = true;
    }

    /**
     * Get character name list (with nickname)
     * Pure function - no IO
     */
    getCharacterName(): Array<string | null> {
        const characterNameList: Array<string | null> = []
        for (let i = 0; i < this.characterName.length; i++) {
            const element = this.characterName[i];
            if (this.nickname[i] != null) {
                characterNameList.push(`${this.nickname[i]} (${element})`)
            }
            else {
                characterNameList.push(element)
            }
        }
        return characterNameList
    }
}

