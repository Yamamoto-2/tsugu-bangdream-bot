import { Database } from "koishi"
import { Server, serverList } from "../types/Server"

export interface PlayerBinding {
    id: number,
    user_id: number,
    platform: string,
    server_mode: Server,
    default_server: Server[],
    car: boolean,
    server_list: ServerBindingInfo[]
}
export class ServerBindingInfo {
    status: BindingStatus
    tempID?: number
    account?: string
}
export enum BindingStatus {
    None, Waiting, Success
}

const tsugu_table_name = 'tsugu_player_data'

export async function getPlayerBinding(db: Database, platform: string, userid: number): Promise<Partial<PlayerBinding>> {
    const [result] = await db.get(tsugu_table_name, {
        platform,
        user_id: userid
    })
    // 如果未能找到对应的结果将返回undefined
    return result
}
export async function upsertPlayerBinding(db: Database, binding: Partial<PlayerBinding>, key: string[] = ['user_id', 'platform']): Promise<void> {
    await db.upsert(tsugu_table_name, [binding], key)
}
export async function getOrCreatePlayerBinding(db: Database, userid: number, platform: string, server_mode: Server, default_server: Server[]): Promise<Partial<PlayerBinding>> {
    const [result] = await db.get(tsugu_table_name, {
        platform,
        user_id: userid
    })
    if (result) {
        return result
    }
    else {
        const defaultBindingInfo = []
        for (let i = 0; i < serverList.length; i++) {
            defaultBindingInfo.push({
                status: BindingStatus.None
            })
        }
        const tempBinding = {
            user_id: userid,
            platform,
            server_mode,
            default_server,
            car: true,
            server_list: defaultBindingInfo
        }
        upsertPlayerBinding(db, tempBinding)
        return tempBinding
    }
}