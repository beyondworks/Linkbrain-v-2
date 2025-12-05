
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
 * Normalize Threads text: keep author's main text + 번호 매긴 본문/댓글을 정돈하고, 불필요한 잡음을 제거한다.
 * - parseThreadsContent는 numbered comment만 유지하고 기타 반응/감탄 댓글을 필터한다.
 */
const normalizeThreadsText = (content: FetchedUrlContent): FetchedUrlContent => {
    const parsed = parseThreadsContent(
        content.rawText || '',
        content.authorHandle || content.author || ''
    );
    return { ...content, rawText: parsed };
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
 * Main content fetcher with smart fallback strategy
 * 
 * Strategy:
 * 1. Social media → Puppeteer first (accurate metadata)
 * 2. If Puppeteer result weak → Jina for text, keep Puppeteer metadata
 * 3. General web → Jina Reader
 */
export const fetchUrlContent = async (url: string): Promise<FetchedUrlContent> => {
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
                    ? normalizeThreadsText(puppeteerResult)
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
                    ? normalizeThreadsText(merged)
                    : merged;
            }

            console.warn('[Content Fetcher] Jina also failed, returning weak Puppeteer result');
            return platform === 'threads'
                ? normalizeThreadsText(puppeteerResult)
                : puppeteerResult;
        }

        // STRATEGY 2: General web → Jina Reader
        console.log('[Content Fetcher] Using Jina Reader');
        const jinaDirect = await extractWithJina(url);
        return platform === 'threads'
            ? normalizeThreadsText(jinaDirect)
            : jinaDirect;

    } catch (error) {
        console.error('[Content Fetcher] Error:', error);
        return { rawText: '', images: [] };
    }
};

/**
 * Parse and format Threads content
 * - Remove ALL links and markdown formatting
 * - Split content by "-Author" or "·Author" markers
 * - First section = main content, rest = comments
 * - Filter out noise from other threads
 */
