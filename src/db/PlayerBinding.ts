import { Server, serverList } from "../types/Server"

export interface PlayerBinding {
    tsugu_platform: string,
    tsugu_server_mode: Server,
    tsugu_default_server: Server[],
    tsugu_car: boolean,
    tsugu_server_list: string[]
}
