import { Server } from '../types/Server';
import {getDataFromBackend} from './utils'

export async function commandGachaSimulate(backendUrl:string,default_server: Server, status: boolean, times: number = 10, gachaId?: number):Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/gachaSimulate`, {
        default_server,
        status,
        times,
        gachaId
    })
}

