/**
 * Convert a File or Blob to a Base64 data URL string
 */
export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Load an image from a URL or data URL and return its HTMLImageElement
 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export interface ResizeExportOptions {
  width: number;
  height: number;
  fit?: 'contain' | 'cover';
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number; // 0.1 to 1.0 (for jpeg/webp)
  backgroundColor?: string; // hex, 'transparent', or undefined
}

/**
 * Resize and reframe an image to exact dimensions on an HTML5 canvas
 */
export async function resizeAndExportImage(
  imageSrc: string,
  options: ResizeExportOptions
): Promise<string> {
  const {
    width,
    height,
    fit = 'contain',
    format = 'image/png',
    quality = 0.95,
    backgroundColor = 'transparent',
  } = options;

  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Clear background
  ctx.clearRect(0, 0, width, height);

  // Fill background color if requested (e.g. for JPEG or specified studio color)
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else if (format === 'image/jpeg') {
    // JPEG has no alpha channel, default to white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  // Smooth scaling interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  if (fit === 'contain') {
    // Scale proportionally to fit inside canvas without cropping
    const scale = Math.min(width / imgW, height / imgH);
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = (width - destW) / 2;
    const destY = (height - destH) / 2;

    ctx.drawImage(img, destX, destY, destW, destH);
  } else {
    // 'cover': fill the whole canvas and center crop
    const scale = Math.max(width / imgW, height / imgH);
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = (width - destW) / 2;
    const destY = (height - destH) / 2;

    ctx.drawImage(img, destX, destY, destW, destH);
  }

  return canvas.toDataURL(format, quality);
}

/**
 * Download an image data URL with a specific filename
 */
export function downloadImage(dataUrl: string, filename: string = 'cleancut-product.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy an image data URL to the user's system clipboard
 */
export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    // ClipboardItem requires PNG blob in most browsers
    const item = new ClipboardItem({ [blob.type || 'image/png']: blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
    return false;
  }
}
