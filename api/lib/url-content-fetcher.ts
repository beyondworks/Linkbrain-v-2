
/**
 * URL Content Fetcher
 * 
 * Fetches content from URLs using Jina Reader API
 * Gracefully degrades on failure (returns empty content instead of throwing)
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface FetchedUrlContent {
    rawText: string;
    htmlContent?: string;
    images: string[];
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

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Fetch URL content using Jina Reader API
 * 
 * @param url - The URL to fetch content from
 * @returns FetchedUrlContent with rawText, htmlContent, and images
 * 
 * NOTE: This function NEVER throws. On any error, it returns empty content.
 * This enables graceful degradation to URL-only clips.
 */
export const fetchUrlContent = async (url: string): Promise<FetchedUrlContent> => {
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
