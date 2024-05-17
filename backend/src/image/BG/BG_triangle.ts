import { Canvas, Image } from 'skia-canvas';
import { getBlurredImage } from '@/image/blurImage';

interface createBlurredTrianglePatternOptions {
    image: Image,
    blurRadius: number,
    triangleSize: number,
    brightnessDifference: number,

}

//输入图片，输出带有三角形效果的模糊图片
export async function createBlurredTrianglePattern({
    image,
    blurRadius,
    triangleSize,
    brightnessDifference,
}: createBlurredTrianglePatternOptions
): Promise<Canvas> {
    // Load image

    // Initialize canvas
    const canvas = new Canvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Create blurred image
    const blurredImage = await getBlurredImage(image, blurRadius);
    ctx.drawImage(blurredImage, 0, 0);

    // Get and manipulate image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const numRows = Math.ceil(image.height / (triangleSize * Math.sqrt(3) / 2));
    const numCols = Math.ceil(image.width / triangleSize);

    for (let row = 0; row < numRows; row++) {
        const rowOffset = row * (triangleSize * Math.sqrt(3) / 2);
        const isOffsetRow = row % 2 === 1;
        let isFirstColOffset = isOffsetRow;

        for (let col = 0; col < numCols; col++) {
            const colOffset = col * triangleSize;
            const triangleX = isOffsetRow ? colOffset + (triangleSize / 2) : colOffset;
            const triangleY = rowOffset;

            if (isFirstColOffset && col === 0) {
                const mirroredX = image.width - triangleX - triangleSize;
                const mirroredTriangleY = triangleY + (triangleSize * Math.sqrt(3) / 2);
                const mirroredYStart = Math.max(0, Math.floor(mirroredTriangleY));
                const mirroredYEnd = Math.min(image.height, Math.ceil(mirroredTriangleY + triangleSize * Math.sqrt(3) / 2));

                for (let y = mirroredYStart; y < mirroredYEnd; y++) {
                    for (let x = 0; x < triangleSize; x++) {
                        const pixelY = Math.floor(y - mirroredTriangleY);
                        const pixelX = Math.floor(triangleSize - x - 1);
                        const idx = (y * imageData.width + mirroredX + x) * 4;
                        const isInTriangle = isInsideEquilateralTriangle(triangleX, triangleY, pixelX, pixelY, triangleSize);
                        const brightnessFactor = isInTriangle ? 1 + brightnessDifference : 1;
                        imageData.data[idx] = Math.min(Math.max(imageData.data[idx] * brightnessFactor, 0), 255);
                        imageData.data[idx + 1] = Math.min(Math.max(imageData.data[idx + 1] * brightnessFactor, 0), 255);
                        imageData.data[idx + 2] = Math.min(Math.max(imageData.data[idx + 2] * brightnessFactor, 0), 255);
                    }
                }
            }

            for (let y = 0; y < triangleSize * Math.sqrt(3) / 2; y++) {
                for (let x = 0; x < triangleSize; x++) {
                    const pixelY = Math.floor(triangleY + y);
                    const pixelX = Math.floor(triangleX + x);
                    const idx = (pixelY * imageData.width + pixelX) * 4;
                    const isInTriangle = isInsideEquilateralTriangle(triangleX, triangleY, x, y, triangleSize);
                    const brightnessFactor = isInTriangle ? 1 + brightnessDifference : 1;
                    imageData.data[idx] = Math.min(Math.max(imageData.data[idx] * brightnessFactor, 0), 255);
                    imageData.data[idx + 1] = Math.min(Math.max(imageData.data[idx + 1] * brightnessFactor, 0), 255);
                    imageData.data[idx + 2] = Math.min(Math.max(imageData.data[idx + 2] * brightnessFactor, 0), 255);
                }
            } if (isOffsetRow && col === numCols - 1) {
                const mirroredX = image.width - triangleX - (triangleSize / 2);
                const mirroredTriangleY = triangleY + (triangleSize * Math.sqrt(3) / 2);
                const mirroredYStart = Math.max(0, Math.floor(mirroredTriangleY));
                const mirroredYEnd = Math.min(image.height, Math.ceil(mirroredTriangleY + triangleSize * Math.sqrt(3) / 2));

                for (let y = mirroredYStart; y < mirroredYEnd; y++) {
                    for (let x = 0; x < triangleSize / 2; x++) {
                        const pixelY = Math.floor(y - mirroredTriangleY);
                        const pixelX = Math.floor(triangleSize / 2 - x - 1);
                        const idx = (y * imageData.width + mirroredX + x) * 4;
                        const isInTriangle = isInsideEquilateralTriangle(triangleX, triangleY, pixelX, pixelY, triangleSize);
                        const brightnessFactor = isInTriangle ? 1 + brightnessDifference : 1;
                        imageData.data[idx] = Math.min(Math.max(imageData.data[idx] * brightnessFactor, 0), 255);
                        imageData.data[idx + 1] = Math.min(Math.max(imageData.data[idx + 1] * brightnessFactor, 0), 255);
                        imageData.data[idx + 2] = Math.min(Math.max(imageData.data[idx + 2] * brightnessFactor, 0), 255);
                    }
                }
            }

            isFirstColOffset = false;
        }
    }


    //add stars
    ctx.putImageData(imageData, 0, 0);
    //return Canvas
    return canvas;
}

function isInsideEquilateralTriangle(x: number, y: number, px: number, py: number, size: number): boolean {
    const halfSize = size / 2;
    const triangleHeight = size * Math.sqrt(3) / 2;

    if (px < halfSize) {
        return py > (halfSize - px) * Math.sqrt(3) && py < triangleHeight + (halfSize - px) * Math.sqrt(3);
    } else {
        return py > (px - halfSize) * Math.sqrt(3) && py < triangleHeight + (px - halfSize) * Math.sqrt(3);
    }
}
