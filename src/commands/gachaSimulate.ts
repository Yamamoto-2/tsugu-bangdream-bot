import { Server } from '../types/Server';
import { getDataFromBackend } from './utils'

export async function commandGachaSimulate(backendUrl: string, server_mode: Server, times: number = 10, compress: boolean, gachaId?: number): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/gachaSimulate`, {
        server_mode,
        times,
        compress,
        gachaId
    })
}

