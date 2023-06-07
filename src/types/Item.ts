import { Image, loadImage } from 'canvas'
import { downloadFileCache } from '../api/downloadFileCache'
import { Server, getServerByPriority } from './Server';

import mainAPI from './_Main'
import { globalDefaultServer } from '../config';

const typeNameList = {
    'item_': 'material',
    'live_boost_recovery_item_': 'boostdrink',
    'practice_ticket_': 'practiceTicket',
    'skill_practice': 'skillticket',
    'gacha_ticket_': 'gachaTicket',
    'miracle_ticket_': 'miracleTicket',
}

export class Item {
    name: Array<string | null>;
    resourceId: number;
    itemId: string;
    type: string;
    typeName: string;
    isExist = false
    constructor(itemId: string) {
        //如果是星石
        if (itemId == 'paid_star' || itemId == 'free_star') {
            if (itemId == 'paid_star') {
                this.name = ['有料スター', 'paid star', 'paid star', '付费星石', 'paid star']
            }
            else {
                this.name = ['無料スター', 'free star', 'free star', '免费星石', 'free star']
            }
            this.resourceId = 0
            this.type = 'star'
            this.isExist = true
            this.typeName = 'star'
            return
        }
        //如果是其他物品
        var itemData = mainAPI['items'][itemId]
        if (itemData == undefined) {
            return
        }
        this.isExist = true
        this.itemId = itemId
        this.name = itemData['name']
        this.resourceId = itemData['resourceId']
        for (var i in typeNameList) {
            if (this.itemId.startsWith(i)) {
                this.typeName = typeNameList[i]
                break
            }
        }
    }
    async getItemImage(server?: Server, defaultServerList: Server[] = globalDefaultServer): Promise<Image> {
        if (!defaultServerList) defaultServerList = globalDefaultServer
        if (server == undefined) {
            server = getServerByPriority(this.name, defaultServerList)
        }
        server = getServerByPriority(this.name, defaultServerList)
        if (this.typeName == 'material') {
            var itemImage = await downloadFileCache(`https://bestdori.com/assets/${Server[server]}/thumb/material_rip/${this.typeName}${formatNumber(this.resourceId, 3)}.png`)
        }
        else if (this.typeName == 'star') {
            var itemImage = await downloadFileCache(`https://bestdori.com/assets/${Server[server]}/thumb/common_rip/star.png`)
        }
        else {
            var itemImage = await downloadFileCache(`https://bestdori.com/assets/${Server[server]}/thumb/common_rip/${this.typeName}${this.resourceId}.png`)
        }
        return await loadImage(itemImage)
    }
}

function formatNumber(num: number, length: number): string {
    // 将数字转换为字符串
    const str = num.toString();

    // 如果字符串长度小于3，前面补0直到长度为3
    if (str.length < length) {
        return str.padStart(length, '0');
    }

    return str;
}