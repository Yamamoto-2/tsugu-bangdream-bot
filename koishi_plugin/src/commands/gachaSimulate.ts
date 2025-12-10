import { Server } from '../types/Server';
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandGachaSimulate(config: Config, mainServer: Server, times: number = 10, gachaId?: number): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/gachaSimulate`, {
        mainServer,
        times,
        compress: config.compress,
        gachaId
    })
}

