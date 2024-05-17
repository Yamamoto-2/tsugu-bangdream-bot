import { CanvasRenderingContext2D, Canvas, Image } from 'skia-canvas';

/**
 * Draws an image with shadow on the canvas.
 * 
 * @param ctx - The canvas rendering context.
 * @param image - The image to draw.
 * @param dx - The X-coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param dy - The Y-coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param dWidth - The width to draw the image in the destination canvas. This allows scaling of the drawn image.
 * @param dHeight - The height to draw the image in the destination canvas. This allows scaling of the drawn image.
 * @param shadowBlur - The blur level of the shadow.
 * @param shadowColor - The color of the shadow.
 * @param shadowOffsetX - The horizontal distance of the shadow from the image.
 * @param shadowOffsetY - The vertical distance of the shadow from the image.
 */

export function drawImageWithShadow(
    ctx: CanvasRenderingContext2D,
    image: Canvas | Image,
    dx: number,
    dy: number,
    dWidth: number = image.width,
    dHeight: number = image.height,
    shadowBlur: number = 7,
    shadowColor: string = 'rgba(0, 0, 0, 0.5)',
    shadowOffsetX: number = 4,
    shadowOffsetY: number = 4
): void {
    // Save the current state
    ctx.save();

    // Set shadow properties
    ctx.shadowBlur = shadowBlur;
    ctx.shadowColor = shadowColor;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;

    // Draw the image
    ctx.drawImage(image, dx, dy, dWidth, dHeight);

    // Restore the state
    ctx.restore();
}
