import { Server } from '../types/Server'
import {getDataFromBackend} from './utils'


export async function commandGacha(backendUrl:string,default_servers:Server[], gachaId: number,useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/searchGacha`, {
        default_servers,
        gachaId,
        useEasyBG,
        compress
    })
}