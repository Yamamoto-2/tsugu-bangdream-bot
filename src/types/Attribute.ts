import {loadImage,Image} from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'
export class Attribute {
    name: string
    constructor(name: string) {
        this.name = name
    }
    async getIcon(): Promise<Image>{
        const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/${this.name}.svg`)
        return (await loadImage(iconBuffer))
    }
}