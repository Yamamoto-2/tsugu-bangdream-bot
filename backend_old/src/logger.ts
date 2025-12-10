export function logger(type: string, message: any) {
    const requestTime = Date.now();
    // hh:mm:ss
    const timeString = new Date(requestTime).toString().split(' ')[4];
    console.log(`[${timeString}] [${type}] ${message}`);
}