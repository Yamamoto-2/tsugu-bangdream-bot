//服务器列表，因为有TW而不适用country
export const serverList:Array<'jp' | 'en' | 'tw' | 'cn' | 'kr'> = ['jp','en','tw','cn','kr']
export class Server {
    name: 'jp' | 'en' | 'tw' | 'cn' | 'kr'
    serverID: number
    constructor(name?: 'jp' | 'en' | 'tw' | 'cn' | 'kr', serverID?: number) {
        if (name != undefined) {
            this.name = name
            this.serverID = serverList.indexOf(name)
        }
        else if (serverID != undefined) {
            this.serverID = serverID
            this.name = serverList[serverID]
        }
        else {
            this.name = 'jp'
            this.serverID = serverList.indexOf(name)
        }
    }
}