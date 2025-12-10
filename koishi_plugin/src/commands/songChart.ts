import { Server } from "../types/Server"
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandSongChart(config: Config, displayedServerList: Server[], songId: number, difficultyId?: number): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/songChart`, {
        displayedServerList,
        songId,
        compress: config.compress,
        difficultyId
    })
}