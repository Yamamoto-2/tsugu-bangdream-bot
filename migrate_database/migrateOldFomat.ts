import * as fs from 'fs';

// 读取JSON文件
function readJsonFile(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

const oldData = readJsonFile('tsugu-bangdream-bot.users.json');

const transformedData = oldData.map(item => {
    let userPlayerList: { playerId: any; server: number; }[] = [];
    for (let i = 0; i < item.server_list.length; i++) {
        if (item.server_list[i].gameID != 0 && item.server_list[i].bindingStatus != 0)
            userPlayerList.push({
                "playerId": item.server_list[i].playerId,
                "server": i
            });
    }

    return {
        "_id": `${item.platform}:${item.user_id}`,
        "userId": item.user_id,
        "platform": item.platform,
        "mainServer": item.server_mode,
        "displayedServerList": item.default_server,
        "shareRoomNumber": item.car,
        "userPlayerIndex": 0,
        "userPlayerList": userPlayerList
    };
});

fs.writeFileSync('./tsugu-bangdream-bot.users_1.json', JSON.stringify(transformedData));