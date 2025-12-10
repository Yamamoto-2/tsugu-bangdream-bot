import { Bestdoriurl } from "@/api/config"
const downloader = require("@/api/downloader.js")

function skillPermute(a, k, results) {
    if (k == 5) {
        var obj = { "skillOrder": a }
        results.push(obj)
        return results
    }
    skillPermute(a, k + 1, results)
    for (var i = k + 1, il = 5; i < il; i++) {
        if (a[i].multiplier == a[k].multiplier && a[i].time == a[k].time) continue;
        a = a.slice()
        var tmp = a[i]; a[i] = a[k]; a[k] = tmp;
        skillPermute(a, k + 1, results)
    }
    return results
}

function applySkill(notes, skills, multi, fever) {
    var skill = 0, activated = false, activateTime = 0
    for (i in notes) {
        if (!activated)
            notes[i].score = notes[i].noteBaseScore
        else if (activated && notes[i].time - activateTime < skills[skill].time) {
            notes[i].score = notes[i].noteBaseScore * (skills[skill].multiplier + 1.0)
        }
        else {
            notes[i].score = notes[i].noteBaseScore
            activated = false
            skill++
        }
        if (notes[i].skill) {
            activated = true
            activateTime = notes[i].time
        }
        if (notes[i].fever && fever)
            notes[i].score *= 2
        notes[i].score = Math.floor(notes[i].score)
    }
}

function chartToNotes(chart) {
    var notes = [], bpmNotes = [], feverStart, feverEnd
    function addNote(notes, beat, skill) {
        var simpleNote = { 'beat': beat }
        if (skill) simpleNote.skill = true
        notes.push(simpleNote)
    }
    for (idx in chart) {
        var note = chart[idx]
        if (note.type == 'Single' || note.type == 'Directional') {
            addNote(notes, note.beat, note.skill)
        }
        else if (note.type == 'Long' || note.type == 'Slide') {
            for (midNotesIdx in note.connections) {
                if (note.connections[midNotesIdx].hidden) continue //防止sp谱弯曲状绿条分数计算错误
                addNote(notes, note.connections[midNotesIdx].beat, note.connections[midNotesIdx].skill)
            }
        }
        else if (note.type == 'System') {
            if (note.data == 'cmd_fever_start.wav') feverStart = note.beat
            else if (note.data == 'cmd_fever_end.wav') feverEnd = note.beat
        }
        else if (note.type == 'BPM') {
            bpmNotes.push(note)
        }
    }
    notes.sort((a, b) => { return a.beat - b.beat ? a.beat - b.beat : (a.skill ? -1 : (b.skill ? 1 : 0)) })
    bpmNotes.sort((a, b) => a.beat - b.beat)
    bpmNotes[0].time = 0
    for (var idx = 1; idx < bpmNotes.length; idx++) {
        var pastBeats = bpmNotes[idx].beat - bpmNotes[idx - 1].beat
        bpmNotes[idx].time = bpmNotes[idx - 1].time + pastBeats * 60.0 / bpmNotes[idx - 1].bpm
    }
    for (idx in notes) {
        var note = notes[idx]
        if (bpmNotes.length > 1 && note.beat > bpmNotes[1].beat)
            bpmNotes.shift()
        note.time = (note.beat - bpmNotes[0].beat) * 60.0 / bpmNotes[0].bpm + bpmNotes[0].time
        if (note.beat >= feverStart && note.beat <= feverEnd) {
            note.fever = true
        }
    }
    return notes
}

//skills: array with length of 5, the first is the leader
//        each skill is a object containes score multiplier and time in sec
//        example [{"multiplier": 1.1, "time": 7, "cardID": 100}, ...]
//totalPower should be raw power without rounding
//songID should be int
//difficulty is a number in 0~4, indicating easy, normal, hard, expert, special
async function scoreCalc(totalPower, skills, songID, difficulty, multi = false, fever = false, fes = false) {
    var songInfo = await downloader.getJsonAndSave(`${Bestdoriurl}/api/songs/${songID}.json`,
        "@/api/data/api/songs/", `${songID}.json`, 86400000)
    var level = songInfo.difficulty[difficulty].playLevel
    var noteCount = songInfo.notes[difficulty]
    difficultyName = ['easy', 'normal', 'hard', 'expert', 'special']
    var chart = await downloader.getJsonAndSave(`${Bestdoriurl}/api/charts/${songID}/${difficultyName[difficulty]}.json`,
        "@/api/data/api/songs/notes/", `${songID}.${difficultyName[difficulty]}.json`, 86400000)
    var notes = chartToNotes(chart)
    var baseScore = totalPower * 3 * (1 + (level - 5) * 0.01) / noteCount
    if (fes) baseScore = Math.floor(baseScore)
    //console.log(notes.length)
    //console.log(baseScore)

    var comboBonus = 1.0
    var comboBonusCount = [20, 30, 50, 50, 50, 50, 50, 100, 100, 100, 100]
    for (i in notes) {
        notes[i].noteBaseScore = 1.1 * baseScore * comboBonus
        if (!fes) notes[i].noteBaseScore = Math.floor(notes[i].noteBaseScore)
        if (comboBonusCount.length) {
            comboBonusCount[0]--
            if (comboBonusCount[0] == 0) {
                comboBonusCount.shift()
                comboBonus += 0.01
            }
        }
    }
    var leaderSkill = skills[0]
    skills.sort((a, b) => a.multiplier == b.multiplier ? a.time - b.time : a.multiplier - b.multiplier)
    skills.push(leaderSkill)
    //console.log(skills)
    var results = []
    skillPermute(skills, 0, results)

    for (var i in results) {
        applySkill(notes, results[i].skillOrder, multi, fever)
        results[i].score = notes.reduce((acc, cur) => acc + cur.score, 0)
    }
    results.sort((a, b) => b.score - a.score)
    return results
}

