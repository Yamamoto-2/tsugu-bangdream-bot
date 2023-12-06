import { Server } from "@/types/Server";
import { tsuguUser } from "@/config";

export function generateVerifyCode(): number {
    let verifyCode: number;
    do {
        verifyCode = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    } while (verifyCode.toString().includes('64') || verifyCode.toString().includes('89'));
    return verifyCode
}

export function isInteger(char: string): boolean {
    const regex = /^-?[1-9]\d*$/;
    return regex.test(char);
}

export function isServer(server: any): boolean {
    if (typeof server == 'number') {
        server = server.toString()
    }
    return Object.keys(Server).includes(server)
}

export function isServerList(default_servers: Array<any>): boolean {
    let result = true
    for (let i = 0; i < default_servers.length; i++) {
        const element = default_servers[i];
        if (!isServer(element)) {
            result = false
            break
        }
    }
    return result
}

function imageBufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
}

export function listToBase64(list: Array<Buffer | string>): Array<{ type: 'string' | 'base64', string: string }> {
    if (!list) {
        return []
    }
    const result: Array<{ type: 'string' | 'base64', string: string }> = []

    for (let i = 0; i < list.length; i++) {
        parseMessage(list[i])
    }
    function parseMessage(message: Buffer | string) {
        if (typeof message == 'string') {
            result.push({
                type: 'string',
                string: message
            })
        }
        else if (message instanceof Buffer) {
            result.push({
                type: 'base64',
                string: imageBufferToBase64(message)
            })
        }
    }

    return result
}

export function isTsuguUser(obj: any): obj is tsuguUser {
    // 检查 obj 是否符合 TsuguUser 接口的定义
    return (
        obj &&
        typeof obj.user_id === 'string' &&
        typeof obj.platform === 'string' &&
        typeof obj.server_mode === 'object' &&
        Array.isArray(obj.default_server) &&
        typeof obj.car === 'boolean' &&
        Array.isArray(obj.server_list) &&
        obj.server_list.every(
            (item: any) =>
                typeof item.playerId === 'number' &&
                typeof item.bindingStatus === 'object' &&
                (typeof item.verifyCode === 'number' || item.verifyCode === undefined)
        )
    );
}