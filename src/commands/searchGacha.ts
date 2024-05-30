import { Server } from '../types/Server'
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandGacha(config: Config, displayedServerList: Server[], gachaId: number): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/searchGacha`, {
        displayedServerList,
        gachaId,
        useEasyBG: config.useEasyBG,
        compress: config.compress
    })
}