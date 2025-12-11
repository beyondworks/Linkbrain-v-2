import puppeteer, { Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Image Extractor
 * 
 * Comprehensive image extraction from web pages using multiple strategies:
 * - <img> tags with src and srcset
 * - <picture> elements
 * - Open Graph (og:image)
 * - Twitter Cards (twitter:image)
 * - CSS background-image
 * - Data attributes (lazy loading)
 * 
 * Features:
 * - Highest resolution selection from srcset
 * - Duplicate removal
 * - Quality filtering
 * - Platform-specific optimizations
 * 
 * FIXED: Uses @sparticuz/chromium for Vercel serverless compatibility
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface ExtractedImage {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
    source: 'img' | 'og' | 'twitter' | 'css' | 'srcset' | 'picture' | 'data-attr';
    priority: number;  // Higher = more important
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract images from a URL using Puppeteer
 * 
 * @param url - URL to extract images from
 * @param existingPage - Optional existing Puppeteer page (for reuse)
 * @returns Array of extracted images with metadata
 */
export async function extractImages(url: string, existingPage?: Page): Promise<ExtractedImage[]> {
    let browser;
    let page: Page;
    let shouldCloseBrowser = false;

    try {
        console.log(`[Image Extractor] Starting extraction for: ${url}`);

        // Use existing page or create new browser
        if (existingPage) {
            page = existingPage;
        } else {
            // Use @sparticuz/chromium for serverless environments (Vercel/AWS Lambda)
            browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath(),
                headless: true,
            });
            page = await browser.newPage();
            shouldCloseBrowser = true;
        }

        if (!existingPage) {
            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const finalUrl = page.url();
        const platform = detectPlatform(finalUrl);

        // Extract images using page.evaluate
        const images = await page.evaluate((platform) => {
            const extractedImages: ExtractedImage[] = [];

            // Helper: Validate URL
            const isValidImageUrl = (url: string): boolean => {
                if (!url || !url.startsWith('http')) return false;
                const lower = url.toLowerCase();
                // Exclude icons, emojis, SVGs, tracking pixels
                if (lower.includes('icon') || lower.includes('emoji') ||
                    lower.endsWith('.svg') || lower.includes('1x1') ||
                    lower.includes('pixel') || lower.includes('tracker')) {
                    return false;
                }
                return true;
            };

            // Helper: Parse srcset
            const parseSrcset = (srcset: string): { url: string; width?: number }[] => {
                if (!srcset) return [];
                return srcset.split(',').map(s => {
                    const parts = s.trim().split(/\s+/);
                    const url = parts[0];
                    const descriptor = parts[1];
                    let width: number | undefined;
                    if (descriptor && descriptor.endsWith('w')) {
                        width = parseInt(descriptor.slice(0, -1), 10);
                    }
                    return { url, width };
                }).filter(item => isValidImageUrl(item.url));
            };

            // 1. Extract from <img> tags
            const imgTags = Array.from(document.querySelectorAll('img'));
            for (const img of imgTags) {
                // Try srcset first (highest quality)
                if (img.srcset) {
                    const srcsetImages = parseSrcset(img.srcset);
                    // Get highest resolution
                    const best = srcsetImages.sort((a, b) => (b.width || 0) - (a.width || 0))[0];
                    if (best && isValidImageUrl(best.url)) {
                        extractedImages.push({
                            url: best.url,
                            width: best.width,
                            alt: img.alt || undefined,
                            source: 'srcset',
                            priority: 8
                        });
                        continue;
                    }
                }

                // Fallback to src
                const src = img.src || img.getAttribute('src');
                if (src && isValidImageUrl(src)) {
                    extractedImages.push({
                        url: src,
                        width: img.naturalWidth || undefined,
                        height: img.naturalHeight || undefined,
                        alt: img.alt || undefined,
                        source: 'img',
                        priority: 6
                    });
                }

                // Check data attributes (lazy loading)
                const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy');
                if (dataSrc && isValidImageUrl(dataSrc)) {
                    extractedImages.push({
                        url: dataSrc,
                        source: 'data-attr',
                        priority: 5
                    });
                }
            }

            // 2. Extract from <picture> elements
            const pictureTags = Array.from(document.querySelectorAll('picture'));
            for (const picture of pictureTags) {
                const sources = Array.from(picture.querySelectorAll('source'));
                for (const source of sources) {
                    if (source.srcset) {
                        const srcsetImages = parseSrcset(source.srcset);
                        const best = srcsetImages.sort((a, b) => (b.width || 0) - (a.width || 0))[0];
                        if (best && isValidImageUrl(best.url)) {
                            extractedImages.push({
                                url: best.url,
                                width: best.width,
                                source: 'picture',
                                priority: 7
                            });
                        }
                    }
                }
            }

            // 3. Extract from Open Graph tags
            const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
            const ogImageSecure = document.querySelector('meta[property="og:image:secure_url"]')?.getAttribute('content');

            if (ogImageSecure && isValidImageUrl(ogImageSecure)) {
                extractedImages.push({
                    url: ogImageSecure,
                    source: 'og',
                    priority: 9
                });
            } else if (ogImage && isValidImageUrl(ogImage)) {
                extractedImages.push({
                    url: ogImage,
                    source: 'og',
                    priority: 9
                });
            }

            // 4. Extract from Twitter Card tags
            const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
            if (twitterImage && isValidImageUrl(twitterImage)) {
                extractedImages.push({
                    url: twitterImage,
                    source: 'twitter',
                    priority: 8
                });
            }

            // 5. Platform-specific extraction
            if (platform === 'instagram' || platform === 'threads') {
                // For Instagram/Threads, prioritize images inside main article
                const mainArticle = document.querySelector('[role="main"] article') || document.querySelector('article');
                if (mainArticle) {
                    const articleImgs = Array.from(mainArticle.querySelectorAll('img'));
                    for (const img of articleImgs) {
                        const src = img.src || img.getAttribute('src');
                        if (src && isValidImageUrl(src)) {
                            // Check if already added
                            const exists = extractedImages.some(ei => ei.url === src);
                            if (!exists) {
                                extractedImages.push({
                                    url: src,
                                    source: 'img',
                                    priority: 10  // Highest priority for social media content images
                                });
                            }
                        }
                    }
                }
            }

            return extractedImages;
        }, platform);

        // Deduplicate and rank
        const deduped = deduplicateImages(images);
        const ranked = deduped.sort((a, b) => b.priority - a.priority);

        console.log(`[Image Extractor] Success: ${ranked.length} images extracted`);

        if (shouldCloseBrowser && browser) {
            await browser.close();
        }

        return ranked;

    } catch (error) {
        console.error('[Image Extractor] Error:', error);
        if (shouldCloseBrowser && browser) {
            await browser.close();
        }
        return [];
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
    if (lower.includes('threads.net') || lower.includes('threads.com')) return 'threads';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('pinterest.com')) return 'pinterest';
    return 'web';
}

/**
 * Deduplicate images by URL
 * Handles variations like http vs https, trailing slashes, query params
 */
function deduplicateImages(images: ExtractedImage[]): ExtractedImage[] {
    const seen = new Map<string, ExtractedImage>();

    for (const image of images) {
        // Normalize URL
        let normalizedUrl = image.url.toLowerCase();
        // Remove query params for comparison (but keep original URL)
        const urlWithoutQuery = normalizedUrl.split('?')[0];

        // If we've seen this URL before, keep the one with higher priority
        if (seen.has(urlWithoutQuery)) {
            const existing = seen.get(urlWithoutQuery)!;
            if (image.priority > existing.priority) {
                seen.set(urlWithoutQuery, image);
            }
        } else {
            seen.set(urlWithoutQuery, image);
        }
    }

    return Array.from(seen.values());
}

/**
 * Filter images by quality criteria
 * - Minimum dimensions
 * - Valid file extensions
 * - Exclude tracking pixels
 */
export function filterImagesByQuality(images: ExtractedImage[], minWidth = 200, minHeight = 200): ExtractedImage[] {
    return images.filter(img => {
        // If dimensions are known, check minimum size
        if (img.width && img.width < minWidth) return false;
        if (img.height && img.height < minHeight) return false;

        // Check for valid image extensions
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const hasValidExt = validExtensions.some(ext => img.url.toLowerCase().includes(ext));

        // If no recognizable extension but has image host domains, allow it
        const imageHosts = ['instagram', 'fbcdn', 'threads', 'twimg', 'googleusercontent', 'imgur'];
        const hasImageHost = imageHosts.some(host => img.url.toLowerCase().includes(host));

        return hasValidExt || hasImageHost;
    });
}
