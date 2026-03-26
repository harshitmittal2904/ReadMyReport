const MAX_DIMENSION = 1500;
const JPEG_QUALITY = 0.8;
const TARGET_SIZE_BYTES = 1024 * 1024; // 1MB

/**
 * Compress an image file using Canvas API.
 * Resizes to max 1500px on longest side, compresses to JPEG 0.8.
 * Returns { data: base64, mediaType: 'image/jpeg' }
 */
export function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const result = resizeAndCompress(img);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Compress a base64 data URL string.
 * Returns { data: base64 (no prefix), mediaType: 'image/jpeg' }
 */
export function compressBase64Image(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const result = resizeAndCompress(img);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = dataUrl;
  });
}

function resizeAndCompress(img) {
  let { width, height } = img;

  // Scale down if larger than MAX_DIMENSION
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);

  // If still too large, reduce quality iteratively
  while (dataUrl.length * 0.75 > TARGET_SIZE_BYTES && quality > 0.3) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  const base64 = dataUrl.split(',')[1];
  return { data: base64, mediaType: 'image/jpeg' };
}
