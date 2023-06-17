import { callAPIAndCacheResponse } from '../api/getApi';
import { downloadFile } from '../api/downloadFile';
import { Bestdoriurl, globalDefaultServer } from '../config';
import mainAPI from './_Main';
import { Server, getServerByPriority } from './Server';
import { Image, loadImage } from 'canvas';
import {stringToNumberArray} from './utils'

export class Costume {
    costumeId: number;
    isExist: boolean = false;
    characterId: number;
    assetBundleName: string;
    description: Array<string | null>;
    publishedAt: Array<number | null>;
    data: Object;
    cards: Array<number>;
    sdResourceName: string;
    constructor(costumeId: number) {
        this.costumeId = costumeId
        const costumeData = mainAPI['costumes'][costumeId.toString()]
        if (costumeData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = stringToNumberArray(costumeData['publishedAt']);
    }
    async initFull() {
        //https://bestdori.com/api/costumes/36.json
        var costumeData = await callAPIAndCacheResponse(`https://bestdori.com/api/costumes/${this.costumeId}.json`)
        this.data = costumeData
        this.isExist = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = stringToNumberArray(costumeData['publishedAt']);
        this.cards = costumeData['cards'];
        this.sdResourceName = costumeData['sdResourceName'];
    }
    async getSdchara(defaultServerList: Server[] = globalDefaultServer): Promise<Image> {
        if (!defaultServerList) defaultServerList = globalDefaultServer
        var server = getServerByPriority(this.publishedAt, defaultServerList)
        var Buffer = await downloadFile(`${Bestdoriurl}/assets/${Server[server]}/characters/livesd/${this.sdResourceName}_rip/sdchara.png`)
        return await loadImage(Buffer)
    }
}
