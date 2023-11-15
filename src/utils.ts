import { tierListOfServer } from './config'

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