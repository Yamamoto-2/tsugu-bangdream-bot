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