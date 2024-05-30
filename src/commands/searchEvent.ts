import { Server } from '../types/Server'
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';

export async function commandEvent(config: Config, displayedServerList: Server[], text: string): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/searchEvent`, {
        displayedServerList,
        text,
        useEasyBG: config.useEasyBG,
        compress: config.compress
    })

}