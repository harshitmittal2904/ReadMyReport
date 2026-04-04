const MAX_DIMENSION = 1500;
const JPEG_QUALITY = 0.8;
const TARGET_SIZE_BYTES = 1024 * 1024; // 1MB
const TOTAL_BUDGET_BYTES = 3_500_000; // 3.5MB total for all images (sessionStorage safe)

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

const IMAGE_LOAD_TIMEOUT_MS = 15000; // 15s timeout for image loading + compression

/**
 * Compress an image (File or data URL) to fit within a target byte budget.
 * Uses iterative quality reduction first, then dimension reduction.
 * Includes a timeout to prevent hanging on mobile devices.
 * Returns { data: base64 (no prefix), mediaType: 'image/jpeg' }
 */
export function compressImageToTarget(source, targetBytes) {
  const compressionPromise = new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const result = compressToTarget(img, targetBytes);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));

    if (typeof source === 'string') {
      // data URL
      img.src = source;
    } else if (source instanceof Blob || source instanceof File) {
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const result = compressToTarget(img, targetBytes);
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
    } else {
      reject(new Error('Invalid source: expected File, Blob, or data URL string'));
    }
  });

  // Race against a timeout to prevent hanging on mobile
  return Promise.race([
    compressionPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Image compression timed out')), IMAGE_LOAD_TIMEOUT_MS)
    ),
  ]);
}

/**
 * Calculate per-image byte budget based on total number of images.
 * Ensures all images together stay within TOTAL_BUDGET_BYTES.
 */
export function calculatePerImageBudget(imageCount) {
  const count = Math.max(1, imageCount);
  // Per-image budget, capped at 1MB max per image
  return Math.min(Math.floor(TOTAL_BUDGET_BYTES / count), 1_000_000);
}

function compressToTarget(img, targetBytes) {
  const qualitySteps = [0.85, 0.7, 0.5, 0.3];
  const dimensionSteps = [1500, 1200, 1000];

  for (const maxDim of dimensionSteps) {
    for (const quality of qualitySteps) {
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = dataUrl.split(',')[1];

      // Release canvas memory
      canvas.width = 0;
      canvas.height = 0;

      // base64 string length * 0.75 ≈ byte size
      const estimatedBytes = base64.length * 0.75;

      if (estimatedBytes <= targetBytes) {
        return { data: base64, mediaType: 'image/jpeg' };
      }
    }
  }

  // If we still can't fit, return the smallest we managed (1000px, quality 0.3)
  let { width, height } = img;
  const ratio = Math.min(1000 / width, 1000 / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.3);
  const base64 = dataUrl.split(',')[1];
  canvas.width = 0;
  canvas.height = 0;

  return { data: base64, mediaType: 'image/jpeg' };
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
