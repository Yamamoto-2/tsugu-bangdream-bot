import { Server } from "../types/Server"
import { getDataFromBackend } from './utils'

export async function commandSongChart(backendUrl: string, default_servers: Server[], songId: number, compress: boolean, difficultyText: string = 'ex'): Promise<Array<Buffer | string>> {
    return await getDataFromBackend(`${backendUrl}/songChart`, {
        default_servers,
        songId,
        compress,
        difficultyText
    })
}