import { drawList } from '../list'
import { Canvas } from 'canvas'
import { drawDegree } from '../degree'
import { Degree } from '../../types/Degree'
import { Server, defaultserverList, getServerByPriority } from '../../types/Server'
import { Event } from '../../types/Event'
import { stackImage } from '../utils'

interface DegreeListInListOptions {
    key?: string;
    degreeList: Array<Degree>;
    server?: Server;
}

export async function drawDegreeListInList({
    key,
    degreeList,
    server = defaultserverList[0]
}: DegreeListInListOptions): Promise<Canvas> {
    var list: Array<Canvas> = []
    for (let i = 0; i < degreeList.length; i++) {
        const element = degreeList[i];
        var degreeImage = await drawDegree(element, server)
        list.push(degreeImage)
    }
    return drawList({
        key: key,
        content: list,
        textSize:50
    })
}

export async function drawDegreeListOfEvent(event: Event): Promise<Canvas> {
    event.initFull(false)
    var list = []
    var tempDegreeList = []
    var server = getServerByPriority(event.rankingRewards)
    var rewards = server.getContentByServer(event.rankingRewards)
    for (var i = 0; i < rewards.length; i++) {
        if (rewards[i].rewardType == "degree") {
            tempDegreeList.push(new Degree(rewards[i].rewardId))
        }
    }
    list.push(await drawDegreeListInList({
        key: "活动奖励",
        degreeList: tempDegreeList,
        server: server
    }))
    if (event.eventType == "versus" || event.eventType == "challenge" || event.eventType == "medley") {
        var rewards = server.getContentByServer(event.musics)
        for (var i = 0; i < rewards.length; i++) {
            var tempDegreeList = []
            for (var n = 0; n < rewards[i].musicRankingRewards.length; n++) {
                if (rewards[i].musicRankingRewards[n].resourceType == "degree") {
                    tempDegreeList.push(new Degree(rewards[i].musicRankingRewards[n].resourceId))
                }
            }
            list.push(await drawDegreeListInList({
                degreeList: tempDegreeList,
                server: server
            }))
            if (event.eventType == "medley") {
                break
            }
        }

    }
    else if (event.eventType == "live_try") {
        var tempDegreeList = []
        var data = await event.getData()
        var rewards = data["masterLiveTryLevelRewardDifficultyMap"][0]["entries"]["normal"]["entries"]
        for (var j in rewards) {
            if (rewards[j]["resourceType"] == "degree") {
                tempDegreeList.push(new Degree(rewards[j]["resourceId"]))
            }
        }
        list.push(await drawDegreeListInList({
            degreeList: tempDegreeList,
            server: server
        }))
    }
    return (stackImage(list))
}

/*
var drawRankingrewards = async function (eventID) {
    var drawrewardsets = async function (all) {
        var tempcanv = canvas.createCanvas(1000,70*Math.ceil(all.length/3)+20)
        var ctx = tempcanv.getContext("2d")
        for(var i = 0;i<all.length;i++){
            ctx.drawImage(all[i],120+265*(i%3),Math.floor(i/3)*70)
        }
        return(tempcanv)
    }
    var data = await api.getEventdata(eventID)
    var rewards = data["rankingRewards"][0]
    var all = []
    var all1 = []
    for (var i = 0; i < rewards.length; i++) {
        if (rewards[i]["rewardType"] == "degree") {
            all1.push(await image.drawDegrees(rewards[i]["rewardId"], "jp"))
        }
        
    }
    all.push(await drawrewardsets(all1))
    if (data["eventType"] == "versus" || data["eventType"] == "challenge" || data["eventType"] == "medley") {
        var rewards = data["musics"]
        for (var i = 0; i < rewards[0].length; i++) {
            var all1 = []
            for (var n = 0; n < rewards[0][i]["musicRankingRewards"].length;n++) {
                if (rewards[0][i]["musicRankingRewards"][n]["resourceType"] == "degree") {
                    all1.push(await image.drawDegrees(rewards[0][i]["musicRankingRewards"][n]["resourceId"], "jp"))
                }
            }
            all.push(await drawrewardsets(all1))
            if(data["eventType"] == "medley"){
                break
            }
        }
        
    }
    else if (data["eventType"] == "live_try") {
        var all1 = []
        var i
        var rewards = data["masterLiveTryLevelRewardDifficultyMap"][0]["entries"]["normal"]["entries"]
        for (i in rewards) {
            if (rewards[i]["resourceType"] == "degree") {
                all1.push(await image.drawDegrees(rewards[i]["resourceId"], "jp"))
            }
        }
        var rewards = data["masterLiveTryLevelRewardDifficultyMap"][0]["entries"]["extra"]["entries"]
        for (i in rewards) {
            if (rewards[i]["resourceType"] == "degree") {
                all1.push(await image.drawDegrees(rewards[i]["resourceId"], "jp"))
            }
        }
        all.push(await drawrewardsets(all1))
    }
    return(await drawDatablock_T(all))
}
*/