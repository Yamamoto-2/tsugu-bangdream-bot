

export function isInteger(char: string): boolean {
    const regex = /^-?[1-9]\d*$/;
    return regex.test(char);
}
