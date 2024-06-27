import { Server } from "../types/Server";
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandSearchPlayer(config: Config, playerId: number, mainServer: Server): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/searchPlayer`, {
        mainServer,
        playerId,
        useEasyBG: config.useEasyBG,
        compress: config.compress,
    })
}