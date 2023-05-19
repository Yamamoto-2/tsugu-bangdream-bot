import {downloadFileCache} from '../api/downloadFileCache'
import {loadImage,Image} from 'canvas'

//服务器列表，因为有TW而不适用country
export const serverList: Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['jp', 'en', 'tw', 'cn', 'kr']
export const serverPriority: Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['jp', 'tw', 'cn', 'en', 'kr']


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
        if (content[this.serverId] != null) {
            return content[this.serverId]
        }
        else {
            for (var i = 0; i < serverPriority.length; i++) {
                if (content[serverList.indexOf(serverPriority[i])] != null) {
                    return content[serverList.indexOf(serverPriority[i])]
                }
            }
            return content[0]
        }
    }
    async getIcon(): Promise<Image>{
        const iconBuffer = await downloadFileCache(`https://bestdori.com/res/icon/${this.serverName}.svg`)
        return (await loadImage(iconBuffer))
    }
}