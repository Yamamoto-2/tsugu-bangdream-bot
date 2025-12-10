import mainAPI from '@/types/_Main'
import { callAPIAndCacheResponse } from '@/api/getApi'
import { Image, loadImage } from 'skia-canvas'
import { downloadFileCache } from '@/api/downloadFileCache'
import { formatNumber } from '@/types/utils';
import { Bestdoriurl } from "@/config"

let characterDataCache = {}

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
        schoolYear: string[];
        part: string;
        birthday: string;
        constellation: string;
        height: number;
    };
    isInitFull: boolean = false;

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

        this.isExist = true;
    }
    async initFull(useCache: boolean = true) {
        if (this.isInitFull) {
            return
        }
        if (this.isExist == false) {
            return
        }
        this.isExist = true;
        if (characterDataCache[this.characterId.toString()] != undefined && !useCache) {
            var characterData = characterDataCache[this.characterId.toString()]
        }
        else {
            var characterData = await this.getData(useCache)
            characterDataCache[this.characterId.toString()] = characterData
        }
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

        //缓存数据
        if (characterDataCache[this.characterId.toString()] == undefined) {
            characterDataCache[this.characterId.toString()] = characterData
        }
        this.isInitFull = true;
    }
    async getData(update: boolean = true) {
        var time = update ? 0 : 1 / 0
        var cardData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/characters/${this.characterId}.json`, time)
        return cardData
    }
    async getIcon(): Promise<Image> {
        const iconBuffer = await downloadFileCache(`${Bestdoriurl}/res/icon/chara_icon_${this.characterId}.png`)
        return (await loadImage(iconBuffer))
    }
    async getIllustration(): Promise<Image> {
        const illustrationBuffer = await downloadFileCache(`${Bestdoriurl}/assets/jp/ui/character_kv_image/${formatNumber(this.characterId, 3)}_rip/image.png`)
        return (await loadImage(illustrationBuffer))
    }
    async getNameBanner(): Promise<Image> {
        const nameBannerBuffer = await downloadFileCache(`${Bestdoriurl}/assets/jp/character_name_rip/name_top_chr${formatNumber(this.characterId, 2)}.png`)
        return (await loadImage(nameBannerBuffer))
    }
    getCharacterName(): Array<string | null> {
        const characterNameList = []
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

