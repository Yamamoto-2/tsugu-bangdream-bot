import { downloadFileCache } from '../api/downloadFileCache'
import { loadImage, Image } from 'canvas'

//服务器列表，因为有TW而不适用country
export const serverList: Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['jp', 'en', 'tw', 'cn', 'kr']
export const serverPriority: Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['cn','jp', 'tw',  'en', 'kr']


export class Server {
    serverName: 'jp' | 'en' | 'tw' | 'cn' | 'kr'
    serverId: number
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

