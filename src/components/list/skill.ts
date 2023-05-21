import { Skill } from '../../types/Skill'
import { getServerByPriority } from '../../types/Server'
import {  drawDatablock, drawTips,drawListByServerList } from '../list'
import { Canvas } from 'canvas'
import {Card} from '../../types/Card'

interface SkillInListOptions {
    card: Card;
    name?: string;
    content: Skill;
}
async function drawSkillInList({
    card,
    name,
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
    return drawDatablock([listImage, tipsImage], false)
}

export { drawSkillInList }