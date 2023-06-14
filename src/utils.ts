import * as fs from 'fs'

var readJSON = async function(filepath:string):Promise<object>{//读取json文件子程序，返回json数据  
    var promise:object = new Promise(function (resolve, reject) {
        var rawdata = fs.readFileSync(filepath);
        var rawstring = rawdata.toString();
        var data:object = JSON.parse(rawstring);
        resolve(data);
    })
    return promise
}

var writeJSON = function (filepath:string, data:object) {//写入json文件子程序
    var rawdata = JSON.stringify(data);
    fs.writeFileSync(filepath, rawdata);
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
  

export {readJSON, writeJSON};