export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load image file."));
    };

    image.src = url;
  });
}

export async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image from data URL."));
    image.src = dataUrl;
  });
}

export type ImageSource = File | HTMLImageElement;

async function resolveImageSource(source: ImageSource): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    return source;
  }

  return loadImageFromFile(source);
}

export async function cropImageToDataUrl(
  source: ImageSource,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number
): Promise<string> {
  const image = await resolveImageSource(source);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create canvas context.");
  }

  drawCroppedImage(context, image, crop, outputWidth, outputHeight);

  return canvas.toDataURL("image/png");
}

/**
 * Draws a cropped area of the source image onto a canvas.
 * Handles out-of-bounds crops by filling them with a solid white background
 * and centers the image within the frame without stretching.
 * Also applies a subtle filter to enhance the lighting and contrast.
 */
export function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth: number,
  outputHeight: number
): void {
  // Clear background with solid white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  // Apply subtle lighting filters to enhance brightness, contrast, and saturation
  ctx.filter = "brightness(1.06) contrast(1.04) saturate(1.02)";

  // Calculate the scale from crop space to output canvas space
  const scaleX = outputWidth / crop.width;
  const scaleY = outputHeight / crop.height;

  // Find the intersection of the crop box and the source image
  const srcX = Math.max(0, crop.x);
  const srcY = Math.max(0, crop.y);
  const srcRight = Math.min(image.width, crop.x + crop.width);
  const srcBottom = Math.min(image.height, crop.y + crop.height);

  const srcWidth = srcRight - srcX;
  const srcHeight = srcBottom - srcY;

  if (srcWidth > 0 && srcHeight > 0) {
    // Map the source intersection back to destination canvas coordinates
    const destX = (srcX - crop.x) * scaleX;
    const destY = (srcY - crop.y) * scaleY;
    const destWidth = srcWidth * scaleX;
    const destHeight = srcHeight * scaleY;

    ctx.drawImage(
      image,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      destX,
      destY,
      destWidth,
      destHeight
    );
  }
}

