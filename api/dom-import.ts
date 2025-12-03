/**
 * DOM Import API - Browser Extension/Bookmarklet Version
 * 
 * This endpoint accepts DOM-captured content from client-side and creates clips.
 * Used by browser extensions and bookmarklets.
 * 
 * Request: { url, text?, html?, images?, sourceHint?, userId? }
 * Response: Clip object
 */

import { createClipFromContent, detectPlatform, extractTextFromHtml } from './lib/clip-service';

// Request payload interface
interface DomCapturePayload {
    url: string;
    html?: string;
    text?: string;
    images?: string[];
    sourceHint?: string;
    userId?: string;
}

// Main handler
export default async function handler(req: any, res: any) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload: DomCapturePayload = req.body;

        // Validate required fields
        if (!payload.url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Get userId from Authorization header or body
        const authToken = req.headers.authorization?.split('Bearer ')[1];
        const userId = payload.userId || authToken;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get text content
        let rawText = payload.text || '';
        if (!rawText || rawText.length < 50) {
            if (payload.html) {
                rawText = extractTextFromHtml(payload.html);
            }
        }

        if (!rawText || rawText.length < 20) {
            return res.status(400).json({ error: 'Insufficient text content' });
        }

        // Detect platform
        const sourceType = detectPlatform(payload.url, payload.sourceHint);

        // Use common service to create clip
        const clip = await createClipFromContent({
            url: payload.url,
            sourceType: sourceType as any,
            rawText,
            htmlContent: payload.html,
            images: payload.images,
            userId
        });

        res.status(201).json(clip);

    } catch (error: any) {
        console.error('DOM Import API Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
