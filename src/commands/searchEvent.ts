import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'


export async function commandEvent(backendUrl:string,default_servers: Server[], text: string, useEasyBG: boolean): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/searchEvent`, {
        default_servers,
        text,
        useEasyBG
    })

}