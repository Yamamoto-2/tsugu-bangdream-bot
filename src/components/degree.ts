import { Degree } from "../types/Degree"
import { Server, getServerByPriority } from "../types/Server"
import { Canvas, createCanvas, Image } from 'canvas'

export async function drawDegree(degree: Degree, server: Server): Promise<Canvas> {
    //如果服务器没有这个牌子，换一个有这个牌子的服务器
    if (server.getContentByServer(degree.degreeName) == null) {
        server = getServerByPriority(degree.degreeName)
    }
    var canvas = createCanvas(230, 50)
    var ctx = canvas.getContext("2d")

    var degreeImage = await degree.getDegreeImage(server)//底图
    ctx.drawImage(degreeImage, 0, 0)

    // 画其他部分,normal类型不需要画
    if (degree.degreeType[server.serverId] != "normal" && degree.degreeType[server.serverId] != null && degree.degreeId > 12) {
        //画框
        if (degree.rank[server.serverId] && degree.rank[server.serverId] != 'none') {
            var frame = await degree.getDegreeFrame(server)
            ctx.drawImage(frame, 0, 0)
        }
        //画icon
        if (degree.degreeType[server.serverId] != "try_clear") {//如果不是EX牌活动 EX牌活动没有icon在左边
            var icon = await degree.getDegreeIcon(server)
            ctx.drawImage(icon, 0, 0)
        }
    }
    return canvas
}
