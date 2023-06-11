import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { assetsRootPath } from '../config';
import { registerFont, loadImage } from 'canvas';
import 'chartjs-adapter-moment';
registerFont(assetsRootPath + "/Fonts/default.ttf", { family: "default" })
registerFont(assetsRootPath + "/Fonts/old.ttf", { family: "old" })
var width = 800
var height = 800
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width, height, chartCallback: (ChartJS) => {
        ChartJS.defaults.font.family = 'old';
    }
});

const colorList = ['rgba(254, 65, 111,', 'rgba(179, 49, 255,', 'rgba(64, 87, 227,', "rgba(68, 197, 39,", "rgba(0, 132, 255,", "rgba(255, 255, 81,"]
function randomRGB() {
    return Math.floor(Math.random() * 255).toString()
}
export function getColor(i: number) {
    let tempColor: string
    if (colorList[i] == undefined) {
        tempColor = `rgba(${randomRGB()}, ${randomRGB()}, ${randomRGB()},`
    }
    else {
        tempColor = colorList[i]
    }
    return tempColor
}

interface drawTimeLineChartOptions {
    start: Date,
    end: Date,
    setStartToZero?: boolean,
    data: object,
}

export async function drawTimeLineChart({
    start,
    end,
    setStartToZero = false,
    data
}:drawTimeLineChartOptions) {
    /*
    for (var i = 0; i < data['datasets'].length; i++) {
        console.log(data['datasets'][i]['data'])
    }
    */
    var options = {
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 20,
                    },
                },
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                },
                min: start,
                max: end,
                display: !setStartToZero
            },
            y: {
                min: 0
            }
        }
    }
    const configuration = {
        type: 'line',
        data: data,
        options: options
    }
    try{
        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        return await loadImage(image);
    }
    catch(e){
        console.log(e)
        return loadImage(assetsRootPath+'/err.png')
    }
}