import { Attribute } from '@/types/Attribute'
import { drawList } from '@/components/list'
import { Canvas, Image } from 'skia-canvas'

interface AttributeInListOptions {
    key?: string;
    content: Array<Attribute>
    text?: string
}
export async function drawAttributeInList({
    key,
    content,
    text
}: AttributeInListOptions): Promise<Canvas> {
    var list: Array<string | Image | Canvas> = []
    if (content.length == 1 && text == undefined) {
        list.push(await content[0].getIcon())
        list.push(content[0].name.toUpperCase())
        var canvas = drawList({
            key: key,
            content: list
        })
        return canvas
    }
    else {
        list.push(await content[0].getIcon())
        list.push(text)
        var canvas = drawList({
            key: key,
            content: list,
            spacing: 0
        })
        return canvas
    }

}
