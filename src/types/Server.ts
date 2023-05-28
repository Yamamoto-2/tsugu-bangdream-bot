import { downloadFileCache } from '../api/downloadFileCache'
import { loadImage, Image } from 'canvas'
import { defaultserver } from '../config'

//服务器列表，因为有TW而不适用country
export const serverList: Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['jp', 'en', 'tw', 'cn', 'kr']
import { serverPriority } from '../config'
const serverNameFullList = {
    jp: '日服',
    en: '国际服',
    tw: '台服',
    cn: '国服',
    kr: '韩服'
}

export class Server {
    serverName: 'jp' | 'en' | 'tw' | 'cn' | 'kr'
    serverId: number
    serverNameFull: string
    constructor(serverName?: 'jp' | 'en' | 'tw' | 'cn' | 'kr', serverId?: number) {
        if (serverName != undefined) {
            this.serverName = serverName
            this.serverId = serverList.indexOf(serverName)
        }
        else if (serverId != undefined) {
            this.serverId = serverId
            this.serverName = serverList[serverId]
        }
        else {
            this.serverName = 'jp'
            this.serverId = serverList.indexOf(serverName)
        }
        this.serverNameFull = serverNameFullList[this.serverName]
    }
    getContentByServer(content: Array<any>): any {
        return content[this.serverId]
    }
    async getIcon(): Promise<Image> {
        const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/${this.serverName}.svg`)
        return (await loadImage(iconBuffer))
    }
}

export function getServerByPriority(content: Array<any>): Server {
    for (var i = 0; i < serverPriority.length; i++) {
        var tempServer = new Server(serverPriority[i])
        if (tempServer.getContentByServer(content) != null) {
            return new Server(serverPriority[i])
        }
    }
    return new Server()
}

export const defaultserverList: Array<Server> = []
for (let i = 0; i < defaultserver.length; i++) {
    defaultserverList.push(new Server(defaultserver[i]))
}


