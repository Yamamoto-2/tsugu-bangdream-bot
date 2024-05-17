import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { assetsRootPath } from '@/config';
import { FontLibrary, loadImage } from 'skia-canvas';
import { assetErrorImageBuffer } from '@/image/utils';

FontLibrary.use("old", [`${assetsRootPath}/Fonts/old.ttf`])
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
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration as any);
        return await loadImage(imageBuffer);
    }
    catch (e) {
        console.log(e)
        return loadImage(assetErrorImageBuffer)
    }
}