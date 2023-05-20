import { Skill } from '../../types/Skill'
import { getServerByPriority } from '../../types/Server'
import { drawList, drawDatablock, drawTips } from '../list'
import { Canvas } from 'canvas'
import {Card} from '../../types/Card'

interface SkillInListOptions {
    key?: string;
    card?: Card;
    name?: string;
    content: Skill;
}
async function drawSkillInList({
    key = '技能',
    card,
    name,
    content
}: SkillInListOptions): Promise<Canvas> {
    var list = []
    var server = getServerByPriority(content.description)
    list.push(await server.getIcon())
    if(card!=null){
        if(!card.isInitFull ){
            await card.initFull()
        }
        list.push(server.getContentByServer(card.skillName))

    }
    else{
        list.push(name)
    }
    var listImage = drawList({
        key,
        content: list
    })
    var tipsImage = drawTips({
        text: server.getContentByServer(content.getSkillDescription())
    })
    return drawDatablock([listImage, tipsImage], false)
}

export { drawSkillInList }