const parseThreadsContent = (content: string, authorHandle: string = ''): string => {
    if (!content) return '';

    console.log(`[Threads Parser] Processing content for: ${authorHandle}`);

    // Step 1: Remove ALL links and markdown noise
    let cleaned = content
        // Remove all markdown links [text](url) - including incomplete ones
        .replace(/\[[^\]]*\]\([^\)]*\)/g, '')
        // Remove leftover ]() patterns
        .replace(/\]\(\)/g, '')
        .replace(/\]\s*\(\s*\)/g, '')
        // Remove all image markdown ![text](url)
        .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
        // Remove standalone URLs
        .replace(/https?:\/\/[^\s\)]+/g, '')
        // Remove Image N: descriptions  
        .replace(/\[?Image\s*\d+[:\]]?[^\n]*/gi, '')
        // Remove equals lines (=====)
        .replace(/={3,}/g, '')
        // Remove like/share counts (1.4K 1.3K, 10 10, etc.)
        .replace(/\b\d+\.?\d*K?\s+\d+\.?\d*K?\b/g, '')
        // Remove common UI noise
        .replace(/^Sorry, we're having trouble playing this video\.?$/gim, '')
        .replace(/^Translate$/gim, '')
        .replace(/^View all \d+ replies?$/gim, '')
        .replace(/^Log in$/gim, '')
        .replace(/^Sign up$/gim, '')
        .replace(/^Related threads$/gim, '')
        .replace(/^Log in to see more replies\.?$/gim, '')
        .replace(/^Report a problem$/gim, '')
        .replace(/^\* \d{4} \*$/gim, '')
        // Remove standalone numbers
        .replace(/^\d+$/gm, '')
        // Remove decorative lines
        .replace(/^[\*\-•·=\s]+$/gm, '')
        // Normalize whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    // Step 2: Split by "-Author" or "·Author" markers
    const sections = cleaned.split(/[-·]Author\s*/i).filter(s => s.trim().length > 0);

    if (sections.length === 0) {
        return cleaned;
    }

    // Detect if main content is primarily Korean
    const isKoreanContent = (text: string): boolean => {
        const koreanChars = (text.match(/[가-힣]/g) || []).length;
        const totalChars = text.replace(/\s/g, '').length;
        return koreanChars / totalChars > 0.3;
    };

    // Detect noise patterns from other threads
    const isNoiseContent = (text: string, mainIsKorean: boolean): boolean => {
        // Hashtag clusters (3+ hashtags) indicate other threads
        const hashtagCount = (text.match(/#[a-zA-Z가-힣]+/g) || []).length;
        if (hashtagCount >= 3) return true;

        // If main content is Korean, long English-only sentences are likely noise
        if (mainIsKorean) {
            const words = text.split(/\s+/);
            const englishWords = words.filter(w => /^[a-zA-Z]+$/.test(w)).length;
            // More than 70% English words in a Korean post = noise
            if (words.length > 10 && englishWords / words.length > 0.7) return true;
        }

        // Common patterns from unrelated threads
        const noisePatterns = [
            /Christmas ain't Christmas/i,
            /Misery Business by Paramore/i,
            /TIED THE GAME/i,
            /Tesla \(TSLA\)/i,
            /Amazon data center/i,
            /Rolling Stone/i,
            /buttered prawns/i,
            /Independent Spirit Award/i,
            /Congrats to.*nominee/i,
            /#amithersonlyone/i,
            /#canaldujent/i,
            /not for publication/i,
            /Pensa J-/i,
            /Plum Crazy/i,
            /Best Breakthrough Performance/i,
        ];

        for (const pattern of noisePatterns) {
            if (pattern.test(text)) return true;
        }

        return false;
    };

    // Step 3: Clean each section
    const cleanSection = (text: string): string => {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
                if (line.length < 3) return false;
                // Skip Korean names only (2-10 chars)
                if (line.match(/^[가-힣]{2,10}$/) && line.length < 15) return false;
                // Skip timestamps  
                if (line.match(/^\d+\s*(분|시간|일)\s*전$/)) return false;
                // Skip leftover empty patterns
                if (line.match(/^[\[\]\(\)\s]+$/)) return false;
                return true;
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            // Clean up any remaining ]() patterns
            .replace(/\]\s*\(\s*\)/g, '')
            .replace(/\[\s*\]/g, '')
            .trim();
    };

    // First section is main content
    let mainContent = cleanSection(sections[0]);

    // Detect if this is Korean content
    const mainIsKorean = isKoreanContent(mainContent);

    // Remove duplicate content: if first 50 chars appear twice, remove the duplicate
    const first50 = mainContent.substring(0, 50);
    const secondOccurrence = mainContent.indexOf(first50, 50);
    if (secondOccurrence > 0 && first50.length >= 20) {
        mainContent = mainContent.substring(0, secondOccurrence).trim();
    }

    // Rest are comments (if any) - filter out noise
    const comments = sections.slice(1)
        .map(s => cleanSection(s))
        .filter(s => s.length > 10)
        .filter(s => !isNoiseContent(s, mainIsKorean));

    console.log(`[Threads Parser] Main content: ${mainContent.length} chars, Comments: ${comments.length}`);

    // Step 4: Build output with COMMENT_DIVIDER markers for UI
    let output = mainContent;

    if (comments.length > 0) {
        output += '\n\n**COMMENTS_SECTION**\n';
        output += comments.join('\n**COMMENT_DIVIDER**\n');
    }

    return output;
};


/**
 * Clean markdown content from Jina Reader
 * Removes image links, JSON patterns, and UI noise
 */
const cleanMarkdownContent = (content: string, platform: string = '', authorHandle: string = ''): string => {
    if (!content) return '';

    // Use specialized parser for Threads
    if (platform === 'threads') {
        return parseThreadsContent(content, authorHandle);
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
