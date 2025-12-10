import { Server } from "@/types/Server";
import { Event } from '@/types/Event';
import { callAPIAndCacheResponse } from "@/api/getApi";
import { Bestdoriurl } from "@/config";


export class CutoffEventTop{
    eventId:number;
    server:Server;
    startAt:number;
    endAt:number;
    status: 'not_start' | 'in_progress' | 'ended';
    isInitfull: boolean = false;
    isExist = false;
    points:{
        time:number,
        uid:number,
        value:number
    }[];
    users:{
        uid:number,
        name:string,
        introduction:string,
        rank:number,
        sid:number,
        strained:number,
        degrees:number[]
        ranking:number,
        currentPt:number
    }[];
    constructor(eventId:number,server:Server){
        const event = new Event(eventId)
        if(!event.isExist){
            this.isExist = false;
            return;
        }
        this.eventId = eventId;
        this.server = server;
        this.isExist = true;
        this.startAt = event.startAt[server]
        this.endAt = event.endAt[server]
        var time = new Date().getTime()
        if (time < event.startAt[this.server]) {
            this.status = 'not_start';
        }
        else if (time > event.endAt[this.server]) {
            this.status = 'ended';
        }
        else {
            this.status = 'in_progress';
        }
    }
    async initFull(){
        if (!this.isExist){
            return
        }
        if(this.isInitfull){
            return;
        }
        const topData = await callAPIAndCacheResponse(`${Bestdoriurl}/api/eventtop/data?server=${<number>this.server}&event=${this.eventId}&mid=0&interval=3600000`);
        if(topData == undefined){
            this.isExist = false;
            return;
        }
        this.isExist = true;
        this.points = topData['points'] as {
            time:number,
            uid:number,
            value:number
        }[];
        this.users = topData['users'] as {
            uid:number,
            name:string,
            introduction:string,
            rank:number,
            sid:number,
            strained:number,
            degrees:number[],
            ranking:number,
            currentPt:number
        }[];
        if(this.points.length == 0 || this.users.length == 0){//如果没有数据，返回不存在
            this.isExist = false
            return
        }
        var latestRanking = this.getLatestRanking();
        for(let i =0;i<this.users.length;i++){
            for(let j =0;j<latestRanking.length;j++){
                if(this.users[i].uid==latestRanking[j].uid){
                    this.users[i].ranking = j+1;
                    this.users[i].currentPt = latestRanking[j].point;
                    break;
                }
            }
        }
    }
    getChartData(setStartToZero = false):{[key:number]:{x:Date,y:number}[]}{
        if (this.isExist == false) {
            return;
        }
        var chartDate:{[key:number]:{x:Date,y:number}[]} = {};
        for(let i =0;i<this.points.length;i++){
            const element = this.points[i]
            if(!(element.uid in chartDate)){
                chartDate[element.uid] = [];
                if(setStartToZero){
                    chartDate[element.uid].push({x:new Date(0),y:0});
                    chartDate[element.uid].push({x:new Date(element.time-this.startAt),y:element.value});
                }
                else{
                    chartDate[element.uid].push({x:new Date(this.startAt),y:0});
                    chartDate[element.uid].push({x:new Date(element.time),y:element.value});
                }
            }
            else{
                if(setStartToZero){
                    chartDate[element.uid].push({x:new Date(element.time-this.startAt),y:element.value});
                }
                else{
                    chartDate[element.uid].push({x:new Date(element.time),y:element.value});
                }
            }
        }
        return chartDate;
    }
    getLatestRanking():{uid:number,point:number}[]{
        var result:{uid:number,point:number}[] =[]
        var index = this.points.length -10;
        while(index<this.points.length){
            const element = this.points[index];
            result.push({uid:element.uid,point:element.value});
            index ++;
        }
        result.sort((a,b)=>b.point-a.point)
        return result;
    }
    getUserByUid(id:number):{
        uid:number,
        name:string,
        introduction:string,
        rank:number,
        sid:number,
        strained:number,
        degrees:number[]
        ranking:number,
        currentPt:number
    }{
        for(let i =0;i<this.users.length;i++){
            if(this.users[i].uid==id){
                return this.users[i];
            }
        }
        return;
    }
    getUserNameById(id:number):string{
        for(let i =0;i<this.users.length;i++){
            if(this.users[i].uid==id){
                return this.users[i].name;
            }
        }
        return;
    }
}