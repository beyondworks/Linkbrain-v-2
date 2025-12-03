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

import { createClipFromContent, detectPlatform } from './lib/clip-service';
import { fetchUrlContent } from './lib/url-content-fetcher';

// CORS helper
const setCorsHeaders = (res: any) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
};

/**
 * Extract userId from request
 */
const getUserId = (req: any): string | null => {
    // Try Authorization header
    const authToken = req.headers.authorization?.split('Bearer ')[1];
    if (authToken) return authToken;

    // Try query params
    if (req.query.userId) return req.query.userId;

    // Try request body
    if (req.body.userId) return req.body.userId;

    return null;
};

/**
 * Main handler
 */
export default async function handler(req: any, res: any) {
    // CORS
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, language } = req.body;

        // Validate URL
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Get userId
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        console.log(`[URL Import] Processing: ${url}`);

        // 1. Detect platform from URL
        const sourceType = detectPlatform(url);
        console.log(`[URL Import] Detected platform: ${sourceType}`);

        // 2. Fetch content from URL (server-side with Jina Reader)
        const content = await fetchUrlContent(url);
        console.log(`[URL Import] Fetched content: ${content.rawText.length} chars, ${content.images.length} images`);

        // 3. Create clip using common service
        // This handles AI metadata generation + Firestore save
        // Gracefully degrades if content is insufficient (creates URL-only clip)
        const clip = await createClipFromContent({
            url,
            sourceType: sourceType as any,
            rawText: content.rawText,
            htmlContent: content.htmlContent,
            images: content.images,
            userId
        }, {
            language: language || 'KR'
        });

        console.log(`[URL Import] Clip created: ${clip.id}`);

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
