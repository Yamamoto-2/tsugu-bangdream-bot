//服务器列表，因为有TW而不适用country
export const serverList:Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['jp','en','tw','cn','kr']
export class Server {
    name: 'jp' | 'en' | 'tw' | 'cn' | 'kr'
    serverId: number
    constructor(name?: 'jp' | 'en' | 'tw' | 'cn' | 'kr', serverId?: number) {
        if (name != undefined) {
            this.name = name
            this.serverId = serverList.indexOf(name)
        }
        else if (serverId != undefined) {
            this.serverId = serverId
            this.name = serverList[serverId]
        }
        else {
            this.name = 'jp'
            this.serverId = serverList.indexOf(name)
        }
    }
}