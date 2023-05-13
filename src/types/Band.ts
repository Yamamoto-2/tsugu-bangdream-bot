import { callAPIAndCacheResponse } from '../api/getApi';
import { Bestdoriurl } from '../config';
import mainAPI from './_Main';
import { Character } from './Character';

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
}