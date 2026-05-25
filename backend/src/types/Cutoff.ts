import { callAPIAndCacheResponse } from '@/api/getApi';
import mainAPI from '@/types/_Main';
import { Bestdoriurl, HHWX_Url, USE_HHWX_SOURCE_PREFER, reportDataSourceProblem, clearDataSourceProblem,tierListOfServer } from '@/config';
import { Server } from '@/types/Server';
import { Event, getPresentEvent } from '@/types/Event';
import { predict } from '@/api/cutoff.cjs'
import { logger } from '@/logger';
import { normalizeTimestamp, getDateByServerTimezone, getServerUtcOffset, GetProbablyTimeDifference } from '@/components/list/time';

export class Cutoff {
    eventId: number;
    server: Server;
    tier: number;
    isExist = false;
    cutoffs: { time: number, ep: number }[];
    eventType: string;
    latestCutoff: { time: number, ep: number };
    rate: number | null;
    predictEP: number;
    startAt: number;
    endAt: number;
    status: 'not_start' | 'in_progress' | 'ended';
    isInitfull: boolean = false;
    useHHWX = USE_HHWX_SOURCE_PREFER;
    dailyIncrement = [];
    currentGetDataTime
    constructor(eventId: number, server: Server, tier: number) {
        const event = new Event(eventId)
        //如果活动不存在，直接返回
        if (!event.isExist) {
            this.isExist = false;
            return
        }
        this.eventType = event.eventType
        this.eventId = eventId
        this.server = server
        //如果该档线不在该服的档线列表中，直接返回
        if (!tierListOfServer[Server[server]].includes(tier)) {
            this.isExist = false;
            return
        }
        this.tier = tier
        this.isExist = true;
        // this.startAt = event.startAt[server]
        // this.endAt = event.endAt[server]
        // 当该活动在服务器上尚未存在时，使用预测的时间去推断startAt以及endAt，以解决部分情况下卡死及档线状态不对的问题
        this.startAt = event.startAt[server] || server!=Server.cn?event.startAt[server]:GetProbablyTimeDifference(this.eventId,getPresentEvent(this.server))
        this.endAt = event.endAt[server] || server!=Server.cn?event.endAt[server]:GetProbablyTimeDifference(this.eventId,getPresentEvent(this.server)) + (event.endAt[Server.jp] - event.startAt[Server.jp])
        const tempEvent = new Event(this.eventId)
        this.currentGetDataTime = new Date().getTime()
        //状态
        var time = new Date().getTime()
        if (time < tempEvent.startAt[this.server]) {
            this.status = 'not_start'
        }
        else if (time > tempEvent.endAt[this.server]) {
            this.status = 'ended'
        }
        else {
            this.status = 'in_progress'
        }
    }
    getFinalApiUrl (reverse:boolean){   // reverse:是否反向获取。假如useHHWX为False，当反向开启后就使用HHWX
        if (this.server != Server.cn){  // 非国服不使用HHWX
            this.useHHWX = false
            return Bestdoriurl
        }
        var url =  !reverse?(this.useHHWX?HHWX_Url:Bestdoriurl):(this.useHHWX?Bestdoriurl:HHWX_Url)
        if (reverse && this.server == Server.cn) this.useHHWX = !this.useHHWX
        return url
    }
    async getFinalCutoffsData (forceReadCache:boolean = false ){
        if (!forceReadCache){
            try{    // 当数据源获取出现网络问题时切换到另一数据源获取数据
                return await callAPIAndCacheResponse(`${this.getFinalApiUrl(false)}/api/tracker/data?server=${<number>this.server}&event=${this.eventId}&tier=${this.tier}`,0,3)
            }
            catch (e){
                if (e.response.status != 404 && this.server ==  Server.cn)reportDataSourceProblem()
                try{
                    return await callAPIAndCacheResponse(`${this.getFinalApiUrl(true)}/api/tracker/data?server=${<number>this.server}&event=${this.eventId}&tier=${this.tier}`,0,3)
                }
                catch{
                    return null
                }
            }
        }else{
            try{
                return await callAPIAndCacheResponse(`${this.getFinalApiUrl(false)}/api/tracker/data?server=${<number>this.server}&event=${this.eventId}&tier=${this.tier}`,1/0,3)
            }
            catch(e){
                if (e.response.status != 404 && this.server ==  Server.cn)reportDataSourceProblem()
                try{
                    return await callAPIAndCacheResponse(`${this.getFinalApiUrl(true)}/api/tracker/data?server=${<number>this.server}&event=${this.eventId}&tier=${this.tier}`,1/0,3)
                }
                catch{
                    return null;
                }
            }
        }
    }
    async initFull() {
        if (this.isInitfull) {
            return
        }
        if (this.isExist == false) {
            return
        }
        let cutoffData
        //如果cutoff的活动已经结束，则使用缓存
        const time = new Date().getTime()
        if (time < this.endAt + 1000 * 60 * 60 * 24 * 2) {
            var oldDataSourceFlags = this.useHHWX
            cutoffData = await this.getFinalCutoffsData()
            if (!cutoffData){
                this.isExist = false;
                return
            }
            // var dateNow = Date.now()
            if (this.server == Server.cn &&cutoffData["cutoffs"] && cutoffData["cutoffs"].length!=0 && time - cutoffData["cutoffs"][cutoffData["cutoffs"].length-1].time >= 2700000){   // 对数据进行实时性检查，如果不通过则使用另一个数据源数据.确保服务器时间对齐东八区
                this.useHHWX = !this.useHHWX
                logger('Cutoff.ts/initFull',`数据实时性校验不通过，切换数据源至${this.useHHWX?"HHWX":"Bestdori"} `)
                reportDataSourceProblem()
                var cutoffData2 = await this.getFinalCutoffsData()
                if (cutoffData["cutoffs"][cutoffData["cutoffs"].length-1].time < cutoffData2["cutoffs"][cutoffData2["cutoffs"].length-1].time){ // 对比两个数据源的数据哪个更加实时
                    cutoffData = cutoffData2
                }
            }else if(this.server == Server.cn && cutoffData["cutoffs"] && cutoffData["cutoffs"].length!=0 && oldDataSourceFlags == this.useHHWX){ // 正在进行的活动，数据源数据无问题，清空计数器.
                clearDataSourceProblem()
            }
        }
        else {
            var useCache = true
            cutoffData = await this.getFinalCutoffsData(useCache)
            // 检查缓存是否合法
            if (cutoffData["cutoffs"] && (cutoffData["cutoffs"].length==0|| (cutoffData["cutoffs"].length!=0 && this.endAt - cutoffData["cutoffs"][cutoffData["cutoffs"].length-1].time >410000) )){
                cutoffData = await this.getFinalCutoffsData()
            } //如果最后一个记录的时间减去endAt，校验如果差距太大就要更新
        }
        if (cutoffData == undefined) {
            this.isExist = false;
            return
        }
        else if (cutoffData['result'] == false) {
            this.isExist = false;
            return
        }
        this.isExist = true;
        this.cutoffs = cutoffData['cutoffs'] as { time: number, ep: number }[]
        if (this.cutoffs.length == 0) {
            const event = new Event(this.eventId)
            this.latestCutoff = { time: event.startAt[this.server], ep: 0 }
            return
        }
        else {
            this.latestCutoff = this.cutoffs[this.cutoffs.length - 1]
        }
        //rate
        let rateDataList = mainAPI['rates'] as [{ server: number, type: string, tier: number, rate: number }]
        let rateData = rateDataList.find((element) => {
            return element.server == this.server && element.type == this.eventType && element.tier == this.tier
        }
        )
        if (rateData == undefined) {
            this.rate = null
        }
        else {
            this.rate = rateData.rate
        }
        try{
            this.getDailyIncrement()
        }
        catch{

        }
        if (this.status == 'in_progress') {
            this.predict()
        }
        this.isInitfull = true
    }
    predict(): number {
        if (this.isExist == false) {
            return
        }
        const event = new Event(this.eventId)
        let start_ts = Math.floor(event.startAt[this.server] / 1000)
        let end_ts = Math.floor(event.endAt[this.server] / 1000)
        let cutoff_ts: { time: number, ep: number }[] = []
        for (let i = 0; i < this.cutoffs.length; i++) {
            const element = this.cutoffs[i];
            cutoff_ts.push({ time: Math.floor(element.time / 1000), ep: element.ep })
        }
        try {
            var result = predict(cutoff_ts, start_ts, end_ts, this.rate)
        } catch (e) {
            console.log(e)
            this.predictEP = 0
            return this.predictEP
        }
        this.predictEP = Math.floor(result.ep)
        return this.predictEP
    }
    getPredictionHistory(): { time: number, ep: number }[] {
        if (this.isExist == false || !this.cutoffs) {
            return []
        }
        const event = new Event(this.eventId)
        const start_ts = Math.floor(event.startAt[this.server] / 1000)
        const end_ts = Math.floor(event.endAt[this.server] / 1000)
        const cutoff_ts: { time: number, ep: number }[] = []
        for (let i = 0; i < this.cutoffs.length; i++) {
            const element = this.cutoffs[i]
            cutoff_ts.push({ time: Math.floor(element.time / 1000), ep: element.ep })
        }
        const history: { time: number, ep: number }[] = []
        for (let i = 0; i < cutoff_ts.length; i++) {
            let result
            try {
                result = predict(cutoff_ts.slice(0, i + 1), start_ts, end_ts, this.rate)
            } catch (e) {
                continue
            }
            if (result && result.ep && !isNaN(result.ep) && result.ep !== 0) {
                history.push({ time: this.cutoffs[i].time, ep: Math.floor(result.ep) })
            }
        }
        return history
    }
    getDaysOfEvent(ts: number) {
        if (!this.startAt) return 0
        const offsetMs = getServerUtcOffset(this.server) * 60 * 60 * 1000
        const eventStartAtTime = normalizeTimestamp(this.startAt)
        const timestamp = normalizeTimestamp(ts)

        const serverStartTime = eventStartAtTime + offsetMs

        const startDate = new Date(serverStartTime)

        const hour = startDate.getUTCHours()
        const minute = startDate.getUTCMinutes()
        const second = startDate.getUTCSeconds()
        const millisecond = startDate.getUTCMilliseconds()

        let firstDayEndServerTime =
            serverStartTime +
            ((86400000 + 4 * 60 * 60 * 1000)
                - hour * 60 * 60 * 1000
                - minute * 60 * 1000
                - second * 1000
                - millisecond)

        const firstDayEndTime = firstDayEndServerTime - offsetMs

        if (timestamp < firstDayEndTime) {
            return 0
        } else {
            return Math.ceil((timestamp - firstDayEndTime) / 86400000)
        }
    }
    getDailyIncrement(){
        let score:number[] = []
        let time:number[] = []
        if (!this.cutoffs || this.cutoffs.length === 0){
            return
        }
        for (const c of this.cutoffs) {
            const timestamp = normalizeTimestamp(c.time)
            const date = getDateByServerTimezone(timestamp, this.server)
            if ((this.server == Server.cn || this.server == Server.tw || this.server == Server.jp) && date.getUTCHours() === 3 && date.getUTCMinutes() === 45) {
                score.push(c.ep)
                time.push(timestamp)
            }
        }
        let dailyIncrement = []
        let dailyIncrementInvaildDays:number[]  = []
        let scoreFinal:number[] = []
        var j = 0   // 临时天数存放
        var cutoffLastDataDays = this.getDaysOfEvent(this.cutoffs[this.cutoffs.length-1].time)   // 最后一个数据的天数
        // 头处理
        if (score.length == 0){
            for (var i = 0;i<=this.getDaysOfEvent(this.cutoffs[this.cutoffs.length-1].time);i++){
                if (this.getDaysOfEvent(this.cutoffs[this.cutoffs.length-1].time) == 0){
                    scoreFinal.push(this.cutoffs[this.cutoffs.length-1].ep)
                    break
                }
                let avgIncrementValue = Math.round(((this.cutoffs[this.cutoffs.length-1].ep)/(this.getDaysOfEvent(this.cutoffs[this.cutoffs.length-1].time))))    // 计算丢失的天数的平均增量
                scoreFinal.push(Math.round(avgIncrementValue * (i+1)))  // 把丢失的天数的数据补全
                dailyIncrementInvaildDays.push(scoreFinal.length-1)  // 记录增量数据不完整的天数位置
                j++ // 增加一天
            }
        }
        
        for (var i = 0;i<score.length;i++){
            if (score.length == 0) break
            if (this.getDaysOfEvent(time[i]) == j){ // 如果当天相对于活动而言天数是i，说明数据完整
                if (this.getDaysOfEvent(time[i]) == 0){ // 如果是第0天，且有数据，说明第一天虽然不满24小时，但有数据了，就直接把第一天增量设为当天的ep
                    scoreFinal.push(score[i])
                    j++
                }
                else{       // 如果是第i天，且有数据，说明当天数据完整，直接用当天的ep减去前一天的ep就是当天的增量
                    scoreFinal.push(score[i])
                    j++
                }
            }else{  // i跟相对于getDaysOfEvent的结果不一致，说明当天数据不完整，进行插值计算
                // 当i = 0时，就说明要从0开始而不是score[i-1]开始插值
                if (this.getDaysOfEvent(time[i]) > j){  // 如果这个数据是大于标记天数的，则说明需要进行插值计算
                    let lostDays = this.getDaysOfEvent(time[i]) - j +1
                    let avgIncrementValue = Math.round((i==0?(score[i] - 0):(score[i] - score[i-1]))/lostDays)    // 计算丢失的天数的平均增量
                    for (var ld = 0;ld<lostDays;ld++){
                        scoreFinal.push(Math.round(i==0?0+ avgIncrementValue * (ld+1):score[i-1] + avgIncrementValue * (ld+1)))  // 把丢失的天数的数据补全
                        dailyIncrementInvaildDays.push(scoreFinal.length-1)  // 记录增量数据不完整的天数位置
                        j++ // 增加一天
                    }
                }
            }
        }
        // 尾处理 。当尾巴 this.getDaysOfEvent(time[time.length-1])不为1的时候，就说明尾是有多项数据缺失
        if (score.length != 0){
            for(var i = 0;i<cutoffLastDataDays - this.getDaysOfEvent(time[time.length-1]);i++){   // 如果tracker最后一个数据日期跟score最后一个数据的日期有差异，说名是尾巴，要处理
                if (score.length == 0) break
                let avgIncrementValue = Math.round(((this.cutoffs[this.cutoffs.length-1].ep - score[score.length-1]))/(cutoffLastDataDays - this.getDaysOfEvent(time[time.length-1])))    // 计算丢失的天数的平均增量
                scoreFinal.push(Math.round(score[score.length-1] + avgIncrementValue * (i+1)))  // 把丢失的天数的数据补全
                if(cutoffLastDataDays - this.getDaysOfEvent(time[time.length-1]) > 1)dailyIncrementInvaildDays.push(scoreFinal.length-1)
                j++ // 因该是没什么用的了，还是加一下吧
            }
        }
        for (var i = 0;i<scoreFinal.length;i++){   // 计算增量
            if (i == 0){
                dailyIncrement.push(`${Math.round(scoreFinal[i]/10000)}${dailyIncrementInvaildDays.includes(i) ? '!' : ''}`) 
            }
            else{
                dailyIncrement.push(`${Math.round((scoreFinal[i] - scoreFinal[i-1])/10000)}${dailyIncrementInvaildDays.includes(i) ? '!' : ''}` )
            }
        }
        this.dailyIncrement = dailyIncrement
    }
    getYesterdayIncrementRate(){
        if (!this.cutoffs || this.cutoffs.length === 0){
            return '无数据'
        }
        let lastCutoffTime = this.cutoffs[this.cutoffs.length-1].time
        // HHWX数据源会在快要结活的时候改为每15分钟抓取一次，因此需要主动规避
        let usePrevPoint = false
        let UTCMin =  getDateByServerTimezone(lastCutoffTime, this.server).getUTCMinutes()
        let UTCHour = getDateByServerTimezone(lastCutoffTime,this.server).getUTCHours()
        let lengthLimit =2
        if (UTCMin < 3 || (UTCMin >= 25 && UTCMin <= 35)){
            lastCutoffTime = this.cutoffs[this.cutoffs.length-2].time
            usePrevPoint = true
        }
        if (UTCMin == 45 && UTCHour == 3) lengthLimit++
        let curEventDays = this.getDaysOfEvent(lastCutoffTime)
        let lastCutoffEp = this.cutoffs[this.cutoffs.length-(usePrevPoint?2:1)].ep
        //console.log(curEventDays)
        let score:number[] = []
        let time:number[] = []
        let scoreCur:number[] = []
        let timeCur:number[] = []
        const dateNow = getDateByServerTimezone(lastCutoffTime, this.server)
        const lastestUtcHour = dateNow.getUTCHours()
        const lastestUtcMinutes = dateNow.getUTCMinutes()

        for (const c of this.cutoffs) {
            let allowPushFlag = false
            const timestamp = normalizeTimestamp(c.time)
            const d = this.getDaysOfEvent(timestamp)
            if (d < (curEventDays-2)){
                continue
            }
            if (d > (curEventDays-2) ){
                allowPushFlag = true
            }
            const date = getDateByServerTimezone(timestamp, this.server)
            if ((this.server == Server.cn || this.server == Server.tw || this.server == Server.jp) && date.getUTCHours() === 3 && date.getUTCMinutes() === 45) {
                score.push(c.ep)
                time.push(timestamp)
            }
            if (allowPushFlag && (this.server == Server.cn || this.server == Server.tw || this.server == Server.jp) && date.getUTCHours() === lastestUtcHour && date.getUTCMinutes() === lastestUtcMinutes) {
                scoreCur.push(c.ep)
                timeCur.push(timestamp)
            }
        }
        if (score.length !=lengthLimit || scoreCur.length!=2) return '数据缺失' 
        // 此时score里边应该会有两个数据，一个是昨日3:45，一个是今日3:45的数据
        let TodaysIncrement = (lastCutoffEp - score[1])
        let YesterdaysIncrement = ( scoreCur[0] - score[0] )
        let rate:number = YesterdaysIncrement!=0?TodaysIncrement / YesterdaysIncrement:1
        let result =  `昨天同时刻日增${Math.round((YesterdaysIncrement)/10000)} 现在是昨天的${Math.round(rate * 100)}%${rate*100>=100?'↑':'↓'}`
        //console.log(result)
        return result
    }
    getChartData(setStartToZero = false): { x: Date, y: number }[] {
        if (this.isExist == false) {
            return [];
        }
        let chartData: { x: Date, y: number }[] = [];
        if (setStartToZero) {
            chartData.push({ x: new Date(0), y: 0 });
        } else {
            chartData.push({ x: new Date(this.startAt), y: 0 });
        }

        // 在访问 this.cutoffs[0].time 之前检查 this.cutoffs 是否存在且长度大于0
        let tempTime = this.cutoffs && this.cutoffs.length > 0 ? this.cutoffs[0].time : null;
        // 如果 tempTime 为 null，则后续逻辑应当考虑这种情况以避免错误

        for (let i = 0; i < this.cutoffs.length; i++) {
            const element = this.cutoffs[i];
            if (setStartToZero) {
                // 确保 tempTime 不为 null 才执行减法操作
                chartData.push({ x: tempTime ? new Date(element.time - this.startAt) : new Date(0), y: element.ep });
            } else {
                chartData.push({ x: new Date(element.time), y: element.ep });
            }
            tempTime = element.time;
        }
        return chartData;
    }

}