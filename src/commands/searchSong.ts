import { Server } from "../types/Server"
import {getDataFromBackend} from './utils'


export async function commandSong(backendUrl:string,default_servers:Server[], text: string, compress: boolean): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/searchSong`, {
        default_servers,
        text,
        compress
    })
}