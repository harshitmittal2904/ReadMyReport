import * as pdfjsLib from 'pdfjs-dist';
import { compressImageToTarget, calculatePerImageBudget } from '../utils/imageCompression';

// Set up the PDF.js worker — copied from node_modules/pdfjs-dist/build/ to public/
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const MAX_RENDER_DIMENSION = 1500;
const MAX_VISION_PAGES = 6;

/**
 * Extract text from a PDF file. If text extraction yields little content,
 * falls back to rendering pages as images for Vision API.
 * Handles encrypted PDFs and rendering failures gracefully.
 */
export async function processPDF(file) {
  let pdf;
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    // Encrypted or corrupted PDF
    if (err.name === 'PasswordException' || (err.message && err.message.includes('password'))) {
      throw new Error('ENCRYPTED_PDF');
    }
    throw new Error('PDF_UNREADABLE');
  }

  const numPages = pdf.numPages;
  let allText = '';

  // Try text extraction first
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      allText += pageText + '\n\n';
    } catch {
      // Page-level text extraction failure is non-fatal; continue
    }
  }

  // If we got meaningful text, check if it's real lab data (not OCR artifacts)
  if (allText.trim().length > numPages * 100) {
    // Real lab text has many numeric values; OCR artifacts are mostly words
    const digitTokens = allText.match(/\d+\.?\d*/g) || [];
    const avgDigitsPerPage = digitTokens.length / numPages;
    if (avgDigitsPerPage >= 10) {
      return { text: allText.trim(), mode: 'text' };
    }
    // Low digit density — likely OCR garbage, fall through to vision
    console.warn(`Text extracted but low digit density (${avgDigitsPerPage.toFixed(1)}/page), using vision mode`);
  }

  // Fallback: render pages as images for Vision API
  const pagesToRender = Math.min(numPages, MAX_VISION_PAGES);
  const perPageBudget = calculatePerImageBudget(pagesToRender);

  // Use lower scale on mobile to prevent memory crashes
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const images = [];

  for (let i = 1; i <= pagesToRender; i++) {
    try {
      const page = await pdf.getPage(i);
      const defaultViewport = page.getViewport({ scale: 1.0 });

      // Calculate scale to fit within MAX_RENDER_DIMENSION
      const maxSide = Math.max(defaultViewport.width, defaultViewport.height);
      let scale = MAX_RENDER_DIMENSION / maxSide;
      if (isMobile) scale = Math.min(scale, 1.2); // Cap at 1.2x on mobile
      else scale = Math.min(scale, 2.0);

      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Release canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;

      // Compress to fit within per-page budget
      const compressed = await compressImageToTarget(dataUrl, perPageBudget);
      images.push(compressed);
    } catch (err) {
      console.warn(`Failed to render PDF page ${i}:`, err.message);
      // Continue with other pages rather than failing entirely
    }
  }

  if (images.length === 0) {
    throw new Error('PDF_UNREADABLE');
  }

  return {
    images,
    mode: 'vision',
    truncated: numPages > MAX_VISION_PAGES ? numPages : undefined,
  };
}

/**
 * Convert an image File to compressed base64 for the Vision API.
 * Uses adaptive budget based on being the sole image.
 */
export async function processImage(file, targetBytes) {
  const budget = targetBytes || calculatePerImageBudget(1);
  try {
    return await compressImageToTarget(file, budget);
  } catch {
    // Fallback to raw FileReader if compression fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        const mediaType = file.type || 'image/jpeg';
        resolve({ data: base64, mediaType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Process multiple image files with adaptive compression.
 * Caps at 10 images and budgets per-image to stay within sessionStorage limits.
 */
export async function processImages(files) {
  const fileArray = Array.from(files).slice(0, MAX_VISION_PAGES);
  const perImageBudget = calculatePerImageBudget(fileArray.length);
  const images = await Promise.all(
    fileArray.map(f => processImage(f, perImageBudget))
  );
  return {
    images,
    mode: 'vision',
    truncated: files.length > MAX_VISION_PAGES ? files.length : undefined,
  };
}
