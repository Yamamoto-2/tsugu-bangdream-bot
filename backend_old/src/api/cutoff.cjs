
var predict= function(cutoff,start_ts,end_ts,rate){
    if (cutoff.length <= 5)
        return {ep:0}
    var data = []
    for(var i = 0;i<cutoff.length;i++){
        if(cutoff[i]["time"] - start_ts < 43200 || end_ts - cutoff[i].time < 86400){
            continue//小于12小时不收集
        }
        var percent = (cutoff[i]["time"]-start_ts)/(end_ts - start_ts)
        data.push({percent:percent,ep:cutoff[i]["ep"]})
    }
    var temp = regression(data)
    var reg = temp["a"]+temp["b"]*(1+rate)
    if (isNaN(reg)){reg = 0}
    var out = {time:cutoff[cutoff.length-1]["time"],ep:reg}
    //console.log(data)
    return(out)
}

var regression = function(data){
    var sumperc = 0, sumep = 0
    for(var i = 0;i<data.length;i++){
        sumperc += data[i]["percent"]
        sumep += data[i]["ep"]
    }
    let avg_percentage = sumperc / data.length
    let avg_pt = sumep / data.length
    var z = 0, w = 0
    for(var i = 0;i<data.length;i++){
        z += (data[i]["percent"] - avg_percentage) * (data[i]["ep"] - avg_pt)
        w += (data[i]["percent"] - avg_percentage) * (data[i]["percent"] - avg_percentage)
    }
    var b = z / w
    var a = avg_pt - b * avg_percentage
    return({
        a:a,
        b:b,
    })

}
module.exports = {predict}
/*
var cutoffs =  [{
    "time":1604984400,"ep":0},
{
    "time":1604997360,"ep":85647},
{
    "time":1605013860,"ep":159997},
{
    "time":1605015060,"ep":167838},
{
    "time":1605022380,"ep":200378},
{
    "time":1605070140,"ep":287999},
{
    "time":1605086100,"ep":342960},
{
    "time":1605106500,"ep":420660},
{
    "time":1605112200,"ep":443109},
{
    "time":1605149880,"ep":480347},
{
    "time":1605155460,"ep":498615},
{
    "time":1605180840,"ep":564771},
{
    "time":1605187560,"ep":581445},
{
    "time":1605193800,"ep":622054},
{
    "time":1605231780,"ep":664718},
{
    "time":1605243840,"ep":695625},
{
    "time":1605254880,"ep":764258},
{
    "time":1605286800,"ep":929219},
{
    "time":1605323100,"ep":980785},
{
    "time":1605336600,"ep":1053117}
]
var rate = 0.6924049325684304
var start_ts = 1604984400
var end_ts = 1605452340
console.log(predict(cutoffs,start_ts,end_ts,rate))
*/