import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'


export async function commandGacha(backendUrl:string,default_server:Server[], gachaId: number,useEasyBG: boolean): Promise<Array<Buffer | string>> {
    if (!gachaId) {
        return ['错误: 请输入卡池ID']
    }
    return await getDataFromBackend(`${backendUrl}/searchGacha`, {
        default_server,
        gachaId,
        useEasyBG
    })
}