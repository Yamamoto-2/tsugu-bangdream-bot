import { loadImage, Image } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'

const attributeColor = {
    'happy': '#ff6600',
    'cool': '#4057e3',
    'pure': '#44c527',
    'powerful': '#ff345a'
}

export class Attribute {
    name: 'cool' | 'happy' | 'pure' | 'powerful'
    color: string
    constructor(name:string) {
        this.name = name
        this.color = attributeColor[name]
    }
    async getIcon(): Promise<Image> {
        const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/${this.name}.svg`)
        return (await loadImage(iconBuffer))
    }
}