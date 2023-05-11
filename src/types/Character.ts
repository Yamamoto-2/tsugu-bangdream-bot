import mainAPI from './_Main'
import { callAPIAndCacheResponse } from '../api/getApi'

export class Character {
    characterID: number;
    data: object;
    characterType: string;
    characterName: Array<string | null>;
    firstName: Array<string | null>;
    lastName: Array<string | null>;
    nickname: Array<string | null>;
    bandId: number;
    colorCode: string;
    sdAssetBundleName: string;
    defaultCostumeId: number;
    ruby: Array<string | null>;
    isExist: boolean = false;
    profile: {
        characterVoice: Array<string | null>;
        favoriteFood: Array<string | null>;
        hatedFood: Array<string | null>;
        hobby: Array<string | null>;
        selfIntroduction: Array<string | null>;
        school: Array<string | null>;
        schoolCls: Array<string | null>;
        schoolYear: number;
        part: string;
        birthday: string;
        constellation: string;
        height: number;
    };

    constructor(characterID: number) {
        var characterData = mainAPI["characters"][characterID.toString()];
        if (characterData == undefined) {
            this.isExist = false;
            return
        }

        this.characterID = characterID;
        this.data = characterData;
        this.characterName = this.data["characterName"];
        this.firstName = this.data["firstName"];
        this.lastName = this.data["lastName"];
        this.nickname = this.data["nickname"];
        this.bandId = this.data["bandId"];
    }
    async initFull() {
        if(mainAPI["characters"][this.characterID.toString()] == undefined) {
            this.isExist = false;
            return
        }
        this.data = await this.getData();
        this.characterType = this.data["characterType"];
        this.characterName = this.data["characterName"];
        this.firstName = this.data["firstName"];
        this.lastName = this.data["lastName"];
        this.nickname = this.data["nickname"];
        this.bandId = this.data["bandId"];
        this.colorCode = this.data["colorCode"];
        this.sdAssetBundleName = this.data["sdAssetBundleName"];
        this.defaultCostumeId = this.data["defaultCostumeId"];
        this.ruby = this.data["ruby"];
        this.profile = this.data["profile"];
    }
    async getData() {
        var cardData = await callAPIAndCacheResponse('https://bestdori.com/api/characters/' + this.characterID + '.json')
        return cardData
    }

}
