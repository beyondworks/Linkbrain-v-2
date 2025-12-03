/**
 * HTML Snapshot and Content Preservation Utilities
 * Extracts, compresses, and preserves web content for offline viewing
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface SnapshotOptions {
  includeCSS?: boolean;
  includeImages?: boolean;
  compressHTML?: boolean;
  maxHTMLSize?: number; // in bytes
  imageQuality?: number; // 0-1
}

export interface SnapshotResult {
  html: string;
  css: string[];
  images: ImageData[];
  metadata: {
    timestamp: Date;
    originalUrl: string;
    size: number;
    compressed: boolean;
  };
}

export interface ImageData {
  url: string;
  dataUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  compressed: boolean;
}

/**
 * Extract CSS from HTML content
 */
export function extractCSS(html: string): string[] {
  const cssLinks: string[] = [];
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const linkTagRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["'][^>]*>/gi;
  
  // Extract inline styles
  let match;
  while ((match = styleTagRegex.exec(html)) !== null) {
    cssLinks.push(match[1]);
  }
  
  // Extract linked stylesheets
  while ((match = linkTagRegex.exec(html)) !== null) {
    cssLinks.push(match[1]);
  }
  
  return cssLinks;
}

/**
 * Extract images from HTML content
 */
export function extractImages(html: string): ImageData[] {
  const images: ImageData[] = [];
  const imgTagRegex = /<img[^>]*src=["']([^"']*)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  
  let match;
  while ((match = imgTagRegex.exec(html)) !== null) {
    images.push({
      url: match[1],
      alt: match[2] || '',
      compressed: false
    });
  }
  
  return images;
}

/**
 * Compress HTML content while preserving structure
 */
export function compressHTML(html: string, maxSize: number = 100000): string {
  // Remove comments
  let compressed = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove extra whitespace
  compressed = compressed.replace(/\s+/g, ' ');
  
  // If still too large, truncate while preserving closing tags
  if (compressed.length > maxSize) {
    compressed = compressed.substring(0, maxSize);
    
    // Try to close any open tags
    const openTags = compressed.match(/<[^/][^>]*>/g) || [];
    const closeTags = compressed.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length > closeTags.length) {
      // Add generic closing div tags
      compressed += '</div>'.repeat(Math.min(5, openTags.length - closeTags.length));
    }
  }
  
  return compressed;
}

/**
 * Compress image to data URL
 */
export async function compressImage(
  imageUrl: string,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Resize if too large
      const maxWidth = 1200;
      const maxHeight = 1200;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Create complete snapshot of web content
 */
export async function createSnapshot(
  html: string,
  url: string,
  options: SnapshotOptions = {}
): Promise<SnapshotResult> {
  const {
    includeCSS = true,
    includeImages = true,
    compressHTML: shouldCompress = true,
    maxHTMLSize = 100000,
    imageQuality = 0.8
  } = options;
  
  let processedHTML = html;
  const css: string[] = [];
  const images: ImageData[] = [];
  
  // Extract CSS
  if (includeCSS) {
    css.push(...extractCSS(html));
  }
  
  // Extract and process images
  if (includeImages) {
    const extractedImages = extractImages(html);
    
    for (const img of extractedImages) {
      try {
        const dataUrl = await compressImage(img.url, imageQuality);
        images.push({
          ...img,
          dataUrl,
          compressed: true
        });
        
        // Replace image URL with data URL in HTML
        processedHTML = processedHTML.replace(img.url, dataUrl);
      } catch (error) {
        console.error(`Failed to compress image ${img.url}:`, error);
        images.push(img);
      }
    }
  }
  
  // Compress HTML
  if (shouldCompress) {
    processedHTML = compressHTML(processedHTML, maxHTMLSize);
  }
  
  return {
    html: processedHTML,
    css,
    images,
    metadata: {
      timestamp: new Date(),
      originalUrl: url,
      size: processedHTML.length,
      compressed: shouldCompress
    }
  };
}

/**
 * Export clip content to PDF
 */
export async function exportToPDF(
  element: HTMLElement,
  filename: string = 'clip.pdf'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}

/**
 * Check Wayback Machine for archived version
 */
export async function checkWaybackMachine(url: string): Promise<{
  available: boolean;
  archived_snapshots?: {
    closest?: {
      available: boolean;
      url: string;
      timestamp: string;
      status: string;
    };
  };
}> {
  try {
    const response = await fetch(
      `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`
    );
    
    if (!response.ok) {
      throw new Error('Wayback Machine API request failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to check Wayback Machine:', error);
    return { available: false };
  }
}

/**
 * Save to Wayback Machine
 */
export async function saveToWaybackMachine(url: string): Promise<{
  success: boolean;
  jobId?: string;
  message?: string;
}> {
  try {
    const response = await fetch(
      `https://web.archive.org/save/${encodeURIComponent(url)}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to save to Wayback Machine');
    }
    
    // Extract job ID from response headers if available
    const jobId = response.headers.get('x-cache-key');
    
    return {
      success: true,
      jobId: jobId || undefined,
      message: 'Successfully submitted to Wayback Machine'
    };
  } catch (error) {
    console.error('Failed to save to Wayback Machine:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Restore snapshot to viewable format
 */
export function restoreSnapshot(snapshot: SnapshotResult): string {
  let restoredHTML = snapshot.html;
  
  // Inject CSS
  if (snapshot.css.length > 0) {
    const cssBlock = `<style>${snapshot.css.join('\n')}</style>`;
    restoredHTML = cssBlock + restoredHTML;
  }
  
  return restoredHTML;
}

/**
 * Calculate snapshot size and compression ratio
 */
export function calculateSnapshotStats(
  original: string,
  snapshot: SnapshotResult
): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  savings: number;
} {
  const originalSize = new Blob([original]).size;
  const compressedSize = new Blob([snapshot.html]).size;
  const compressionRatio = compressedSize / originalSize;
  const savings = originalSize - compressedSize;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    savings
  };
}
