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



