import { Image, createCanvas, loadImage } from 'canvas';
import Jimp from 'jimp';

//输入图片，输出模糊后的图片
async function getBlurredImage(image: any, blurRadius: number): Promise<Image> {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const jimpImage = await Jimp.read(canvas.toBuffer());
    jimpImage.blur(blurRadius);

    return await loadImage(await jimpImage.getBufferAsync(Jimp.MIME_PNG));
}
export { getBlurredImage }