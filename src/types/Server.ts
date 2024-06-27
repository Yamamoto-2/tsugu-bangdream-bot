import { globalDefaultServer, serverNameFullList } from '../config'

//服务器列表，因为有TW而不适用country
export const serverList: Array<Server> = [0, 1, 2, 3, 4]
import { globalServerPriority } from '../config'

export enum Server {
    jp, en, tw, cn, kr
}

export function getServerByName(name: string): Server {
    // 根据服务器名获取对应服务器
    let server: Server
    server = Server[name as keyof typeof Server];
    if (server == undefined) {
        for (let i = 0; i < serverNameFullList.length; i++) {
            if (name == serverNameFullList[i]) {
                server = i
                break;
            }
        }
    }
    return server
}

export function getServerByPriority(content: Array<any>, displayedServerList: Server[] = globalDefaultServer) {
    const serverPriority: Server[] = [...new Set([...displayedServerList, ...globalServerPriority])];
    for (let i = 0; i < serverPriority.length; i++) {
        const tempServer = serverPriority[i];
        if (content[tempServer] != null) {
            return tempServer;
        }
    }
    return undefined;
}

export function isServer(server: any): boolean {
    if (typeof server == 'number') {
        server = Server[server]
    }
    else{
        return false
    }
    return Object.keys(Server).includes(server)
}

export function isServerList(serverList: Array<any>): boolean {
    let result = true
    for (let i = 0; i < serverList.length; i++) {
        const element = serverList[i];
        if (!isServer(element)) {
            result = false
            break
        }
    }
    return result
}
