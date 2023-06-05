import { Skill } from '../../types/Skill'
import { getServerByPriority } from '../../types/Server'
import { drawTips, drawListByServerList } from '../list'
import { stackImage } from '../utils'
import { Canvas } from 'canvas'
import { Card } from '../../types/Card'

interface SkillInListOptions {
    key?: string;
    card: Card;
    content: Skill;
}
export async function drawSkillInList({
    key,
    card,
    content
}: SkillInListOptions): Promise<Canvas> {
    var listImage = await drawListByServerList({
        key: key,
        content: card.skillName,
    })
    var server = getServerByPriority(content.description)
    var tipsImage = drawTips({
        text: content.getSkillDescription()[server]
    })
    return stackImage([listImage, tipsImage])
}
