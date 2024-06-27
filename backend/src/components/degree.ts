import { globalDefaultServer } from "@/config"
import { Degree } from "@/types/Degree"
import { Server, getServerByPriority } from "@/types/Server"
import { Canvas } from 'skia-canvas'

export async function drawDegree(degree: Degree, server: Server, displayedServerList: Server[] = globalDefaultServer): Promise<Canvas> {
    // 如果服务器没有这个牌子，换一个有这个牌子的服务器
    if (degree.degreeName[server] == null) {
        server = getServerByPriority(degree.degreeName, displayedServerList)
    }
    var canvas = new Canvas(230, 50)
    var ctx = canvas.getContext("2d")

    var degreeImage = await degree.getDegreeImage(server) //底图
    ctx.drawImage(degreeImage, 0, 0)

    // 画其他部分,normal类型不需要画
    if (degree.degreeType[server] != "normal" && degree.degreeType[server] != null && degree.degreeId > 12) {
        //画框
        if (degree.rank[server] && degree.rank[server] != 'none') {
            var frame = await degree.getDegreeFrame(server)
            ctx.drawImage(frame, 0, 0)
        }
        //画icon
        if (degree.degreeType[server] != "try_clear") {
            // 如果不是EX牌活动 EX牌活动没有icon在左边
            var icon = await degree.getDegreeIcon(server)
            ctx.drawImage(icon, 0, 0)
        }
    }
    return canvas
}
