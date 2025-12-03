/**
 * DOM Capture Script for Linkbrain
 * 
 * This is a reference implementation for capturing DOM content from web pages
 * and sending it to the Linkbrain API for archiving.
 * 
 * USAGE:
 * - Can be wrapped in a browser extension
 * - Can be used as a bookmarklet
 * - Captures main content, images, and text from the current page
 * 
 * DEPLOYMENT:
 * - Add Authorization header with user's Firebase token
 * - Update API_ENDPOINT to production URL
 */

(function () {
    'use strict';

    // Configuration
    const API_ENDPOINT = 'http://localhost:3000/api/dom-import'; // Update for production
    const USER_TOKEN = 'YOUR_USER_TOKEN_HERE'; // To be replaced with actual auth token

    // Utility: Detect main content area
    function findMainContent() {
        // Try to find the main content container in order of preference
        const selectors = [
            'article',
            'main',
            '[role="main"]',
            '.post-content',
            '.article-content',
            '#content',
            'body'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`[Linkbrain] Found main content: ${selector}`);
                return element;
            }
        }

        console.log('[Linkbrain] Using body as fallback');
        return document.body;
    }

    // Utility: Extract images from content
    function extractImages(contentElement) {
        const images = Array.from(contentElement.querySelectorAll('img'))
            .map(img => img.src)
            .filter(src => {
                // Filter out small icons, logos, and data URLs
                if (!src || src.startsWith('data:')) return false;
                if (src.includes('icon') || src.includes('logo') || src.includes('avatar')) {
                    // Allow if it's a large image
                    const img = contentElement.querySelector(`img[src="${src}"]`);
                    if (img && (img.naturalWidth < 100 || img.naturalHeight < 100)) {
                        return false;
                    }
                }
                return true;
            });

        // Remove duplicates
        return [...new Set(images)];
    }

    // Utility: Extract text from content
    function extractText(contentElement) {
        // Get text from meaningful elements
        const textElements = Array.from(
            contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span, div')
        );

        const textBlocks = textElements
            .map(el => el.innerText.trim())
            .filter(text => {
                // Filter out empty or very short text
                return text && text.length > 10;
            });

        // Remove duplicates while preserving order
        const uniqueBlocks = [];
        const seen = new Set();

        for (const block of textBlocks) {
            if (!seen.has(block)) {
                seen.add(block);
                uniqueBlocks.push(block);
            }
        }

        return uniqueBlocks.join('\n\n');
    }

    // Utility: Detect source platform
    function detectSourceHint() {
        const url = window.location.href.toLowerCase();

        if (url.includes('threads.net')) return 'threads';
        if (url.includes('instagram.com')) return 'instagram';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';

        return 'web';
    }

    // Main capture function
    async function captureAndArchive() {
        try {
            console.log('[Linkbrain] Starting DOM capture...');

            // Find main content
            const contentElement = findMainContent();

            // Extract data
            const images = extractImages(contentElement);
            const text = extractText(contentElement);
            const html = contentElement.outerHTML;
            const sourceHint = detectSourceHint();

            console.log('[Linkbrain] Extracted data:', {
                url: window.location.href,
                textLength: text.length,
                imageCount: images.length,
                sourceHint
            });

            // Validate we have enough content
            if (!text || text.length < 20) {
                alert('Linkbrain: Not enough text content found on this page.');
                return;
            }

            // Prepare payload
            const payload = {
                url: window.location.href,
                html: html,
                text: text,
                images: images,
                sourceHint: sourceHint
            };

            // Send to API
            console.log('[Linkbrain] Sending to API...');

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${USER_TOKEN}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            const result = await response.json();
            console.log('[Linkbrain] Successfully archived:', result);

            // Show success message
            alert(`✅ Linkbrain: Page archived successfully!\n\nTitle: ${result.title}\nCategory: ${result.category}`);

        } catch (error) {
            console.error('[Linkbrain] Error:', error);
            alert(`❌ Linkbrain: Failed to archive page.\n\nError: ${error.message}`);
        }
    }

    // Execute
    captureAndArchive();
})();

/* 
 * BOOKMARKLET VERSION:
 * To use as a bookmarklet, minify this code and wrap it in:
 * javascript:(function(){...})();
 * 
 * BROWSER EXTENSION VERSION:
 * - Add to content script
 * - Use chrome.storage to get user token
 * - Add UI for capture confirmation
 * - Add options to select collection
 */
