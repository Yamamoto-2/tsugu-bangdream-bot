import { isInteger } from './utils'
import { drawGachaDetail } from '../view/gachaDetail'
import { Server } from '../types/Server'

export async function commandGacha(default_server:Server[], gachaId: number,useEasyBG: boolean): Promise<Array<Buffer | string>> {
    if (!gachaId) {
        return ['错误: 请输入卡池ID']
    }
    if (typeof gachaId == 'number') {
        return await drawGachaDetail(gachaId, default_server,useEasyBG)
    }
    return ['错误: 请输入正确的卡池ID']
}