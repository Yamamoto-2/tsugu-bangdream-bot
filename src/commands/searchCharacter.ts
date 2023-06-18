import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'


export async function commandCharacter(backendUrl:string,default_servers: Server[], text: string): Promise<Array<Buffer | string>> {
    if (!text) {
        return ['错误: 请输入关键词或角色ID']
    }
    return await getDataFromBackend(`${backendUrl}/searchCharacter`, {
        default_servers,
        text
    })
}