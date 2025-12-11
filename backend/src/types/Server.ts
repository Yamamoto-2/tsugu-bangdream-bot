/**
 * Server domain type
 * Migrated from backend_old/src/types/Server.ts
 * Removed: getIcon() method (rendering logic, depends on skia-canvas)
 * 
 * Note: getServerByPriority() still depends on config constants (globalDefaultServer, globalServerPriority)
 * This will be refactored when we split config in step 5
 */

// Server list - TW exists so we can't use country codes
export const serverList: Array<Server> = [0, 1, 2, 3, 4]

export enum Server {
    jp, en, tw, cn, kr
}

export function getServerByServerId(serverId: number): Server {
    // If serverId is string, look up by server name
    if (typeof serverId == 'string') {
        serverId = getServerByName(serverId as any)
    }
    return serverList[serverId]
}

export function getServerByName(name: string): Server {
    let server: Server
    server = Server[name as keyof typeof Server];
    if (server == undefined) {
        // Import from config/constants.ts
        const { serverNameFullList } = require('@/config/constants');
        for (let i = 0; i < serverNameFullList.length; i++) {
            if (name == serverNameFullList[i]) {
                server = i
                break;
            }
        }
    }
    return server
}

/**
 * Get server by priority from content array
 */
export function getServerByPriority(
    content: Array<any>, 
    displayedServerList?: Server[]
): Server | undefined {
    // Import from config/constants.ts
    const { globalDefaultServer, globalServerPriority } = require('@/config/constants');
    
    const defaultDisplayedServerList = displayedServerList || globalDefaultServer;
    const serverPriority: Server[] = [...new Set([...defaultDisplayedServerList, ...globalServerPriority])];
    
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
        const serverName = Server[server]
        return Object.keys(Server).includes(serverName)
    }
    return false
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

