import { callAPIAndCacheResponse } from '../api/getApi';
import { Bestdoriurl } from '../config';
import mainAPI from './_Main';
import { Character } from './Character';

export class Band {
    bandID: number;
    isExit: boolean = false;
    data: object;
    bandName: Array<string | null>;
    members: Array<Character | null>;
    constructor(bandID: number) {
        this.bandID = bandID
        const bandData = mainAPI['bands'][bandID.toString()]
        if (bandData == undefined) {
            this.isExit = false;
            return
        }
        this.isExit = true;
        this.data = bandData
        this.bandName = this.data['bandName']
        this.getMembers()
    }
    getMembers() {
        var members = []
        var characterList = mainAPI['characters']
        for (var characterID in characterList) {
            var character = new Character(parseInt(characterID))
            if (character.bandId == this.bandID) {
                members.push(character)
            }
        }
        this.members = members
    }
}