function calcWithSoftCap(score, epSlope, caps) {
    //not need SoftCap anymore
    /*
    for (var r = 0, s = 0; s < caps.length; s++) {
        var i = caps[s];
        if (!(score > i)) {
            r += Math.floor(score / epSlope / (s + 1) * 100);
            break
        }
        score -= i,
            r += Math.floor(i / epSlope / (s + 1) * 100)
    }
    */
    var r = Math.floor(score / epSlope)
    return r
}
function calcEPVS(score, rank) {
    var r = calcWithSoftCap(score, 6500, [21e5, 15e4, 25e4, 1 / 0]);
    return (r + [200, 173, 146, 123, 100][rank])
}
function calcEPFes(score, rank, win) {
    var r = calcWithSoftCap(score, 5500, [2625e3, 187500, 312500, 1 / 0]);
    return (r + [125, 117, 110, 105, 100][rank] + (win ? 50 : 0))
}
function calcEPCL(score, cp) {
    var a = calcWithSoftCap(score, 450, [21e5, 15e4, 25e4, 1 / 0]);
    return (3250 + a) * [1, 2, 4][cp]
}
function calcEPMulti(score, teamScore, eventType) {
    switch (eventType) {
        case 1: //Normal
            base = 50,
                slope = 1e4;
            break;
        case 2: //CP
            base = 70,
                slope = 5e4;
            break;
        case 4: //Live Try
            base = 130,
                slope = 26e3;
            break;
        case 5: //Mission
            base = 120,
                slope = 15e3;
            break
    }
    var ep = base +
        calcWithSoftCap(score, slope, [16e5, 15e4, 25e4, 4e5, 1 / 0]) +
        calcWithSoftCap(teamScore, 10 * slope, [64e5, 6e5, 1e6, 16e5, 1 / 0])
    return ep
}

//totalPower:       self team power
//leaderSkill:      self leader skill e.g. {"multiplier": 1.2, "time": 7, "cardID": 100}
//teamSkill:        one skill that all roommates uses
//teamPower:        average roommate power
//supportTeamPower: only for mission live, support band power
//eventType:        see calcEPMulti
//bonus:            bonus from self team members
//fever:            how much flame used
async function eventPointMulti(totalPower, leaderSkill, teamSkill, teamPower, supportTeamPower,
    songID, difficulty, eventType, bonus, boost, fever) {
    var skills = [leaderSkill]
    for (var i = 0; i < 4; i++) skills.push(teamSkill)
    var selfScores = await scoreCalc(totalPower, skills, songID, difficulty, true, fever)
    var selfScoresAvg = selfScores.reduce((acc, cur) => acc + cur.score, 0) / selfScores.length
    var teamScore = selfScoresAvg * teamPower / totalPower * 4

    var ep = calcEPMulti(selfScoresAvg, teamScore, eventType, boost)
    // console.log(selfScores)
    // console.log(selfScoresAvg)
    // console.log(teamScore)
    // console.log(ep)
    ep = (ep + Math.floor(ep * bonus) + (eventType == 5 ? (Math.floor(supportTeamPower / 3000)) : 0)) * [1, 5, 10, 15][boost]
    //console.log(ep)
    result = {
        "scores": selfScores,
        "rscoresAvg": selfScoresAvg,
        "teamScore": teamScore,
        "ep": ep,
    }

    return result
}

//roomRank: starting from 0, not 1
async function eventPointVS(totalPower, skills, songID, difficulty, roomRank, boost) {
    var selfScores = await scoreCalc(totalPower, skills, songID, difficulty)
    var selfScoresAvg = selfScores.reduce((acc, cur) => acc + cur.score, 0) / selfScores.length
    var ep = calcEPVS(selfScoresAvg, roomRank) * [1, 5, 10, 15][boost]
    // console.log(selfScoresAvg)
    // console.log(ep)
    result = {}
    result.scores = selfScores
    result.scoresAvg = selfScoresAvg
    result.ep = ep
    return result
}

//roomRank: starting from 0, not 1
async function eventPointFes(totalPower, skills, songID, difficulty, roomRank, boost) {
    var selfScores = await scoreCalc(totalPower, skills, songID, difficulty)
    var selfScoresAvg = selfScores.reduce((acc, cur) => acc + cur.score, 0) / selfScores.length
    var ep = calcEPFes(selfScoresAvg, roomRank) * [1, 5, 10, 15][boost]
    // console.log(selfScoresAvg)
    // console.log(ep)
    result = {}
    result.scores = selfScores
    result.scoresAvg = selfScoresAvg
    result.ep = ep
    return result
}

// eventPointMulti(289693, {"multiplier": 1.15, "time": 7}, {"multiplier": 1.2, "time": 7}, 298000, 205330,
//                 306, 3, 5, 2.2, 0, true)


skills = [{ "multiplier": 1.1, "time": 7 },
{ "multiplier": 1, "time": 7 },
{ "multiplier": 0.6, "time": 5 },
{ "multiplier": 0.6, "time": 5 },
{ "multiplier": 0.3, "time": 5 }]

//scoreCalc(403022, skills, 347, 3, false, true, true)

// eventPointVS(411076, skills, 306, 3, 0, 0)


module.exports = {
    scoreCalc, eventPointMulti, eventPointVS, eventPointFes
}
