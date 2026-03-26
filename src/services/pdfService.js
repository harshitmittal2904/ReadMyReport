import * as pdfjsLib from 'pdfjs-dist';
import { compressImageFile } from '../utils/imageCompression';

// Set up the PDF.js worker — copied from node_modules/pdfjs-dist/build/ to public/
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const MAX_RENDER_DIMENSION = 1500;

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

  // If we got meaningful text (>100 chars per page avg), use text mode
  if (allText.trim().length > numPages * 100) {
    return { text: allText.trim(), mode: 'text' };
  }

  // Fallback: render pages as images for Vision API
  // Use lower scale on mobile to prevent memory crashes
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const images = [];

  for (let i = 1; i <= numPages; i++) {
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

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      images.push({ data: base64, mediaType: 'image/jpeg' });

      // Release canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;
    } catch (err) {
      console.warn(`Failed to render PDF page ${i}:`, err.message);
      // Continue with other pages rather than failing entirely
    }
  }

  if (images.length === 0) {
    throw new Error('PDF_UNREADABLE');
  }

  return { images, mode: 'vision' };
}

/**
 * Convert an image File to compressed base64 for the Vision API.
 * Resizes to max 1500px and compresses to JPEG.
 */
export async function processImage(file) {
  try {
    return await compressImageFile(file);
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
 * Process multiple image files with compression
 */
export async function processImages(files) {
  const images = await Promise.all(Array.from(files).map(processImage));
  return { images, mode: 'vision' };
}
