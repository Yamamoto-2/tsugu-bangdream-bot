import { Server } from '../types/Server';
import {getDataFromBackend} from './utils'

export async function commandGachaSimulate(backendUrl:string,server_mode: Server, status: boolean, times: number = 10, gachaId?: number):Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/gachaSimulate`, {
        server_mode,
        status,
        times,
        gachaId
    })
}

