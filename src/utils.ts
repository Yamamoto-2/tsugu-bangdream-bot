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

export {readJSON, writeJSON};