import mainAPI from '@/types/_Main'

export class Skill {
    skillId: number;
    isExist: boolean = false;
    data: object;
    simpleDescription: Array<string | null>;
    description: Array<string | null>;
    duration: Array<number>;
    effectTypes: Array<string>;
    //'judge'|'score'|'damage'|'score_continued_note_judge'|'score_over_life'|'score_under_great_half'|'score'
    scoreUpMaxValue: number;

    constructor(skillId: number) {
        this.skillId = skillId
        if (mainAPI["skills"][this.skillId.toString()] == undefined) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.skillId = this.skillId;
        this.data = mainAPI["skills"][this.skillId.toString()]
        this.simpleDescription = this.data['simpleDescription']
        this.description = this.data['description']
        this.duration = this.data['duration']
        this.effectTypes = this.getEffectTypes()
        this.scoreUpMaxValue = this.getScoreUpMaxValue()
    }
    getData() {
        return this.data
    }
    getEffectTypes(): Array<string> {//返回技能类型，如果存在多个效果，优先级为skillTypeList中排列的顺序
        const skillTypeList = [
            'judge', 'life', 'damage', 'score', 'score_perfect', 'score_continued_note_judge', 'score_over_life', 'score_under_great_half'
        ]

        var tempTypeList: Array<string> = []
        if (this.isExist == false) {
            return ['score']
        }
        if (this.data['activationEffect'] != undefined) {
            for (var i in this.data['activationEffect']['activateEffectTypes']) {
                if (i == 'score') {
                    tempTypeList.push(i)
                    if (this.data['activationEffect']['activateEffectTypes']['score']['activateCondition'] == 'perfect') {
                        tempTypeList.push('score_perfect')
                    }
                }
                else if (i.includes('score')) {//如果包含score，都算作分卡(可能不严谨)
                    tempTypeList.push('score')
                    tempTypeList.push(i)
                }
                else {
                    tempTypeList.push(i)
                }
            }
        }
        if (this.data['onceEffect'] != undefined) {
            tempTypeList.push(this.data['onceEffect']['onceEffectType'])
        }
        //去除tempTypeList重复
        tempTypeList = Array.from(new Set(tempTypeList))
        tempTypeList.sort((a, b) => {
            return skillTypeList.indexOf(a) - skillTypeList.indexOf(b)
        })
        return tempTypeList
    }
    getSkillDescription(): Array<string> {//返回完整技能描述，不同等级效果用'/'分割
        if (this.isExist == false) {
            return [null, null, null, null, null]
        }

        //生成持续时间列表(例如'3/4/5/6/7')
        var durationList: string = "";
        this.duration.forEach((value: number, index: number) => {
            durationList += value.toString();
            if (index !== this.duration.length - 1) {
                durationList += '/';
            }
        });

        var tempDescription = this.description
        if (this.data['onceEffect'] != undefined) {//如果包含onceEffect(比如恢复)
            //生成回复数值列表(例如' 3/4/5/6/7 ')
            var onceEffectValueList: string = " ";
            this.data['onceEffect']['onceEffectValue'].forEach((value: number, index: number) => {
                onceEffectValueList += value.toString();
                if (index !== this.data['onceEffect']['onceEffectValue'].length - 1) {
                    onceEffectValueList += '/';
                }
            });
            onceEffectValueList += " ";

            tempDescription = tempDescription.map((value) => {
                if (value == null) {
                    return null
                }
                return value.replace(/\{0\}/g, onceEffectValueList)
            })

            if (this.data['activationEffect'] != undefined) {//如果同时包含持续时间的效果(比如加分)
                tempDescription = tempDescription.map((value) => {
                    if (value == null) {
                        return null
                    }
                    return value.replace(/\{1\}/g, durationList)
                })
            }
        }
        else if (this.data['activationEffect'] != undefined) {//如果包含持续时间效果
            tempDescription = tempDescription.map((value) => {
                if (value == null) {
                    return null
                }
                return value.replace(/\{0\}/g, durationList)
            })
        }

        return tempDescription;
    }
    getScoreUpMaxValue(): number {//返回最高加分数值
        if (this.isExist == false) {
            return 0
        }
        if (this.data['activationEffect'] != undefined) {
            var numbers: Array<number> = []
            if (this.data['activationEffect']['unificationActivateEffectValue'] != undefined) {
                numbers.push(this.data['activationEffect']['unificationActivateEffectValue'])
            }
            for (var i in this.data['activationEffect']['activateEffectTypes']) {
                this.data['activationEffect']['activateEffectTypes'][i]['activateEffectValue'].forEach(element => {
                    if (element != null) {
                        numbers.push(element)
                    }
                });

            }
            return Math.max(...numbers)
        }
        else {
            return 0
        }
    }



}
