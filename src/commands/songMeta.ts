import { Server, getServerByName } from '../types/Server'
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandSongMeta(config: Config, default_servers: Server[], mainServer: Server): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/songMeta`, {
        default_servers,
        mainServer,
        compress: config.compress
    })
}   
