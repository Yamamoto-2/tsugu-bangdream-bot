import { Cutoff } from "../../types/Cutoff";
import { drawTimeLineChart, getColor } from "../chart";


export async function drawCutoffChart(cutoffList: Cutoff[],setStartToZero = false) {
    //setStartToZero:是否将开始时间设置为0
    var datasets = []
    var time = new Date().getTime()
    for (let i = 0; i < cutoffList.length; i++) {
        const cutoff = cutoffList[i];
        const tempColor = getColor(i)
        datasets.push({
            label: `T${cutoff.tier}`,
            data: cutoff.getChartData(setStartToZero),
            borderWidth: 5,
            borderColor: [`${tempColor} 1)`],
            backgroundColor: [`${tempColor} 0.2)`],
            pointBackgroundColor: `${tempColor} 1)`,
            pointBorderColor: `${tempColor} 1)`,
            fill: true
        })
    
        if (time < cutoff.endAt) {
            if (cutoff.predictEP != null && cutoff.predictEP != 0) {
                let data = []
                if(setStartToZero){
                    data = [{ x: new Date(0), y: cutoff.predictEP }, { x: new Date(cutoff.endAt - cutoff.startAt), y: cutoff.predictEP }]
                }
                else{
                    data = [{ x: new Date(cutoff.startAt), y: cutoff.predictEP }, { x: new Date(cutoff.endAt), y: cutoff.predictEP }]
                }
                datasets.push({
                    label: `T${cutoff.tier} 预测线`,
                    borderColor: [`${tempColor} 1)`],
                    backgroundColor: [`${tempColor} 1)`],
                    data: data,
                    borderWidth: 5,
                    borderDash: [20, 10],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                })
    
    
            }
    
        }
    }
    if(!setStartToZero){
        if (time < cutoffList[0].endAt) {
            datasets.push({
                label: "当前时间",
                borderColor: [`${getColor(0)} 1)`],
                backgroundColor: [`${getColor(0)} 1)`],
                data: [{ x: new Date(time), y: 0 }],
                fill: false,
                pointRadius: 10,
                pointHoverRadius: 15,
                showLine: false
            })
        }
    }

    var data = {
        datasets: datasets
    }
    if(setStartToZero){
        let longestTime = 0
        for (let i = 0; i < cutoffList.length; i++) {
            const cutoff = cutoffList[i];
            if(cutoff.endAt - cutoff.startAt > longestTime){
                longestTime = cutoff.endAt - cutoff.startAt
            }
        }
        return await drawTimeLineChart(data, new Date(0), new Date(longestTime),setStartToZero)
    }
    else{
        return await drawTimeLineChart(data, new Date(cutoffList[0].startAt), new Date(cutoffList[0].endAt),setStartToZero)

    }
 
}