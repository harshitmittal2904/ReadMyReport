import * as pdfjsLib from 'pdfjs-dist';

// Set up the PDF.js worker — copied from node_modules/pdfjs-dist/build/ to public/
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Extract text from a PDF file. If text extraction yields little content,
 * falls back to rendering pages as images for Claude Vision.
 */
export async function processPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let allText = '';

  // Try text extraction first
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    allText += pageText + '\n\n';
  }

  // If we got meaningful text (>100 chars per page avg), use text mode
  if (allText.trim().length > numPages * 100) {
    return { text: allText.trim(), mode: 'text' };
  }

  // Fallback: render pages as images for Vision API
  const images = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];
    images.push({ data: base64, mediaType: 'image/jpeg' });
  }

  return { images, mode: 'vision' };
}

/**
 * Convert an image File to base64 for the Vision API
 */
export async function processImage(file) {
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

/**
 * Process multiple image files
 */
export async function processImages(files) {
  const images = await Promise.all(Array.from(files).map(processImage));
  return { images, mode: 'vision' };
}
