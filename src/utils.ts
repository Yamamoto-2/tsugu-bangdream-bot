import { tierListOfServer } from './config'
import { h, Element } from 'koishi'

// 将messageList转换为Array<Element | string>  用于session.send
export function paresMessageList(list?: Array<Buffer | string>): Array<Element | string> {
    if (!list) {
        return []
    }
    let messageList = []
    for (let i = 0; i < list.length; i++) {
        parseMessage(list[i])
    }
    function parseMessage(message: Buffer | string) {
        if (typeof message == 'string') {
            messageList.push(message)
        }
        else if (message instanceof Buffer) {
            messageList.push(h.image(message, 'image/png'))
        }
    }
    return messageList
}

//将tierListOfServer转换为文字，server:tier,tier,tier
export function tierListOfServerToString(): string {
    let tierListString = ''
    for (var i in tierListOfServer) {
        tierListString += i + ' : '
        for (var j in tierListOfServer[i]) {
            tierListString += tierListOfServer[i][j] + ', '
        }
        tierListString += '\n'
    }
    return tierListString
}

//判断左侧5个或者6个是否为数字
export function checkLeftDigits(str: string): number {
    const regexSixDigits = /^(\d{6})/;
    const regexFiveDigits = /^(\d{5})/;

    const sixDigitsMatch = str.match(regexSixDigits);
    if (sixDigitsMatch) {
        return parseInt(sixDigitsMatch[1]);
    }

    const fiveDigitsMatch = str.match(regexFiveDigits);
    if (fiveDigitsMatch) {
        return parseInt(fiveDigitsMatch[1]);
    }

    return 0;
}