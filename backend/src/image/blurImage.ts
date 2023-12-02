import { Image, createCanvas, loadImage } from 'canvas';
import Jimp from 'jimp';

// 输入图片对象和模糊半径，输出模糊后的图片
export async function getBlurredImage(image: Image, blurRadius: number): Promise<Image> {
    // 创建 canvas 并绘制原始图像
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // 使用 Jimp 读取 canvas 的内容
    let jimpImage = await Jimp.read(canvas.toBuffer());

    // 获取原始尺寸
    const originalWidth = jimpImage.bitmap.width;
    const originalHeight = jimpImage.bitmap.height;

    // 设置新的图像尺寸
    const newWidth = 7 ; // 新宽度
    const newHeight = Jimp.AUTO; // 高度自动调整以保持纵横比

    // 改变图像分辨率（例如减半）
    jimpImage = jimpImage.resize(newWidth, newHeight);

    // 应用模糊效果
    // jimpImage.blur(blurRadius);

    // 恢复原始尺寸
    jimpImage.resize(originalWidth, originalHeight);

    // 将处理后的 Jimp 图像转换为 Image 对象
    return await loadImage(await jimpImage.getBufferAsync(Jimp.MIME_PNG));
}
