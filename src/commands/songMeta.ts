import { Server, getServerByName } from '../types/Server'
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandSongMeta(config: Config, displayedServerList: Server[], mainServer: Server): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/songMeta`, {
        displayedServerList,
        mainServer,
        compress: config.compress
    })
}   
