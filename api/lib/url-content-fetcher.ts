
import puppeteer from 'puppeteer';

/**
 * URL Content Fetcher
 * 
 * Fetches content from URLs using:
 * 1. Puppeteer (Priority for social media: Threads, Instagram, Twitter)
 * 2. Jina Reader API (Fallback for general web content)
 * 
 * Guarantees accurate content extraction with graceful degradation
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface FetchedUrlContent {
    rawText: string;
    htmlContent?: string;
    images: string[];
    author?: string;
    authorAvatar?: string;
    authorHandle?: string;
    finalUrl?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract image URLs from markdown content
 */
const extractImagesFromMarkdown = (markdown: string): string[] => {
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
    const images: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
        images.push(match[1]);
    }

    return images;
};

/**
 * Simple fetch with timeout
 */
const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 15000
): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

import { extractWithPuppeteer } from './puppeteer-extractor';

/**
 * Detect if URL is from social media platform
 */
const isSocialMedia = (url: string): boolean => {
    const lower = url.toLowerCase();
    return lower.includes('threads.net') || lower.includes('threads.com') || lower.includes('www.threads') ||
        lower.includes('instagram.com') || lower.includes('instagr.am') ||
        lower.includes('twitter.com') || lower.includes('x.com') || lower.includes('youtube.com');
};

/**
 * Main content fetcher with smart fallback strategy
 * 
 * Strategy:
 * 1. Social media → Puppeteer first (accurate metadata)
 * 2. If Puppeteer result weak → Jina for text, keep Puppeteer metadata
 * 3. General web → Jina Reader
 */
export const fetchUrlContent = async (url: string): Promise<FetchedUrlContent> => {
    try {
        // STRATEGY 1: Social media → Use Puppeteer
        if (isSocialMedia(url)) {
            console.log('[Content Fetcher] Social media detected, using Puppeteer');
            const puppeteerResult = await extractWithPuppeteer(url);

            // Check if result is weak
            const textLower = (puppeteerResult.rawText || '').toLowerCase();
            const hasLoginGate = textLower.includes('log in') || textLower.includes('sign up') ||
                textLower.includes('로그인') || textLower.includes('가입');

            const isWeak = !puppeteerResult.rawText ||
                puppeteerResult.rawText.length < 200 ||
                puppeteerResult.images.length === 0 ||
                hasLoginGate;

            if (!isWeak) {
                console.log('[Content Fetcher] Puppeteer succeeded');
                return puppeteerResult;
            }

            // Weak result → Try Jina for text, keep Puppeteer metadata
            console.warn('[Content Fetcher] Weak Puppeteer result, trying Jina fallback');
            console.log(`[Content Fetcher] Weak reason: ${puppeteerResult.rawText.length} chars, ${puppeteerResult.images.length} images, loginGate: ${hasLoginGate}`);

            let jinaUrl = url;
            if (url.includes('threads.com')) {
                jinaUrl = url.replace('threads.com', 'threads.net');
                console.log(`[Content Fetcher] Canonicalized: threads.com → threads.net`);
            }

            const jinaResult = await extractWithJina(jinaUrl);

            if (jinaResult.rawText && jinaResult.rawText.length > 50) {
                console.log('[Content Fetcher] Jina fallback succeeded, merging with Puppeteer metadata');

                // MERGE: Jina text + Puppeteer metadata
                return {
                    rawText: jinaResult.rawText,
                    htmlContent: jinaResult.htmlContent || puppeteerResult.htmlContent,
                    images: puppeteerResult.images.length > 0 ? puppeteerResult.images : jinaResult.images,
                    author: puppeteerResult.author || jinaResult.author,
                    authorAvatar: puppeteerResult.authorAvatar || jinaResult.authorAvatar,
                    authorHandle: puppeteerResult.authorHandle || jinaResult.authorHandle,
                    finalUrl: jinaUrl
                };
            }

            console.warn('[Content Fetcher] Jina also failed, returning weak Puppeteer result');
            return puppeteerResult;
        }

        // STRATEGY 2: General web → Jina Reader
        console.log('[Content Fetcher] Using Jina Reader');
        return await extractWithJina(url);

    } catch (error) {
        console.error('[Content Fetcher] Error:', error);
        return { rawText: '', images: [] };
    }
};

/**
 * Extract content using Jina Reader API
 */
const extractWithJina = async (url: string): Promise<FetchedUrlContent> => {
    try {
        console.log(`[Jina Reader] Fetching content for: ${url}`);

        // Call Jina Reader API
        const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
        const jinaApiKey = process.env.JINA_API_KEY;

        const headers: Record<string, string> = {
            'Accept': 'application/json'
        };

        // Add API key if available
        if (jinaApiKey) {
            headers['Authorization'] = `Bearer ${jinaApiKey}`;
        }

        const response = await fetchWithTimeout(jinaUrl, { headers }, 20000);

        if (!response.ok) {
            console.warn(`[Jina Reader] API returned ${response.status}`);
            return { rawText: '', images: [] };
        }

        const data = await response.json();

        // Extract content (Jina returns different formats depending on Accept header)
        const content = data.data?.content || data.content || '';

        if (!content || content.length < 20) {
            console.warn('[Jina Reader] Insufficient content returned');
            return { rawText: '', images: [] };
        }

        // Extract images from markdown content
        const images = extractImagesFromMarkdown(content);

        console.log(`[Jina Reader] Success: ${content.length} chars, ${images.length} images`);

        return {
            rawText: content,
            htmlContent: undefined, // Jina returns markdown, not HTML
            images
        };

    } catch (error) {
        console.error('[Jina Reader] Error fetching content:', error);

        // Graceful degrade: return empty content
        return {
            rawText: '',
            images: []
        };
    }
};

/**
 * TODO: Playwright/Puppeteer fallback for JavaScript-heavy sites
 * 
 * This would be a secondary fetcher that uses headless browser rendering
 * when Jina Reader fails or returns insufficient content.
 * 
 * Implementation would be similar to existing scrapeWithPuppeteer in analyze.ts
 * but focused on content extraction rather than screenshots.
 * 
 * Priority: Low (Jina handles 90%+ of cases)
 */
