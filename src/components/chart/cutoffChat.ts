import { Cutoff } from "../../types/Cutoff";
import { drawTimeLineChart, colorList } from "../chart";

export async function drawCutoffChart(cutoff: Cutoff) {
    var datasets = []
    var time = new Date().getTime()
    datasets.push({
        label: '目前分数线',
        data: cutoff.getChartData(),
        borderWidth: 5,
        borderColor: [`${colorList[0]} 1)`],
        backgroundColor: [`${colorList[0]} 0.2)`],
        pointBackgroundColor: `${colorList[0]} 1)`,
        pointBorderColor: `${colorList[0]} 1)`,
        fill: true
    })

    if (time < cutoff.endAt) {
        if (cutoff.predictEP != null && cutoff.predictEP != 0) {
            
            datasets.push({
                label: "预测线",
                borderColor: [`${colorList[0]} 1)`],
                backgroundColor: [`${colorList[0]} 1)`],
                data: [{ x: cutoff.startAt, y: cutoff.predictEP }, { x: cutoff.endAt, y: cutoff.predictEP }],
                borderWidth: 5,
                borderDash: [20, 10],
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0,
            })
            

        }
        
        datasets.push({
            label: "当前时间",
            borderColor: [`${colorList[0]} 1)`],
            backgroundColor: [`${colorList[0]} 1)`],
            data: [{ x: time, y: 0 }],
            fill: false,
            pointRadius: 10,
            pointHoverRadius: 15,
            showLine: false
        })
        
    }


    var data = {
        datasets: datasets
    }
    var chart = await drawTimeLineChart(data, cutoff.startAt, cutoff.endAt)
    return chart
}