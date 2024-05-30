import { Server } from '../types/Server'
import { getReplyFromBackend } from "../api/getReplyFromBackend"
import { Config } from '../config';


export async function commandEventStage(config: Config, mainServer: Server, eventId?: number, meta: boolean = false,): Promise<Array<Buffer | string>> {
    return await getReplyFromBackend(`${config.backendUrl}/eventStage`, {
        mainServer,
        compress: config.compress,
        meta,
        eventId
    })
}