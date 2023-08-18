import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'


export async function commandCharacter(backendUrl:string,default_servers: Server[], text: string): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/searchCharacter`, {
        default_servers,
        text
    })
}