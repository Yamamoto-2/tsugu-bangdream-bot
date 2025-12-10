import { Server } from '../types/Server'
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandCard(config: Config, displayedServerList: Server[], text: string): Promise<Array<string | Buffer>> {
    return await getReplyFromBackend(`${config.backendUrl}/searchCard`, {
        displayedServerList,
        text,
        useEasyBG: config.useEasyBG,
        compress: config.compress
    })
}