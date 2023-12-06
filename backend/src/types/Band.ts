import mainAPI from '@/types/_Main';
import { Character } from '@/types/Character';
import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '@/api/downloadFileCache';
import { formatNumber } from '@/types/utils';

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
        if(mainAPI['bands'][bandId.toString()] != undefined){
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
    async getIcon(): Promise<Image>{
        const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/band_${this.bandId}.svg`)
        return (await loadImage(iconBuffer))
    }
    async getLogo(): Promise<Image>{
        const logoBuffer = await downloadFileCache(`https://bestdori.com/assets/jp/band/logo/${formatNumber(this.bandId,3)}_rip/logoL.png`)
        return (await loadImage(logoBuffer))
    }
}
