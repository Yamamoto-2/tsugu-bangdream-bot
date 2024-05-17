import { Skill } from '@/types/Skill'
import { Image, Canvas } from 'skia-canvas'
import { assetsRootPath } from '@/config'
import { drawTextWithImages } from '@/image/text'
import * as path from 'path'
import { loadImageFromPath } from '@/image/utils';


var skillIcon: { [skillType: string]: Image } = {}
async function loadImageOnce() {
    skillIcon.life = await loadImageFromPath(path.join(assetsRootPath, '/Skill/life.png'));
    skillIcon.judge = await loadImageFromPath(path.join(assetsRootPath, '/Skill/judge.png'));
    skillIcon.damage = await loadImageFromPath(path.join(assetsRootPath, '/Skill/damage.png'));
}
loadImageOnce()

//卡牌Icon右下角的技能描述图标
export async function drawCardIconSkill(skill: Skill): Promise<Canvas> {
    var content: Array<Image | string> = []
    var EffectTypes = skill.getEffectTypes()
    var ScoreUpMaxValue = skill.getScoreUpMaxValue()
    //画数字部分
    if (ScoreUpMaxValue != 0) {
        var skillValue = ScoreUpMaxValue.toString()
        if (EffectTypes.includes('score_continued_note_judge')) {
            skillValue += 'G'
        }
        else if (EffectTypes.includes('score_over_life')) {
            if (EffectTypes.includes('score_under_life')) {
                skillValue += 'L'
            }
            else {
                skillValue += '/'
            }
        }
        else if (EffectTypes.includes('score_under_great_half') || EffectTypes.includes('score_perfect')) {
            skillValue += 'P'
        }
        else if (EffectTypes.includes('score_rate_up_with_perfect')) {
            skillValue += '+0.5*P'
        }
        content.push(skillValue)
    }
    //图标部分
    EffectTypes.forEach((EffectType, index) => {
        if (EffectType == 'judge') {
            content.push(skillIcon.judge)
        }
        else if (EffectType == 'life') {
            content.push(skillIcon.life)
        }
        else if (EffectType == 'damage') {
            content.push(skillIcon.damage)
        }
    })
    var stringWithImage = drawTextWithImages({
        content: content,
        maxWidth: 250,
        textSize: 27,
        lineHeight: 30,
        spacing: 3,
        color: '#ffffff',
        font: 'old'
    })
    const textbase = await loadImageFromPath(path.join(assetsRootPath, '/Card/text.png'));
    const canvas = new Canvas(stringWithImage.width + 15, 45)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(textbase, stringWithImage.width + 15 - textbase.width, 0)
    ctx.drawImage(stringWithImage, 5, 0)
    return canvas
}
