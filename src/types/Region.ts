//地区列表，因为有TW而不适用country
export const regionList:Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['jp','en','tw','cn','kr']
export class Region {
    name: 'jp' | 'en' | 'tw' | 'cn' | 'kr'
    regionID: number
    constructor(name?: 'jp' | 'en' | 'tw' | 'cn' | 'kr', regionID?: number) {
        if (name != undefined) {
            this.name = name
            this.regionID = regionList.indexOf(name)
        }
        else if (regionID != undefined) {
            this.regionID = regionID
            this.name = regionList[regionID]
        }
        else {
            this.name = 'jp'
            this.regionID = regionList.indexOf(name)
        }
    }
}