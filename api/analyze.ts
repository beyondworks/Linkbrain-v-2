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
import { extractImages } from './lib/image-extractor';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (for token verification)
if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

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
 * Supports both Firebase ID Token (Bearer) and direct userId in body/query
 */
const getUserId = async (req: any): Promise<string | null> => {
    // Try Authorization header with Firebase ID Token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        try {
            // Verify and decode Firebase ID Token
            const decodedToken = await getAuth().verifyIdToken(idToken);
            console.log('[Auth] Decoded userId from token:', decodedToken.uid);
            return decodedToken.uid;
        } catch (error) {
            console.error('[Auth] Invalid Firebase token:', error);
            // Continue to try other methods
        }
    }

    // Try body userId (fallback for direct userId)
    if (req.body.userId) {
        console.log('[Auth] Using userId from body:', req.body.userId);
        return req.body.userId;
    }

    // Try query params
    if (req.query.userId) {
        console.log('[Auth] Using userId from query:', req.query.userId);
        return req.query.userId;
    }

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

        // Get userId (decode Firebase token)
        const userId = await getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

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

        // Merge images from both sources (deduplicate)
        const allImages = [...new Set([...imageUrls])];

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
