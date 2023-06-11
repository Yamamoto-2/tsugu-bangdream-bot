import { isInteger } from './utils'
import { drawGachaDetail } from '../view/gachaDetail'
import { Session } from 'koishi'

export async function commandGacha(session: Session<'tsugu', never>, text: string,useEasyBG: boolean) {
    if (!text) {
        return '错误: 请输入卡池ID'
    }
    if (isInteger(text)) {
        return await drawGachaDetail(parseInt(text), session.user.tsugu.default_server,useEasyBG)
    }
    return '错误: 请输入正确的卡池ID'
}