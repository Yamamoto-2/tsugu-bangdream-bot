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