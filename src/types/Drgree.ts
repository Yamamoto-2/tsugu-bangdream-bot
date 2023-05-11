import { callAPIAndCacheResponse } from '../api/getApi';
import mainAPI from './_Main';

export class Degree {
    degreeId:number;
    isExist = false;
    data:object;
    degreeType: Array<string | null>;
    iconImageName: Array<string | null>;
    baseImageName: Array<string | null>;
    rank: Array<string | null>;
    degreeName: Array<string | null>;
    constructor(degreeId){
        this.degreeId = degreeId
        const degreeData = mainAPI['degrees'][degreeId.toString()]
        if (degreeData == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.data = 
        this.degreeType = degreeData['degreeType'];
        this.iconImageName = degreeData['iconImageName'];
        this.baseImageName = degreeData['baseImageName'];
        this.rank = degreeData['rank'];
        this.degreeName = degreeData['degreeName'];
    }
}