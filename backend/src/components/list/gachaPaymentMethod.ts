import { drawList } from '@/components/list'
import { Gacha } from '@/types/Gacha'
import { Server } from '@/types/Server'
import { Item } from '@/types/Item'
import { stackImage } from '@/components/utils'

var behaviorName = {
    "normal": "",
    "over_the_3_star_once": "必中★3+",
    "over_the_4_star_once": "必中★4+",
    "once_a_day": "每日一次",
    "fixed_4_star_once": "必中★4",
    'fixed_5_star_once': "必中★5",
}

export async function drawGashaPaymentMethodInList(gacha: Gacha) {
    var list = []
    var patmentMethods = gacha.paymentMethods
    for (let i = 0; i < patmentMethods.length; i++) {
        const patmentMethod = patmentMethods[i];
        var methodDescription = []
        methodDescription.push(`${i + 1}.`)


        //付费方式
        let itemId = ''
        var costItemQuantity = patmentMethod.costItemQuantity
        if (patmentMethod.paymentMethod == 'free_star' || patmentMethod.paymentMethod == 'paid_star') {
            itemId = patmentMethod.paymentMethod
        }
        else if (patmentMethod.ticketId != undefined) {
            itemId = 'gacha_ticket_' + patmentMethod.ticketId
        }
        let item = new Item(itemId)
        if (item.isExist) {
            methodDescription.push(await item.getItemImage())
            if (item.typeName == 'star') {
                methodDescription.push(item.name[Server.cn])
            }
            methodDescription.push(`x${costItemQuantity}`)
        }
        else {
            methodDescription.push(` ? x${costItemQuantity}`)
        }

        //抽卡次数
        if (patmentMethod.count != undefined) {
            methodDescription.push(patmentMethod.count + "次抽卡")
        }

        //更多情况描述
        if (behaviorName[patmentMethod.behavior] != undefined) {
            if (behaviorName[patmentMethod.behavior] != "") {
                methodDescription.push(" " + behaviorName[patmentMethod.behavior])
            }
        }
        else {
            methodDescription.push(patmentMethod.behavior)
        }
        if (patmentMethod["maxSpinLimit"] != undefined) {
            methodDescription.push(" 仅限" + patmentMethod["maxSpinLimit"] + "次")
        }
        var isFirst = (i == 0)
        list.push(drawList({
            key: isFirst ? '付费方式' : undefined,
            content: methodDescription
        }))
    }
    return stackImage(list)
}