import { Skill } from '../../types/Skill'
import { getServerByPriority } from '../../types/Server'
import {  drawDatablock, drawTips,drawListByServerList } from '../list'
import { Canvas } from 'canvas'
import {Card} from '../../types/Card'

interface SkillInListOptions {
    card: Card;
    content: Skill;
}
async function drawSkillInList({
    card,
    content
}: SkillInListOptions): Promise<Canvas> {
    var listImage = await drawListByServerList({
        key: '技能',
        content: card.skillName,
    })
    var server = getServerByPriority(content.description)
    var tipsImage = drawTips({
        text: server.getContentByServer(content.getSkillDescription())
    })
    return drawDatablock({list:[listImage, tipsImage], BG:false})
}

export { drawSkillInList }