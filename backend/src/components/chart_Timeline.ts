import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { assetsRootPath } from '@/config';
import { registerFont, loadImage } from 'canvas';
import 'chartjs-adapter-moment';
registerFont(assetsRootPath + "/Fonts/old.ttf", { family: "old" })
var width = 800
var height = 800
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width, height, chartCallback: (ChartJS) => {
        ChartJS.defaults.font.family = 'old,Microsoft Yahei';
    }
});

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
}: drawTimeLineChartOptions) {
    const yMax = Math.max(...data['datasets'].map((dataset: any) => Math.max(...dataset['data'].map((data: any) => data['y']))))
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
                min: 0,
                max: (yMax + 1000) * 1.1,
            }
        }
    }
    const configuration = {
        type: 'line',
        data: data,
        options: options
    }
    try {
        const image = await chartJSNodeCanvas.renderToBuffer(configuration as any);
        return await loadImage(image);
    }
    catch (e) {
        console.log(e)
        return loadImage(assetsRootPath + '/err.png')
    }
}