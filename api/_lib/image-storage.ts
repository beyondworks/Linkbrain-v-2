/**
 * Image Storage Utility
 * 
 * Downloads external images and uploads them to Firebase Storage
 * for permanent storage. This prevents image loss from expired CDN URLs.
 */

import { getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fetch from 'node-fetch';
import crypto from 'crypto';

// Get bucket - Firebase Admin should already be initialized by clip-service.ts
// We get the bucket with explicit name to avoid issues
const getBucket = () => {
    if (getApps().length === 0) {
        console.error('[Image Storage] Firebase Admin not initialized!');
        throw new Error('Firebase Admin not initialized');
    }
    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        console.error('[Image Storage] VITE_FIREBASE_STORAGE_BUCKET not set!');
        throw new Error('Storage bucket not configured');
    }
    return getStorage().bucket(bucketName);
};

/**
 * Generate a unique filename for an image
 */
function generateImageFilename(url: string, userId: string, index: number): string {
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
    const ext = getImageExtension(url);
    const timestamp = Date.now();
    return `clips/${userId}/${timestamp}_${index}_${hash}.${ext}`;
}

/**
 * Get image extension from URL
 */
function getImageExtension(url: string): string {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.png')) return 'png';
    if (urlLower.includes('.gif')) return 'gif';
    if (urlLower.includes('.webp')) return 'webp';
    return 'jpg'; // Default to jpg
}

/**
 * Download image from URL and return buffer
 */
async function downloadImage(url: string): Promise<Buffer | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'image/*,*/*;q=0.8',
                'Referer': url.includes('instagram') ? 'https://www.instagram.com/' :
                    url.includes('threads') ? 'https://www.threads.net/' : ''
            },
            timeout: 10000
        });

        if (!response.ok) {
            console.error(`[Image Storage] Failed to download: ${url} - Status: ${response.status}`);
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('image')) {
            console.error(`[Image Storage] Not an image: ${url} - Content-Type: ${contentType}`);
            return null;
        }

        const buffer = await response.buffer();

        // Check if buffer is valid (at least 100 bytes)
        if (buffer.length < 100) {
            console.error(`[Image Storage] Image too small: ${url} - Size: ${buffer.length}`);
            return null;
        }

        return buffer;
    } catch (error) {
        console.error(`[Image Storage] Download error: ${url}`, error);
        return null;
    }
}

/**
 * Upload buffer to Firebase Storage
 */
async function uploadToStorage(buffer: Buffer, filename: string, contentType: string): Promise<string | null> {
    try {
        const bucket = getBucket();
        const file = bucket.file(filename);

        await file.save(buffer, {
            metadata: {
                contentType,
                cacheControl: 'public, max-age=31536000' // Cache for 1 year
            }
        });

        // Make file publicly accessible
        await file.makePublic();

        // Return public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        return publicUrl;
    } catch (error) {
        console.error(`[Image Storage] Upload error: ${filename}`, error);
        return null;
    }
}

/**
 * Process and cache a single image
 */
async function cacheImage(url: string, userId: string, index: number): Promise<string | null> {
    // Skip if already a Firebase Storage URL
    if (url.includes('storage.googleapis.com') || url.includes('firebasestorage.googleapis.com')) {
        return url;
    }

    // Skip if it's a data URL
    if (url.startsWith('data:')) {
        return null;
    }

    console.log(`[Image Storage] Caching image ${index}: ${url.substring(0, 80)}...`);

    const buffer = await downloadImage(url);
    if (!buffer) {
        return null;
    }

    const filename = generateImageFilename(url, userId, index);
    const ext = getImageExtension(url);
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    const publicUrl = await uploadToStorage(buffer, filename, contentType);

    if (publicUrl) {
        console.log(`[Image Storage] Cached: ${filename}`);
    }

    return publicUrl;
}

/**
 * Cache multiple images in parallel
 * Returns array of cached URLs (null entries for failed images)
 */
export async function cacheImages(urls: string[], userId: string): Promise<string[]> {
    if (!urls || urls.length === 0) {
        return [];
    }

    console.log(`[Image Storage] Starting to cache ${urls.length} images for user ${userId}`);

    // Process images in batches of 5 to avoid overwhelming the server
    const batchSize = 5;
    const results: (string | null)[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map((url, idx) => cacheImage(url, userId, i + idx))
        );
        results.push(...batchResults);
    }

    // Filter out nulls and return successful URLs
    const cachedUrls = results.filter((url): url is string => url !== null);

    console.log(`[Image Storage] Successfully cached ${cachedUrls.length}/${urls.length} images`);

    return cachedUrls;
}

/**
 * Cache images with fallback - returns original URLs if caching fails
 */
export async function cacheImagesWithFallback(urls: string[], userId: string): Promise<string[]> {
    if (!urls || urls.length === 0) {
        return [];
    }

    try {
        const cachedUrls = await cacheImages(urls, userId);

        // If no images were cached, return originals
        if (cachedUrls.length === 0) {
            console.log(`[Image Storage] Caching failed, using original URLs`);
            return urls;
        }

        return cachedUrls;
    } catch (error) {
        console.error(`[Image Storage] Error during caching, using original URLs`, error);
        return urls;
    }
}
