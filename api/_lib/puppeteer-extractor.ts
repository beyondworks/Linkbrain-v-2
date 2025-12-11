// @ts-nocheck
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

interface PuppeteerResult {
    text: string;
    images: string[];
    html: string;
    author?: string;
    authorAvatar?: string;
    authorHandle?: string;
}

/**
 * Extract content using Puppeteer (headless browser)
 * Priority for social media platforms
 * 
 * ENHANCED: Better Instagram & Threads extraction with improved profile matching
 * FIXED: Uses @sparticuz/chromium for Vercel serverless compatibility
 */
export const extractWithPuppeteer = async (url: string): Promise<{
    rawText: string;
    htmlContent?: string;
    images: string[];
    author?: string;
    authorAvatar?: string;
    authorHandle?: string;
    finalUrl?: string;
}> => {
    let browser;

    try {
        console.log(`[Puppeteer] Starting extraction for: ${url}`);

        // Use @sparticuz/chromium for serverless environments (Vercel/AWS Lambda)
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

        const finalUrl = page.url();
        console.log('[Puppeteer] Final URL:', finalUrl);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const data: PuppeteerResult = await page.evaluate((finalUrl) => {
            const url = finalUrl.toLowerCase();

            // Helper functions
            const getText = (selector: string): string => {
                try {
                    return document.querySelector(selector)?.textContent?.trim() || '';
                } catch { return ''; }
            };

            const getAllText = (selector: string): string[] => {
                try {
                    return Array.from(document.querySelectorAll(selector))
                        .map(el => el.textContent?.trim() || '')
                        .filter(t => t.length > 0);
                } catch { return []; }
            };

            // THREADS (ENHANCED - v2)
            if (url.includes('threads.net') || url.includes('threads.com') || url.includes('www.threads')) {
                const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
                const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';

                // ===== Extract author handle and name =====
                let authorHandle = '';
                let authorName = '';

                // Try 1: Extract from og:title pattern "username (@handle) on Threads: ..."
                if (ogTitle) {
                    // Pattern: "username (@handle) on Threads:"
                    let match = ogTitle.match(/^([^(]+)\s*\(@([a-zA-Z0-9_.]+)\)/);
                    if (match) {
                        authorName = match[1].trim();
                        authorHandle = match[2];
                    } else {
                        // Pattern: "@handle on Threads:"
                        match = ogTitle.match(/@([a-zA-Z0-9_.]+)/);
                        if (match) {
                            authorHandle = match[1];
                        }
                    }
                }

                // Try 2: Find author info in DOM header
                if (!authorHandle) {
                    const headerLink = document.querySelector('header a[href^="/@"]');
                    if (headerLink) {
                        const text = headerLink.textContent?.trim() || '';
                        authorHandle = text.replace('@', '');
                    }
                }

                // ===== Extract author avatar =====
                let authorAvatar = '';
                // Look for profile image in header (first img that's not an icon)
                const headerImgs = Array.from(document.querySelectorAll('header img'));
                for (const img of headerImgs) {
                    const src = img.src || img.getAttribute('src');
                    if (src && src.startsWith('http') && !src.includes('icon') && !src.includes('emoji')) {
                        authorAvatar = src;
                        break;
                    }
                }
                // Fallback to og:image
                if (!authorAvatar && ogImage) {
                    authorAvatar = ogImage;
                }

                // ===== Extract main post content (author's own post only) =====
                // Find the main article/post section
                const mainArticle = document.querySelector('[role="main"] article') ||
                    document.querySelector('article[data-testid]') ||
                    document.querySelector('article');

                let postText = '';
                if (mainArticle) {
                    // Get all text from the main post (first article in main)
                    const textElements = Array.from(mainArticle.querySelectorAll('div[dir="auto"], p, span'));
                    const contentLines: string[] = [];

                    for (const el of textElements) {
                        const text = el.textContent?.trim() || '';

                        // Skip if too short or is UI element
                        if (text.length < 3) continue;
                        if (text.match(/^(like|reply|share|repost|view|follow|•|likes?|replies|reposts?|verified|ago|스레드|조회|회|댓글)$/i)) continue;
                        if (text.match(/^\d+\s*(likes?|replies?|reposts?|views?)/i)) continue;
                        if (text.match(/^(ago|week|day|month|year|hour|minute|second)s?$/i)) continue;
                        if (text.startsWith('http')) continue;
                        if (text.includes('조회') && text.includes('회') && text.length < 20) continue;

                        // Add substantial text
                        if (text.length > 10) {
                            contentLines.push(text);
                        }
                    }

                    postText = contentLines.join('\n');
                }

                // Fallback to article innerText
                if (!postText && mainArticle) {
                    postText = mainArticle.innerText?.substring(0, 5000) || '';
                }

                // ===== Extract images and videos from post content =====
                const imageSet = new Set<string>();

                // Find img tags in the main article
                if (mainArticle) {
                    const imgs = Array.from(mainArticle.querySelectorAll('img'));
                    for (const img of imgs) {
                        const src = img.src || img.getAttribute('src');
                        if (!src || !src.startsWith('http')) continue;

                        const alt = (img.alt || '').toLowerCase();
                        const className = (img.className || '').toLowerCase();
                        const width = img.naturalWidth || img.width || 0;
                        const height = img.naturalHeight || img.height || 0;
                        const area = width * height;

                        // Filter 1: Skip based on alt text
                        if (alt.includes('profile picture') || alt.includes('프로필 사진')) continue;

                        // Filter 2: Skip based on class name
                        if (className.includes('avatar') || className.includes('profile') || className.includes('user')) continue;

                        // Filter 3: Skip very small images (likely icons or emojis) - if dimensions are available
                        // Increased threshold to 150x150 to avoid profile pics and small thumbnails
                        if (area > 0 && area < 150 * 150) continue;

                        // Filter 4: Skip specific URL patterns (redundant with backend filter but good for early optimization)
                        const lower = src.toLowerCase();
                        if (lower.includes('s150x150') || lower.includes('p50x50')) continue;
                        if (lower.includes('emoji') || lower.endsWith('.svg')) continue;

                        // Filter 5: Viewport position check (CRITICAL)
                        // Exclude images that are too far down (likely recommended posts or comments)
                        // Reduced to 1000px to be safer
                        const rect = img.getBoundingClientRect();
                        if (rect.top > 1000) continue;

                        // Filter 6: Aspect ratio check (exclude extreme aspect ratios like banners)
                        const ratio = width / height;
                        if (ratio > 3 || ratio < 0.3) continue;

                        imageSet.add(src);
                    }
                }

                // Add og:image if not already included
                if (ogImage && !Array.from(imageSet).some(img => img.includes(ogImage.split('/').pop() || ''))) {
                    imageSet.add(ogImage);
                }

                let images = Array.from(imageSet).slice(0, 20);

                console.log('[Threads] Handle: ' + authorHandle + ', Author: ' + authorName + ', Images: ' + images.length);

                return {
                    text: postText,
                    images,
                    html: '',
                    author: authorName || authorHandle ? (authorName ? authorName : `@${authorHandle}`) : '',
                    authorAvatar,
                    authorHandle
                };
            }

            // INSTAGRAM (CRITICAL FIX - Only extract actual post images)
            if (url.includes('instagram.com') || url.includes('instagr.am')) {
                const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
                const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
                const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
                const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

                // ===== Extract handle more accurately from DOM and og:title =====
                let authorHandle = '';

                // Try 1: Extract from DOM header (most reliable)
                const headerLink = document.querySelector('header a[href^="/"]');
                if (headerLink) {
                    authorHandle = headerLink.textContent?.trim() || '';
                    // Remove @ if present
                    if (authorHandle.startsWith('@')) {
                        authorHandle = authorHandle.substring(1);
                    }
                }

                // Try 2: Extract from og:title as fallback
                if (!authorHandle && ogTitle) {
                    // Korean: "Instagram의 username님"
                    let match = ogTitle.match(/Instagram의\s*([^\s님:]+)님?/);
                    if (match) {
                        authorHandle = match[1];
                    }
                    // English: "username on Instagram"
                    if (!authorHandle) {
                        match = ogTitle.match(/^([^\s:]+)\s+on\s+Instagram/i);
                        if (match) {
                            authorHandle = match[1];
                        }
                    }
                }

                // ===== Extract author avatar =====
                let authorAvatar = '';
                // Try to find profile image in header
                const profileImg = document.querySelector('header img[alt]');
                if (profileImg) {
                    const src = profileImg.src || profileImg.getAttribute('src');
                    if (src && src.includes('instagram')) {
                        authorAvatar = src;
                    }
                }
                // Fallback to og:image
                if (!authorAvatar && ogImage) {
                    authorAvatar = ogImage;
                }

                // ===== CAPTION EXTRACTION - Focus on actual post content =====
                let caption = '';

                // Strategy 1: Find caption from the post content section
                // Instagram stores caption in specific div structures
                const mainArticle = document.querySelector('[role="main"] article') || document.querySelector('article');
                if (mainArticle) {
                    // Look for the actual caption text (usually in the first large text block after author)
                    const allDivs = Array.from(mainArticle.querySelectorAll('div[dir="auto"], span, p'));

                    for (const el of allDivs) {
                        const text = el.textContent?.trim() || '';

                        // Skip if too short or is UI element
                        if (text.length < 5) continue;
                        if (text.match(/^(like|comment|share|visit|view|profile|follow|message|comments?|likes?|shares?|view all|show more|hide|expand|save|send|report|copy link)$/i)) continue;
                        if (text.match(/^\d+\s*(likes?|comments?|shares?|saves?|views?)/i)) continue;
                        if (text.match(/^(ago|week|day|month|year|hour|minute|second)s?$/i)) continue;
                        if (text.includes('http')) continue;

                        // If we found substantial text, it's likely the caption
                        if (text.length > 20) {
                            caption = text;
                            break;
                        }
                    }
                }

                // Strategy 2: Try meta description (backup)
                if (!caption || caption.length < 20) {
                    caption = metaDescription || ogDescription;
                }

                // Strategy 3: Combine multiple elements if single one is insufficient
                if (!caption || caption.length < 20) {
                    const textBlocks = Array.from(mainArticle?.querySelectorAll('div[dir="auto"], p') || [])
                        .map(el => {
                            const text = el.textContent?.trim() || '';
                            if (text.length < 5) return '';
                            if (text.match(/^(like|comment|share)$/i)) return '';
                            if (text.match(/^\d+\s*(likes?|comments?)/i)) return '';
                            return text;
                        })
                        .filter(t => t.length > 0 && t.length < 500);

                    if (textBlocks.length > 0) {
                        caption = textBlocks.slice(0, 5).join('\n');
                    }
                }

                // Trim if too long
                if (caption && caption.length > 2000) {
                    caption = caption.substring(0, 2000) + '...';
                }

                console.log('[Instagram] Handle: ' + authorHandle + ', Caption: ' + caption.substring(0, 100));

                // ===== Image extraction - ONLY MAIN POST IMAGES =====
                const imageSet = new Set<string>();

                // CRITICAL: Only extract images from the FIRST article (main post)
                // This avoids capturing images from "More posts" or "Recommended" sections
                // mainArticle is already defined above for caption extraction

                if (mainArticle) {
                    // Get all images in the main article
                    const imgs = Array.from(mainArticle.querySelectorAll('img'));

                    for (const img of imgs) {
                        // 1. Viewport Position Check (Stricter)
                        // Main post images are always near the top.
                        // Anything below 1200px is likely comments or recommended posts.
                        const rect = img.getBoundingClientRect();
                        if (rect.top > 1200) continue;
                        if (rect.width < 200) continue; // Must be at least 200px wide (excludes profile pics)
                        if (rect.height < 200) continue; // Must be at least 200px tall

                        // 2. Srcset Check (High Resolution)
                        // Main post images usually have srcset with high-res options
                        let isHighRes = false;
                        let bestUrl = '';

                        if (img.srcset) {
                            // Check if it has large variants (e.g., 640w, 1080w)
                            if (img.srcset.includes('640w') || img.srcset.includes('720w') || img.srcset.includes('1080w')) {
                                isHighRes = true;
                                // Extract the largest URL from srcset
                                const candidates = img.srcset.split(',')
                                    .map(s => {
                                        const parts = s.trim().split(' ');
                                        return { url: parts[0], width: parseInt(parts[1] || '0') };
                                    })
                                    .sort((a, b) => b.width - a.width);

                                if (candidates.length > 0) {
                                    bestUrl = candidates[0].url;
                                }
                            }
                        }

                        // 3. Fallback to src if high res, or if it looks like a main image
                        if (!bestUrl) {
                            bestUrl = img.src || img.getAttribute('src') || '';
                        }

                        // 4. Final Validation
                        if (bestUrl && bestUrl.startsWith('http')) {
                            const lower = bestUrl.toLowerCase();

                            // Exclude known patterns
                            if (lower.includes('profile') || lower.includes('avatar') || lower.includes('icon')) continue;
                            if (lower.includes('s150x150') || lower.includes('p50x50')) continue;
                            if (lower.endsWith('.svg') || lower.includes('emoji')) continue;

                            // Exclude if alt text indicates profile
                            const alt = (img.alt || '').toLowerCase();
                            if (alt.includes('profile picture') || alt.includes('프로필 사진')) continue;

                            imageSet.add(bestUrl);
                        }
                    }
                }

                // Only add og:image as first/primary image if no images found
                let images = Array.from(imageSet);
                if (images.length === 0 && ogImage) {
                    images = [ogImage];
                }

                // Remove duplicates and limit to actual post images (usually 1-10 for carousel)
                images = [...new Set(images)].slice(0, 20);

                console.log('[Instagram] Images extracted: ' + images.length);

                return {
                    text: caption,
                    images,
                    html: '',
                    author: authorHandle ? authorHandle : '',
                    authorAvatar,
                    authorHandle
                };
            }

            // WEB/BLOG
            const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
            const content = document.querySelector('article') || document.querySelector('main') || document.body;
            const headings = getAllText('h1, h2, h3').slice(0, 10);
            const paragraphs = getAllText('p').filter(p => p.length > 50).slice(0, 20);
            const text = [...headings, ...paragraphs].join('\n\n');

            const allImgs = Array.from(document.querySelectorAll('img'))
                .map(img => img.src || img.getAttribute('src') || '')
                .filter(src => src && src.startsWith('http') && !src.endsWith('.svg'));

            let images = [...new Set(allImgs)];
            if (ogImage && !images.includes(ogImage)) {
                images = [ogImage, ...images];
            }

            return { text, images, html: content.innerHTML, author: '', authorAvatar: '', authorHandle: '' };
        }, finalUrl);

        await browser.close();

        console.log(`[Puppeteer] Success: ${data.text.length} chars, ${data.images.length} images`);
        if (data.author || data.authorHandle) {
            console.log(`[Puppeteer] Author: ${data.author || data.authorHandle}`);
        }

        return {
            rawText: data.text,
            htmlContent: data.html,
            images: data.images,
            author: data.author,
            authorAvatar: data.authorAvatar,
            authorHandle: data.authorHandle,
            finalUrl
        };
    } catch (error) {
        console.error('[Puppeteer] Error:', error);
        if (browser) await browser.close();
        return { rawText: '', images: [] };
    }
};
