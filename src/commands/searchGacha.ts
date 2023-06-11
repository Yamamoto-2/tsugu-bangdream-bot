import { isInteger } from './utils'
import { drawGachaDetail } from '../view/gachaDetail'
import { Session } from 'koishi'

export async function commandGacha(session: Session<'tsugu', never>, gachaId: number,useEasyBG: boolean) {
    if (!gachaId) {
        return '错误: 请输入卡池ID'
    }
    if (typeof gachaId == 'number') {
        return await drawGachaDetail(gachaId, session.user.tsugu.default_server,useEasyBG)
    }
    return '错误: 请输入正确的卡池ID'
}