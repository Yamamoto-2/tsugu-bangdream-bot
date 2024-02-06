import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'

export async function commandCard(backendUrl:string,default_servers: Server[], text: string, useEasyBG: boolean, compress: boolean): Promise<Array<string | Buffer>> {
    return await getDataFromBackend(`${backendUrl}/searchCard`, {
        default_servers,
        text,
        useEasyBG,
        compress
    })
}