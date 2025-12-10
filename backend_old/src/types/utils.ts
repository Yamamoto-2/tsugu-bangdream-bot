import * as XLSX from 'xlsx';
import * as fs from 'fs';

export async function readJSON(filepath: string): Promise<object> {//读取json文件子程序，返回json数据  
    var promise: object = new Promise(function (resolve, reject) {
        var rawdata = fs.readFileSync(filepath);
        var rawstring = rawdata.toString();
        var data: object = JSON.parse(rawstring);
        resolve(data);
    })
    return promise
}
export async function readJSONFromBuffer(buffer: Buffer): Promise<object> {//读取json文件子程序，返回json数据
    var rawstring = buffer.toString();
    var data: object = JSON.parse(rawstring);
    return data;
}

export async function writeJSON(filepath: string, data: object) {//写入json文件子程序
    var rawdata = JSON.stringify(data);
    fs.writeFileSync(filepath, rawdata);
}

export async function readExcelFile(filePath: string): Promise<any[]> {
    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);

    // 获取工作表的名字
    const sheetName = workbook.SheetNames[0];

    // 获取工作表
    const worksheet = workbook.Sheets[sheetName];

    // 将工作表转换为JSON
    const json = XLSX.utils.sheet_to_json(worksheet);

    return json;
}

//将string[]转变为number[]
export function stringToNumberArray(stringArray: Array<string | null>): number[] {
    let numberArray: number[] = []
    for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i] == null) {
            numberArray.push(null)
        }
        else {
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

//栈函数
export class Stack<T> {
    stack: T[];
    private maxLength: number;

    constructor(maxLength: number) {
        this.stack = [];
        this.maxLength = maxLength;
    }

    push(item: T): void {
        this.stack.unshift(item); // 将新元素插入到堆栈的最前面

        if (this.stack.length > this.maxLength) {
            this.stack.pop(); // 如果堆栈长度超过指定的最大长度，自动弹出最后一个元素
        }
    }

    pop(): T | undefined {
        return this.stack.shift(); // 弹出并返回最前面的元素
    }

    isEmpty(): boolean {
        return this.stack.length === 0;
    }

    size(): number {
        return this.stack.length;
    }

    clear(): void {
        this.stack = [];
    }
}