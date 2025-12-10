import mainAPI from '@/types/_Main';
import { Character } from '@/types/Character';
import { Image, loadImage } from 'skia-canvas'
import { downloadFileCache } from '@/api/downloadFileCache';
import { formatNumber } from '@/types/utils';
import { Bestdoriurl } from "@/config"
import { convertSvgToPngBuffer } from '@/image/utils'

export class Band {
    bandId: number;
    isExist: boolean = false;
    data: object;
    bandName: Array<string | null>;
    members: Array<Character | null>;
    hasIcon: boolean = false;
    constructor(bandId: number) {
        this.bandId = bandId
        const bandData = mainAPI['singer'][bandId.toString()]
        if (mainAPI['bands'][bandId.toString()] != undefined) {
            this.hasIcon = true;
        }
        if (bandData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.data = bandData
        this.bandName = this.data['bandName']
        this.getMembers()
    }
    getMembers() {
        var members = []
        var characterList = mainAPI['characters']
        for (var characterID in characterList) {
            var character = new Character(parseInt(characterID))
            if (character.bandId == this.bandId) {
                members.push(character)
            }
        }
        this.members = members
    }
    async getIcon(): Promise<Image> {
        return await getBandIcon(this.bandId)
    }
    async getLogo(): Promise<Image> {
        const logoBuffer = await downloadFileCache(`${Bestdoriurl}/assets/jp/band/logo/${formatNumber(this.bandId, 3)}_rip/logoL.png`)
        return (await loadImage(logoBuffer))
    }
}


let bandIconCache: { [bandId: number]: Image } = {}

export async function getBandIcon(bandId: number): Promise<Image> {
    if (bandIconCache[bandId]) {
        return bandIconCache[bandId]
    }
    const iconSvgBuffer = await downloadFileCache(`${Bestdoriurl}/res/icon/band_${bandId}.svg`)
    const iconPngBuffer = await convertSvgToPngBuffer(iconSvgBuffer)
    const image = await loadImage(iconPngBuffer)
    bandIconCache[bandId] = image
    return image
}


