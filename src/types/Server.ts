import { downloadFileCache } from '../api/downloadFileCache'
import { loadImage, Image } from 'canvas'
import { defaultserver, serverNameFullList } from '../config'

//服务器列表，因为有TW而不适用country
export const serverList: Array<Server> = [0, 1, 2, 3, 4]
import { serverPriority } from '../config'

export enum Server {
    jp, en, tw, cn, kr
}

export function getServerByName(name: string): Server {
    // 根据服务器名获取对应服务器
    const server: Server = Server[name as keyof typeof Server];
    return server
}

export async function getIcon(server: Server): Promise<Image> {
    const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/${Server[server]}.svg`)
    return (await loadImage(iconBuffer))
}

export function getServerByPriority(content: Array<any>): Server {
    for (let i = 0; i < serverPriority.length; i++) {
        const tempServer = serverPriority[i]
        if (content[tempServer] != null) {
            return tempServer
        }
    }
}

export const defaultserverList: Array<Server> = []