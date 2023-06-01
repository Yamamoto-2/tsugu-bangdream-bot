import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { assetsRootPath } from '../config';
import { registerFont, loadImage } from 'canvas';
registerFont(assetsRootPath + "/Fonts/default.ttf", { family: "default" })
registerFont(assetsRootPath + "/Fonts/old.ttf", { family: "old" })
var width = 800
var height = 600
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width, height, chartCallback: (ChartJS) => {
        ChartJS.defaults.font.family = 'old';
    }
});
export const colorList = ['rgba(254, 65, 111,', 'rgba(179, 49, 255,', 'rgba(64, 87, 227,', "rgba(68, 197, 39,", "rgba(0, 132, 255,", "rgba(255, 255, 81,"]
export async function drawTimeLineChart(data: object, start: Date, end: Date) {
    for(var i = 0; i < data['datasets'].length; i++){
        console.log(data['datasets'][i]['data'])
    }
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
        x: {
            type: 'time',
            time:{
                unit: 'day'
            },
            min: start,
            max: end,
        }

    }
    const configuration = {
            type: 'line',
            data: data,
            options: options
        }
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        return await loadImage(image);
    }