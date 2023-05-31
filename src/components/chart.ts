import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { assetsRootPath } from '../config';
import { registerFont, loadImage } from 'canvas';
registerFont(assetsRootPath + "/Fonts/default.ttf", { family: "default" })
registerFont(assetsRootPath + "/Fonts/old.ttf", { family: "old" })
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: 800,
    height: 600,
    chartCallback: (ChartJS) => {
        ChartJS.defaults.global.defaultFontFamily = "old";
    }
});


export async function drawCutoffChart(data: object, start: number, end: number) {

    var options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: (value) => value
                }
            }],
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'day',
                },
                display: true,
                ticks: {
                    min: start,
                    max: end,
                    major: {
                        fontStyle: 'bold',
                        fontColor: '#FF0000'
                    }

                }
            }]
        },
    }
    const configuration = {
        type: 'line',
        data: data,
        options: options
    }
    const image = await chartJSNodeCanvas.renderToBuffer(configuration as any);
    return await loadImage(image);
}