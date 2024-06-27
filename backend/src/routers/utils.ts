import { Server } from "@/types/Server";
import { tsuguUser } from "@/database/userDB";

export function generateVerifyCode(): number {
    let verifyCode: number;
    do {
        verifyCode = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    } while (verifyCode.toString().includes('64') || verifyCode.toString().includes('89'));
    return verifyCode
}

export function isInteger(char: string): boolean {
    const regex = /^(0|[1-9]\d*)$/;
    return regex.test(char);
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
