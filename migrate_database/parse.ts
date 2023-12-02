import * as fs from 'fs';

// 读取JSON文件
function readJsonFile(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

const data = readJsonFile('koishi.user.json');
const additionalData = readJsonFile('koishi.binding.json');

// 创建一个映射表，方便根据_id查找对应的额外数据
const additionalDataMap = additionalData.reduce((map, item) => {
    map[(item.aid).toString()] = item;
    return map;
}, {});

const transformedData = data.map(item => {
    const extra = additionalDataMap[(item.id).toString()];
    if(!extra) {
        return null;
    }
    return {
        "_id": `${extra.platform}:${extra.pid}`,
        "user_id": extra.pid,
        "platform": extra.platform,
        "server_mode": item.tsugu.server_mode,
        "default_server": item.tsugu.default_server,
        "car": item.tsugu.car,
        "server_list": item.tsugu.server_list.map(server => ({
            "playerId": server.gameID,
            "bindingStatus": server.bindingStatus
        }))
    };
});

fs.writeFileSync('./tsugu-bangdream-bot.users.json', JSON.stringify(transformedData));
