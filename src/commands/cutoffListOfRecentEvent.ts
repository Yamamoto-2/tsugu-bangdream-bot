import { Server, getServerByName } from '../types/Server';
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandCutoffListOfRecentEvent(config: Config, mainServer: Server, tier: number, eventId: number): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/cutoffListOfRecentEvent`, {
        mainServer,
        tier,
        eventId,
        compress: config.compress
    })
}