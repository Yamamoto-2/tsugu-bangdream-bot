import { drawRarityInList } from '@/components/list/rarity'
import { Gacha } from '@/types/Gacha'
import { Server } from '@/types/Server'
import { stackImage } from '@/components/utils'
import { Canvas } from 'skia-canvas'
import { drawList, line, drawListByServerList, drawListMerge } from '@/components/list';

export async function drawGachaRateInList(gacha: Gacha, server: Server): Promise<Canvas> {
    var rates = gacha.rates[server]
    var list = []
    var times = 0
    let key = undefined
    // 如果卡池数据没有提供概率数据，则不返回概率相关数据
    if (rates == null){
        key = "概率分布"
        list.push(
            drawList({
              key,
              text: `未提供概率分布数据`,
            })
        );
    } else {
        for (var i in rates) {
            if (rates[i].rate == 0) {
                continue
            }
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
    }
    return (stackImage(list))
}

