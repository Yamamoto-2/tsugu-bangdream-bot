import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'


export async function commandEvent(backendUrl:string,default_servers: Server[], text: string, useEasyBG: boolean): Promise<Array<Buffer | string>> {
    if (!text) {
        return ['错误: 请输入关键词或活动ID']
    }
    return await getDataFromBackend(`${backendUrl}/searchEvent`, {
        default_servers,
        text,
        useEasyBG
    })

}