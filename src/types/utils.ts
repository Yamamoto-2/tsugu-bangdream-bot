//将string[]转变为number[]
export function stringToNumberArray(stringArray: string[]): number[] {
    let numberArray: number[] = []
    for (let i = 0; i < stringArray.length; i++) {
        numberArray.push(Number(stringArray[i]))
    }
    return numberArray
}