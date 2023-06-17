//将string[]转变为number[]
export function stringToNumberArray(stringArray: Array<string | null>): number[] {
    let numberArray: number[] = []
    for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i] == null) {
            numberArray.push(null)
        }
        else{
            numberArray.push(Number(stringArray[i]))
        }
    }
    return numberArray
}

export function formatNumber(num: number, length: number): string {
    // 将数字转换为字符串
    const str = num.toString();

    // 如果字符串长度小于3，前面补0直到长度为3
    if (str.length < length) {
        return str.padStart(length, '0');
    }

    return str;
}