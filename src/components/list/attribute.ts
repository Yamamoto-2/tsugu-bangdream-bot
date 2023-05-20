import { Attribute } from  '../../types/Attribute'
import { drawList } from '../list'
import { Canvas, Image } from 'canvas'

interface AttributeInListOptions {
    key?: string;
    content: Attribute
    present?: number
}
async function drawAttributeInList({
    key,
    content,
    present
}: AttributeInListOptions): Promise<Canvas> {
    var list: Array<string | Image | Canvas> = []
    if (present != undefined) {
        list.push(await content[0].getIcon())
        list.push(`+${present}%`)
        var canvas = drawList({
            key: key ?? '属性加成',
            content: list
        })
        return canvas
    }
    else{
        list.push(await content.getIcon())
        list.push(content.name.toUpperCase())
        var canvas = drawList({
            key: key ?? '属性',
            content: list
        })
        return canvas
    }
}

export {drawAttributeInList}