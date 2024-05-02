import { Server } from '../types/Server'
import { getDataFromBackend } from './utils'


export async function commandEventStage(backendUrl: string, server: Server, compress: boolean, meta: boolean = false, eventId?: number): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/eventStage`, {
        server,
        compress,
        meta,
        eventId
    })
}