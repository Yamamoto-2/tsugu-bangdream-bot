/**
 * Skill domain type
 * Migrated from backend_old/src/types/Skill.ts
 * Pure data structure - reads from mainAPI but no HTTP calls or rendering
 * Note: This assumes mainAPI is provided externally (via BestdoriClient in the future)
 */

// Note: mainAPI dependency will be removed in future refactoring
// For now, we keep the structure compatible with old code
export interface SkillData {
    simpleDescription: Array<string | null>;
    description: Array<string | null>;
    duration: Array<number>;
    activationEffect?: {
        activateEffectTypes: {
            [key: string]: {
                activateEffectValue: Array<number | null>;
                activateCondition?: string;
            }
        };
        unificationActivateEffectValue?: number;
    };
    onceEffect?: {
        onceEffectType: string;
        onceEffectValue: Array<number>;
    };
}

export class Skill {
    skillId: number;
    isExist: boolean = false;
    data!: SkillData;
    simpleDescription!: Array<string | null>;
    description!: Array<string | null>;
    duration!: Array<number>;
    effectTypes!: Array<string>;
    scoreUpMaxValue!: number;

    constructor(skillId: number, skillData?: SkillData) {
        this.skillId = skillId
        if (!skillData) {
            // For backward compatibility, but ideally should be provided via constructor
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.data = skillData;
        this.simpleDescription = skillData.simpleDescription;
        this.description = skillData.description;
        this.duration = skillData.duration;
        this.effectTypes = this.getEffectTypes();
        this.scoreUpMaxValue = this.getScoreUpMaxValue();
    }

    getData(): SkillData {
        return this.data;
    }

    getEffectTypes(): Array<string> {
        const skillTypeList = [
            'judge', 'life', 'damage', 'score', 'score_perfect', 'score_continued_note_judge', 'score_over_life', 'score_under_great_half'
        ]

        var tempTypeList: Array<string> = []
        if (this.isExist == false) {
            return ['score']
        }
        if (this.data.activationEffect != undefined) {
            for (var i in this.data.activationEffect.activateEffectTypes) {
                if (i == 'score') {
                    tempTypeList.push(i)
                    if (this.data.activationEffect.activateEffectTypes['score']?.activateCondition == 'perfect') {
                        tempTypeList.push('score_perfect')
                    }
                }
                else if (i.includes('score')) {
                    tempTypeList.push('score')
                    tempTypeList.push(i)
                }
                else {
                    tempTypeList.push(i)
                }
            }
        }
        if (this.data.onceEffect != undefined) {
            tempTypeList.push(this.data.onceEffect.onceEffectType)
        }
        tempTypeList = Array.from(new Set(tempTypeList))
        tempTypeList.sort((a, b) => {
            return skillTypeList.indexOf(a) - skillTypeList.indexOf(b)
        })
        return tempTypeList
    }

    getSkillDescription(): Array<string | null> {
        if (this.isExist == false) {
            return [null, null, null, null, null]
        }

        var durationList: string = "";
        this.duration.forEach((value: number, index: number) => {
            durationList += value.toString();
            if (index !== this.duration.length - 1) {
                durationList += '/';
            }
        });

        var tempDescription = this.description
        if (this.data.onceEffect != undefined) {
            var onceEffectValueList: string = " ";
            this.data.onceEffect.onceEffectValue.forEach((value: number, index: number) => {
                onceEffectValueList += value.toString();
                if (index !== this.data.onceEffect!.onceEffectValue.length - 1) {
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

            if (this.data.activationEffect != undefined) {
                tempDescription = tempDescription.map((value) => {
                    if (value == null) {
                        return null
                    }
                    return value.replace(/\{1\}/g, durationList)
                })
            }
        }
        else if (this.data.activationEffect != undefined) {
            tempDescription = tempDescription.map((value) => {
                if (value == null) {
                    return null
                }
                return value.replace(/\{0\}/g, durationList)
            })
        }

        return tempDescription;
    }

    getScoreUpMaxValue(): number {
        if (this.isExist == false) {
            return 0
        }
        if (this.data.activationEffect != undefined) {
            var numbers: Array<number> = []
            if (this.data.activationEffect.unificationActivateEffectValue != undefined) {
                numbers.push(this.data.activationEffect.unificationActivateEffectValue)
            }
            for (var i in this.data.activationEffect.activateEffectTypes) {
                this.data.activationEffect.activateEffectTypes[i].activateEffectValue.forEach(element => {
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

