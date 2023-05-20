import mainAPI from './_Main'
import { callAPIAndCacheResponse } from '../api/getApi'
import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'

export class Character {
    characterId: number;
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

    constructor(characterId: number) {
        var characterData = mainAPI["characters"][characterId.toString()];
        if (characterData == undefined) {
            this.isExist = false;
            return
        }

        this.characterId = characterId;
        this.data = characterData;
        this.characterName = this.data["characterName"];
        this.firstName = this.data["firstName"];
        this.lastName = this.data["lastName"];
        this.nickname = this.data["nickname"];
        this.bandId = this.data["bandId"];
    }
    async initFull() {
        if (this.isExist == false) {
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
        var cardData = await callAPIAndCacheResponse('https://bestdori.com/api/characters/' + this.characterId + '.json')
        return cardData
    }
    async getIcon(): Promise<Image>{
        const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/chara_icon_${this.characterId}.png`)
        return (await loadImage(iconBuffer))
    }
    getCharacterName():Array<string|null>{
        const characterNameList = []
        for (let i = 0; i < this.characterName.length; i++) {
            const element = this.characterName[i];
            if(this.nickname[i] != null){
                characterNameList.push(`${this.nickname[i]} (${element})`)
            }
            else{
                characterNameList.push(element)
            }
        }
        return characterNameList
    }

}
