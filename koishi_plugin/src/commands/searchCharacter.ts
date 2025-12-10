import { Server } from '../types/Server'
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandCharacter(config: Config, displayedServerList: Server[], text: string): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/searchCharacter`, {
        displayedServerList,
        text,
        compress: config.compress
    })
}