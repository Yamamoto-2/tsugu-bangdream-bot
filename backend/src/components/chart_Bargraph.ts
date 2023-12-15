import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { assetsRootPath } from '@/config';
import { registerFont, loadImage } from 'canvas';
registerFont(assetsRootPath + "/Fonts/old.ttf", { family: "old" })
var width = 800
var height = 800
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width, height, chartCallback: (ChartJS) => {
        ChartJS.defaults.font.family = 'old,Microsoft Yahei';
    }
});

export async function drawLinegraphChart(
    data
) {
    var options = {
        plugins: {
            legend: {
                display: false,
            }
        },
    }


    const configuration = {
        type: 'bar',
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