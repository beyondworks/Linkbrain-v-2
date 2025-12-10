
import puppeteer from 'puppeteer';
import { normalizeThreads } from './threads-normalizer';
import { normalizeWeb } from './web-normalizer';
import { normalizeNaverBlog } from './naver-normalizer';
import { validateUrl } from './url-validator';

/**
 * URL Content Fetcher
 * 
 * Fetches content from URLs using:
 * 1. Puppeteer (Priority for social media: Threads, Instagram, Twitter)
 * 2. Jina Reader API (Fallback for general web content)
 * 
 * Guarantees accurate content extraction with graceful degradation
 * 
 * NOTE: Instagram and YouTube pipelines are NOT modified - they work well.
 * Only Threads and Web content get normalized.
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface FetchedUrlContent {
    rawText: string;
    rawTextOriginal?: string;  // Original text before normalization (for backup)
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
 * Apply Threads-specific text normalization
 * Preserves original in rawTextOriginal for potential future re-processing
 */
const applyThreadsNormalization = (content: FetchedUrlContent): FetchedUrlContent => {
    const original = content.rawText || '';
    const normalized = normalizeThreads(original);
    return {
        ...content,
        rawText: normalized,
        rawTextOriginal: original  // Keep backup of original
    };
};

/**
 * Apply Web-specific text normalization
 */
const applyWebNormalization = (content: FetchedUrlContent): FetchedUrlContent => {
    const original = content.rawText || '';
    const normalized = normalizeWeb(original);
    return {
        ...content,
        rawText: normalized,
        rawTextOriginal: original
    };
};

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
 * Detect if URL is from Naver Blog
 */
const isNaverBlog = (url: string): boolean => {
    const lower = url.toLowerCase();
    return lower.includes('blog.naver.com') || lower.includes('m.blog.naver.com');
};

/**
 * Convert Naver Blog URL to mobile version for better extraction
 * Mobile version doesn't use iframes
 */
const convertToNaverMobile = (url: string): string => {
    // Already mobile
    if (url.includes('m.blog.naver.com')) {
        return url;
    }
    // Convert to mobile
    return url.replace('blog.naver.com', 'm.blog.naver.com');
};

/**
 * Main content fetcher with smart fallback strategy
 * 
 * Strategy:
 * 1. Social media → Puppeteer first (accurate metadata)
 * 2. If Puppeteer result weak → Jina for text, keep Puppeteer metadata
 * 3. Naver Blog → Mobile version + Jina Reader
 * 4. General web → Jina Reader
 */
export const fetchUrlContent = async (url: string): Promise<FetchedUrlContent> => {
    // SSRF Prevention: Validate URL before any network request
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
        console.error(`[Content Fetcher] SSRF blocked: ${urlValidation.error}`);
        return { rawText: '', images: [] };
    }

    try {
        // Detect platform
        const urlLower = url.toLowerCase();
        let platform = 'web';
        if (urlLower.includes('threads.net') || urlLower.includes('threads.com')) {
            platform = 'threads';
        } else if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) {
            platform = 'instagram';
        }

        // STRATEGY 1: Social media → Use Puppeteer
        if (isSocialMedia(url)) {
            console.log(`[Content Fetcher] Social media detected (${platform}), using Puppeteer`);
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
                return platform === 'threads'
                    ? applyThreadsNormalization(puppeteerResult)
                    : puppeteerResult;
            }

            // Weak result → Try Jina for text, keep Puppeteer metadata
            console.warn('[Content Fetcher] Weak Puppeteer result, trying Jina fallback');
            console.log(`[Content Fetcher] Weak reason: ${puppeteerResult.rawText.length} chars, ${puppeteerResult.images.length} images, loginGate: ${hasLoginGate}`);

            let jinaUrl = url;
            if (url.includes('threads.com')) {
                jinaUrl = url.replace('threads.com', 'threads.net');
                console.log(`[Content Fetcher] Canonicalized: threads.com → threads.net`);
            }

            // Pass platform and authorHandle to Jina for specialized parsing
            const authorHandle = puppeteerResult.authorHandle || '';
            const jinaResult = await extractWithJina(jinaUrl, platform, authorHandle);

            if (jinaResult.rawText && jinaResult.rawText.length > 50) {
                console.log('[Content Fetcher] Jina fallback succeeded, merging with Puppeteer metadata');

                // MERGE: Jina text + Puppeteer metadata
                const merged = {
                    rawText: jinaResult.rawText,
                    htmlContent: jinaResult.htmlContent || puppeteerResult.htmlContent,
                    images: puppeteerResult.images.length > 0 ? puppeteerResult.images : jinaResult.images,
                    author: puppeteerResult.author || jinaResult.author,
                    authorAvatar: puppeteerResult.authorAvatar || jinaResult.authorAvatar,
                    authorHandle: puppeteerResult.authorHandle || jinaResult.authorHandle,
                    finalUrl: jinaUrl
                };

                return platform === 'threads'
                    ? applyThreadsNormalization(merged)
                    : merged;
            }

            console.warn('[Content Fetcher] Jina also failed, returning weak Puppeteer result');
            return platform === 'threads'
                ? applyThreadsNormalization(puppeteerResult)
                : puppeteerResult;
        }

        // STRATEGY 2: Naver Blog → Use mobile version for better extraction
        if (isNaverBlog(url)) {
            const mobileUrl = convertToNaverMobile(url);
            console.log(`[Content Fetcher] Naver Blog detected, using mobile version: ${mobileUrl}`);

            const naverResult = await extractWithJina(mobileUrl);

            if (naverResult.rawText && naverResult.rawText.length > 50) {
                console.log('[Content Fetcher] Naver Blog extraction succeeded');
                const normalizedText = normalizeNaverBlog(naverResult.rawText);
                console.log(`[Content Fetcher] Naver normalized: ${naverResult.rawText.length} -> ${normalizedText.length} chars`);
                return {
                    ...naverResult,
                    rawText: normalizedText,
                    finalUrl: url // Keep original URL for display
                };
            }

            console.warn('[Content Fetcher] Naver Blog extraction weak, trying Puppeteer');
            const puppeteerResult = await extractWithPuppeteer(mobileUrl);
            if (puppeteerResult.rawText && puppeteerResult.rawText.length > 50) {
                const normalizedText = normalizeNaverBlog(puppeteerResult.rawText);
                return {
                    ...puppeteerResult,
                    rawText: normalizedText,
                    finalUrl: url
                };
            }

            console.warn('[Content Fetcher] Naver Blog extraction failed');
            return {
                ...naverResult,
                rawText: normalizeNaverBlog(naverResult.rawText || ''),
                finalUrl: url
            };
        }

        // STRATEGY 3: General web → Jina Reader
        console.log('[Content Fetcher] Using Jina Reader');
        const jinaDirect = await extractWithJina(url);

        // Apply appropriate normalization based on platform
        if (platform === 'threads') {
            return applyThreadsNormalization(jinaDirect);
        } else {
            // Apply web normalization to clean up markdown artifacts
            return applyWebNormalization(jinaDirect);
        }

    } catch (error) {
        console.error('[Content Fetcher] Error:', error);
        return { rawText: '', images: [] };
    }
};


