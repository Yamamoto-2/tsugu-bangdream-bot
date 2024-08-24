import { Server } from "../types/Server"
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandSongRandom(config: Config, mainServer: Server, text: string): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/songRandom`, {
        mainServer,
        text,
        compress: config.compress
    })
}