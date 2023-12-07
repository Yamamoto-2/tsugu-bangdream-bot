import { loadImage, Image } from 'canvas'
import { downloadFileCache } from '@/api/downloadFileCache'
import { Bestdoriurl } from "@/config"

const attributeColor = {
    'happy': '#ff6600',
    'cool': '#4057e3',
    'pure': '#44c527',
    'powerful': '#ff345a'
}

export class Attribute {
    name: 'cool' | 'happy' | 'pure' | 'powerful'
    color: string
    constructor(name: string) {
        if (['cool', 'happy', 'pure', 'powerful'].includes(name as this['name'])) {
            this.name = name as this['name']
            this.color = attributeColor[name as this['name']]
        } else {
            throw new Error('Invalid attribute name.')
        }
    }

    async getIcon(): Promise<Image> {
        const iconBuffer = await downloadFileCache(`${Bestdoriurl}/res/icon/${this.name}.svg`)
        return (await loadImage(iconBuffer))
    }
}