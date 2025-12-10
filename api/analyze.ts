/**
 * URL Analysis API - Server-Side DOM Rendering Version
 * 
 * This endpoint accepts a URL and returns rich clip metadata using:
 * 1. Jina Reader for content extraction (server-side)
 * 2. OpenAI for AI metadata generation
 * 3. Common clip service for Firestore storage
 * 
 * Request: { url: string, language?: string }
 * Response: Clip object (compatible with existing frontend)
 */

import { createClipFromContent, detectPlatform } from './_lib/clip-service';
import { fetchUrlContent } from './_lib/url-content-fetcher';
import { extractImages } from './_lib/image-extractor';
import { requireAuth } from './_lib/auth';
import { setCorsHeaders, handlePreflight } from './_lib/cors';
import { validateUrl } from './_lib/url-validator';

/**
 * Main handler
 */
export default async function handler(req: any, res: any) {
    // CORS
    setCorsHeaders(req, res);

    if (handlePreflight(req, res)) {
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, language } = req.body;

        // Validate URL (SSRF prevention)
        const urlValidation = validateUrl(url);
        if (!urlValidation.valid) {
            return res.status(400).json({ error: urlValidation.error });
        }

        // Require authentication (no userId fallback)
        const auth = await requireAuth(req, res);
        if (!auth) return; // 401 already sent

        const userId = auth.userId;

        console.log(`[URL Import] Processing: ${url}`);
        console.log(`[URL Import] User ID: ${userId}`);

        // 1. Detect platform from URL (initial)
        let sourceType = detectPlatform(url);
        console.log(`[URL Import] Initial platform detection: ${sourceType}`);

        // 2. Fetch content from URL (server-side with Jina Reader or Puppeteer)
        const content = await fetchUrlContent(url);
        console.log(`[URL Import] Fetched content: ${content.rawText.length} chars`);

        // 2.5. Extract images separately using image-extractor
        const extractedImages = await extractImages(url);
        const imageUrls = extractedImages.map(img => img.url);
        console.log(`[URL Import] Extracted images: ${imageUrls.length} images`);
        console.log(`[URL Import] Content images: ${content.images?.length || 0} images`);

        // Merge images from both sources (deduplicate)
        // For Naver Blog: prioritize content.images (Jina extracted)
        // For general web: prioritize imageUrls (image-extractor filtered)
        const isNaverBlog = url.toLowerCase().includes('blog.naver.com');
        const allImages = isNaverBlog
            ? [...new Set([...(content.images || []), ...imageUrls])]
            : [...new Set([...imageUrls, ...(content.images || [])])];

        // 3. Re-detect platform from final URL if available (handles redirects)
        if (content.finalUrl && content.finalUrl !== url) {
            const finalPlatform = detectPlatform(content.finalUrl);
            console.log(`[URL Import] Final URL after redirect: ${content.finalUrl}`);
            console.log(`[URL Import] Re-detected platform: ${finalPlatform}`);
            sourceType = finalPlatform;
        }

        // 3. Create clip using common service
        // This handles AI metadata generation + Firestore save
        // Gracefully degrades if content is insufficient (creates URL-only clip)
        const clip = await createClipFromContent({
            url,
            sourceType: sourceType as any,
            rawText: content.rawText,
            htmlContent: content.htmlContent,
            images: allImages,  // Use merged images from both extractors
            userId,
            author: content.author,
            authorAvatar: content.authorAvatar,
            authorHandle: content.authorHandle
        }, {
            language: language || 'KR'
        });

        console.log(`[URL Import] Clip created: ${clip.id} `);

        // 4. Return clip (same format as before for frontend compatibility)
        return res.status(201).json(clip);

    } catch (error: any) {
        console.error('[URL Import] Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