/**
 * Clean markdown content from Jina Reader
 * Removes image links, JSON patterns, and UI noise
 */
const cleanMarkdownContent = (content: string, platform: string = '', authorHandle: string = ''): string => {
    if (!content) return '';

    // Use specialized normalizer for Threads
    if (platform === 'threads') {
        return normalizeThreads(content);
    }

    let cleaned = content;

    // Step 1: Remove markdown image links ![...](...) 
    cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

    // Step 2: Remove Image X: [description](...) patterns
    cleaned = cleaned.replace(/\[?Image\s*\d*:?\s*[^\]]*\]?\([^)]+\)/gi, '');
    cleaned = cleaned.replace(/\[Image\s*\d+:.*?\]/gi, '');

    // Step 3: Remove raw URL lines (standalone URLs)
    cleaned = cleaned.replace(/^https?:\/\/[^\s]+$/gm, '');

    // Step 4: Remove lines that are just numbers (view counts, likes etc)
    cleaned = cleaned.replace(/^\d+\s*$/gm, '');
    cleaned = cleaned.replace(/^\d+[KkMm]?\s*(likes?|views?|reposts?|replies?|comments?)?\s*$/gim, '');

    // Step 5: Remove UI elements and navigation text (common patterns)
    const uiPatterns = [
        /^Translate$/gim,
        /^-Author$/gim,
        /^Author$/gim,
        /^View all \d+ replies?$/gim,
        /^Show more$/gim,
        /^Hide$/gim,
        /^Share$/gim,
        /^Reply$/gim,
        /^Repost$/gim,
        /^Quote$/gim,
        /^Like$/gim,
        /^Log in.*$/gim,
        /^Sign up.*$/gim,
        /^Create new account.*$/gim,
        /^Forgot password.*$/gim,
        /^Log in with Facebook$/gim,
        /^About.*Meta.*$/gim,
        /^\[Meta\].*$/gim,
        /^\[About\].*$/gim,
        /^\[Blog\].*$/gim,
        /^\[Jobs\].*$/gim,
        /^\[Help\].*$/gim,
        /^\* \* \*$/gm,
        /^• • •$/gm,
        /^Sorry, we're having trouble playing this video\.?$/gim,
    ];

    for (const pattern of uiPatterns) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Step 6: Remove lines with only special characters
    cleaned = cleaned.replace(/^[\s\*\-•·\|=_]+$/gm, '');

    // Step 7: Remove empty link patterns
    cleaned = cleaned.replace(/\[\]\([^\)]+\)/g, '');

    // Step 8: Clean up excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/^\s+|\s+$/g, '');

    return cleaned.trim();
};

/**
 * Extract content using Jina Reader API
 */
const extractWithJina = async (url: string, platform: string = '', authorHandle: string = ''): Promise<FetchedUrlContent> => {
    try {
        console.log(`[Jina Reader] Fetching content for: ${url} (platform: ${platform || 'unknown'})`);

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
        const rawContent = data.data?.content || data.content || '';

        if (!rawContent || rawContent.length < 20) {
            console.warn('[Jina Reader] Insufficient content returned');
            return { rawText: '', images: [] };
        }

        // Extract images BEFORE cleaning
        const images = extractImagesFromMarkdown(rawContent);

        // Clean the content for text display - pass platform for specialized parsing
        const cleanedContent = cleanMarkdownContent(rawContent, platform, authorHandle);

        console.log(`[Jina Reader] Success: ${rawContent.length} chars raw, ${cleanedContent.length} chars cleaned, ${images.length} images`);

        return {
            rawText: cleanedContent,
            htmlContent: undefined,
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
