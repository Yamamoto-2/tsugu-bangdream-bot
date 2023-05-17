import mainAPI from './_Main';
import { Character } from './Character';
import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache';

export class Band {
    bandId: number;
    isExist: boolean = false;
    data: object;
    bandName: Array<string | null>;
    members: Array<Character | null>;
    constructor(bandId: number) {
        this.bandId = bandId
        const bandData = mainAPI['bands'][bandId.toString()]
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
    async getIcon(): Promise<Image>{
        const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/band_${this.bandId}.svg`)
        return (await loadImage(iconBuffer))
    }
    async getLogo(): Promise<Image>{
        const logoBuffer = await downloadFileCache(`https://bestdori.com/assets/cn/band/logo/0${this.bandId}_rip/logoL.png`)
        return (await loadImage(logoBuffer))
    }
}