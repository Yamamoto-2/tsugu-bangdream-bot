
import { Server, getServerByName } from "../types/Server"
import { getReplyFromBackend } from "../api/getReplyFromBackend"

import { Config } from '../config';

export async function commandCutoffCompare(config: Config, mainServer: Server, eventId: number): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/cutoffCompare`, {
        mainServer,
        eventId,
        compress: config.compress
    })
}