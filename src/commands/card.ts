import { drawCardDetail } from '../view/cardDetail'
import { Context, Schema, h, Session } from 'koishi'

export async function commandCard(argv: any, text: string) {
    console.log(argv)
    if (Number.isInteger(parseInt(text))) {
        var cardDetailbuffer = await drawCardDetail(parseInt(text))
        return h.image(cardDetailbuffer, 'image/png')
    }
}