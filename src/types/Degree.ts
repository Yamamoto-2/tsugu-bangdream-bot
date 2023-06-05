import { Server } from './Server';
import { callAPIAndCacheResponse } from '../api/getApi';
import { downloadFileCache } from '../api/downloadFileCache'
import { downloadFile } from '../api/downloadFile';
import { Canvas, Image, createCanvas, loadImage } from 'canvas';
import mainAPI from './_Main';

export class Degree {
    degreeId: number;
    isExist = false;
    data: object;
    degreeType: Array<string | null>;
    iconImageName: Array<string | null>;
    baseImageName: Array<string | null>;
    rank: Array<string | null>;
    degreeName: Array<string | null>;
    constructor(degreeId) {
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
    async getDegreeImage(server: Server): Promise<Image> {
        var degreeImage = await downloadFile(`https://bestdori.com/assets/${Server[server]}/thumb/degree_rip/${this.baseImageName[server]}.png`)
        return loadImage(degreeImage)
    }
    async getDegreeFrame(server: Server): Promise<Image | Canvas> {
        var frameName = this.degreeType[server] + "_" + this.rank[server]
        if (frameName == "none_none") {//这个为空底图
            return (createCanvas(1, 1))
        }
        var degreeFrame = await downloadFileCache("https://bestdori.com/assets/" + Server[server] + "/thumb/degree_rip/" + frameName + ".png")
        return loadImage(degreeFrame)
    }
    async getDegreeIcon(server: Server): Promise<Image | Canvas> {
        var iconName = this.iconImageName[server] + "_" + this.rank[server]
        if (iconName == "none_none") {//这个为空底图
            return (createCanvas(1, 1))
        }
        var degreeIcon = await downloadFileCache("https://bestdori.com/assets/" + Server[server] + "/thumb/degree_rip/" + iconName + ".png")
        return loadImage(degreeIcon)
    }
}