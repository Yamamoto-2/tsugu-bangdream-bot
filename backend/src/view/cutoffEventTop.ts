import { Image, Canvas, createCanvas, loadImage } from 'canvas'
import { drawTitle } from "../components/title";
import { serverNameFullList } from "../config";
import { EventTop } from "../types/EventTop";
import { Event } from '../types/Event';
import { Server } from "../types/Server";
import { drawEventDatablock } from '../components/dataBlock/event';
import { drawDatablock } from '../components/dataBlock';
import { outputFinalBuffer } from '../image/output';
import { drawPlayerRankingInList } from '../components/list/playerRanking';
import { drawEventTopChart } from '../components/chart/cutoffChat';


var statusName = {
    'not_start': '未开始',
    'in_progress': '进行中',
    'ended': '已结束'
};

export async function drawCutoffEventTop(eventId:number,server:Server):Promise<Array<Buffer|string>>{
    var eventTop = new EventTop(eventId,server);
    if(!eventTop.isExist){
        return [`错误: ${serverNameFullList[server]} 活动不存在`];
    }
    await eventTop.initFull();
    var all =[];
    all.push(drawTitle('档线',`${serverNameFullList[server]} 10档线`));
    var list:Array<Image | Canvas>=[];
    var event = new Event(eventId);
    all.push(await drawEventDatablock(event));

    //前十名片
    var userInRankings = eventTop.getLatestRanking();
    for(let i =0;i<userInRankings.length;i++){
        var color = i%2==0?'white':'#f1f1f1';
        var user = eventTop.getUserByUid(userInRankings[i].uid);
        var playerRankingImage =await drawPlayerRankingInList(user,color,server);
        if(playerRankingImage!=undefined){
            list.push(playerRankingImage);
        }
    }

    list.push(createCanvas(800, 50))
    
    //折线图
    list.push(await drawEventTopChart(eventTop,false,server))

    var listImage = drawDatablock({list});
    all.push(listImage);
    
    var buffer = await outputFinalBuffer({imageList:all,useEasyBG:true})

    return [buffer];
}