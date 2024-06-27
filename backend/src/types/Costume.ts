import { callAPIAndCacheResponse } from '@/api/getApi';
import { downloadFile } from '@/api/downloadFile';
import { Bestdoriurl, globalDefaultServer } from '@/config';
import mainAPI from '@/types/_Main';
import { Server, getServerByPriority } from '@/types/Server';
import { Image, loadImage } from 'skia-canvas';
import { stringToNumberArray } from '@/types/utils'

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
    isInitfull: boolean = false;
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
        if (this.isInitfull) {
            return
        }
        var costumeData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/costumes/${this.costumeId}.json`)
        this.data = costumeData
        this.isExist = true;
        this.characterId = costumeData['characterId'];
        this.assetBundleName = costumeData['assetBundleName'];
        this.description = costumeData['description'];
        this.publishedAt = stringToNumberArray(costumeData['publishedAt']);
        this.cards = costumeData['cards'];
        this.sdResourceName = costumeData['sdResourceName'];
        this.isInitfull = true;
    }
    async getSdchara(displayedServerList: Server[] = globalDefaultServer): Promise<Image> {
        if (!displayedServerList) displayedServerList = globalDefaultServer
        var server = getServerByPriority(this.publishedAt, displayedServerList)
        var sdCharaBuffer = await downloadFile(`${Bestdoriurl}/assets/${Server[server]}/characters/livesd/${this.sdResourceName}_rip/sdchara.png`)
        return await loadImage(sdCharaBuffer)
    }
}
