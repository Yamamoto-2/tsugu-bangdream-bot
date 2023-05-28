import { isInteger } from './utils'
import { drawGachaDetail } from '../view/gachaDetail'

export async function commandGacha(argv: any, text: string) {
    console.log(`text: ${text}`)
    if (!text) {
        return '错误: 请输入卡池ID'
    }
    console.log(argv)
    if (isInteger(text)) {
        return await drawGachaDetail(parseInt(text))
    }
    return '错误: 请输入正确的卡池ID'
}