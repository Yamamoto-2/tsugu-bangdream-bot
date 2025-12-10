import { drawRarityInList } from '@/components/list/rarity'
import { Gacha } from '@/types/Gacha'
import { Server } from '@/types/Server'
import { stackImage } from '@/components/utils'
import { Canvas } from 'skia-canvas'

export async function drawGachaRateInList(gacha: Gacha, server: Server): Promise<Canvas> {
    var rates = gacha.rates[server]
    var list = []
    var times = 0
    for (var i in rates) {
        if (rates[i].rate == 0) {
            continue
        }
        let key = undefined
        if (times == 0) {
            key = '概率分布'
        }
        list.push(await drawRarityInList({
            key,
            rarity: parseInt(i),
            trainingStatus: false,
            text: ` ${rates[i].rate.toString()}%`
        }))
        times++
    }
    return (stackImage(list))
}

