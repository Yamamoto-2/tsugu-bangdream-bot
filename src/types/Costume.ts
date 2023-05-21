import { callAPIAndCacheResponse } from '../api/getApi';
import { downloadFile } from '../api/downloadFile';
import { Bestdoriurl } from '../config';
import mainAPI from './_Main';
import {getServerByPriority } from './Server';
import { Image, loadImage} from 'canvas';

export class Costume {
    costumeId: number;
    isExist: boolean = false;
    characterId: number;
    assetBundleName: string;
    description: Array<string | null>;
    publishedAt: Array<number | null>;
    data:Object;
    cards:Array<number>;
    sdResourceName:string;
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
        this.publishedAt = costumeData['publishedAt'];
    }
    async initFull() {
        //https://bestdori.com/api/costumes/36.json
        var costumeData = await callAPIAndCacheResponse(`https://bestdori.com/api/costumes/${this.costumeId}.json`)
        this.data = costumeData
        this.isExist = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = costumeData['publishedAt'];
        this.cards = costumeData['cards'];
        this.sdResourceName = costumeData['sdResourceName'];
    }
    async getSdchara(): Promise<Image> {
        var server = getServerByPriority(this.publishedAt)
        var Buffer = await downloadFile(`${Bestdoriurl}/assets/${server.serverName}/characters/livesd/${this.sdResourceName}_rip/sdchara.png`)
        return await loadImage(Buffer)
    }
}
