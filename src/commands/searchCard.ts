import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'

export async function commandCard(backendUrl:string,default_servers: Server[], text: string, useEasyBG: boolean): Promise<Array<string | Buffer>> {
    if (!text) {
        return ['错误: 请输入关键词或卡片ID']
    }
    return await getDataFromBackend(`${backendUrl}/searchCard`, {
        default_servers,
        text,
        useEasyBG
    })
}