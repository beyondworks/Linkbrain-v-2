/**
 * Content processing utilities for Threads and other platforms
 * Includes text cleaning, deduplication, and block parsing
 */

// Image filtering functions (existing logic)
function isProfilePicture(url: string): boolean {
    return url.includes('profile') || url.includes('avatar') || url.includes('pp.') || !!url.match(/\/\d+_\d+_\d+_n\.jpg/);
}

function isTooSmall(url: string): boolean {
    const sizeMatch = url.match(/\/s(\d+)x(\d+)\//);
    if (sizeMatch) {
        const width = parseInt(sizeMatch[1]);
        const height = parseInt(sizeMatch[2]);
        return width < 200 || height < 200;
    }
    return false;
}

function isUIElement(url: string): boolean {
    return url.includes('icon') || url.includes('logo') || url.includes('badge') || url.includes('button');
}

function isContentImage(url: string): boolean {
    return url.includes('scontent') || url.includes('cdninstagram');
}

// NEW: Content block types
export interface ContentBlock {
    type: 'text' | 'image';
    content: string;
}

export interface ThreadSection {
    type: 'main' | 'comment';
    blocks: ContentBlock[];
}

export interface ProcessedThreadContent {
    sections: ThreadSection[];
    hasComments: boolean;
}

/**
 * Detect if a line indicates start of comment section
 * Based on n8n logic: "replied", "Reply to", "Replies"
 */
function isCommentIndicator(line: string): boolean {
    const lower = line.toLowerCase().trim();
    return lower.includes('replied') ||
        lower.includes('reply to') ||
        lower === 'replies' ||
        lower.includes('commented');
}

/**
 * Clean text content - remove metadata, UI elements, and noise
 * Based on n8n workflow cleaning logic + user refinements
 */
function cleanTextContent(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // 1. Remove author indicators (but NOT the continuation marker)
    cleaned = cleaned.replace(/·Author\s*/g, '');
    cleaned = cleaned.replace(/^Author\s*$/gm, '');

    // 2. KEEP continuation markers - they're part of content!
    // (이어서 계속👇) should remain

    // 3. Remove thread metadata
    cleaned = cleaned.replace(/Thread\s*={3,}\s*[\d.]+K?\s*views?/gi, '');
    cleaned = cleaned.replace(/Thread\s*={3,}/gi, '');

    // 4. Remove repeated author names and timestamps
    // Patterns like "itsshibaai", "AI Threads", "4d", "3d", "16h", etc.
    cleaned = cleaned.replace(/^[a-z_]+\s*$/gim, '');  // Lines with only lowercase/underscore (usernames)
    cleaned = cleaned.replace(/^AI Threads\s*$/gim, '');
    cleaned = cleaned.replace(/^NBA Threads\s*$/gim, '');
    cleaned = cleaned.replace(/^\d+[dhm]\s*$/gm, '');  // Lines with only timestamps (4d, 3h, 16m)

    // 5. Remove UI text and menu items
    cleaned = cleaned.replace(/to see more replies\./gi, '');
    cleaned = cleaned.replace(/View on Threads/gi, '');
    cleaned = cleaned.replace(/Log in/gi, '');
    cleaned = cleaned.replace(/^Reply\s*$/gim, '');
    cleaned = cleaned.replace(/^Post\s*$/gim, '');

    // 6. Remove footer links
    cleaned = cleaned.replace(/\*\s*Threads Terms/gi, '');
    cleaned = cleaned.replace(/\*\s*Privacy Policy/gi, '');
    cleaned = cleaned.replace(/\*\s*Cookies Policy/gi, '');
    cleaned = cleaned.replace(/\*\s*Report a problem/gi, '');

    // 7. Remove empty brackets and parentheses
    cleaned = cleaned.replace(/\[\s*\]/g, '');
    cleaned = cleaned.replace(/\(\s*\)/g, '');

    // 8. Remove metadata headers
    cleaned = cleaned.replace(/^Title:.*$/gm, '');
    cleaned = cleaned.replace(/^URL Source:.*$/gm, '');
    cleaned = cleaned.replace(/Markdown Content:/gi, '');

    // 9. Remove separator lines
    cleaned = cleaned.replace(/^-{3,}$/gm, '');
    cleaned = cleaned.replace(/^={3,}$/gm, '');

    // 10. Remove domain references at end of lines (e.g., "electrek.co/...")
    cleaned = cleaned.replace(/\b[a-z]+\.[a-z]{2,}\/[\w\-…]+/gi, '');

    // 11. Clean up excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');  // Max 2 newlines
    cleaned = cleaned.replace(/[ \t]+/g, ' ');      // Multiple spaces to single

    // 12. Remove lines with only special characters or very short content
    cleaned = cleaned.split('\n').filter(line => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        // Keep if has Korean, English, or numbers AND reasonable length
        if (trimmed.length < 2) return false;
        return /[a-zA-Z0-9가-힣]/.test(trimmed);
    }).join('\n');

    return cleaned.trim();
}

/**
 * Parse a line into text and image blocks
 */
function parseLineIntoBlocks(line: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];

    // Split by image markers while preserving them
    const parts = line.split(/(!\[.*?\]\(.*?\))/g);

    for (const part of parts) {
        if (!part || part.trim().length === 0) continue;

        // Check if it's an image
        const imageMatch = part.match(/!\[.*?\]\((.*?)\)/);
        if (imageMatch) {
            const imageUrl = imageMatch[1];
            // Keep ALL images - don't filter
            if (imageUrl && imageUrl.startsWith('http')) {
                blocks.push({
                    type: 'image',
                    content: imageUrl
                });
            }
        } else {
            // It's text - clean it thoroughly
            const cleanedText = cleanTextContent(part);
            if (cleanedText.length > 0) {
                blocks.push({
                    type: 'text',
                    content: cleanedText
                });
            }
        }
    }

    return blocks;
}

/**
 * Parse Threads markdown content into structured blocks
 * Separates main content from author's own comments
 */
export function parseThreadContent(markdown: string): ProcessedThreadContent {
    if (!markdown) {
        return { sections: [], hasComments: false };
    }

    const lines = markdown.split('\n');
    const sections: ThreadSection[] = [];

    let currentSection: ThreadSection = {
        type: 'main',
        blocks: []
    };

    let isInCommentSection = false;
    const seenTexts = new Set<string>();  // For deduplication

    // Track if we've seen the main content
    let mainContentLineCount = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and noise
        if (!trimmed) continue;
        if (trimmed.startsWith('Title:') || trimmed.startsWith('URL Source:')) continue;
        if (/^\d+$/.test(trimmed) && trimmed.length < 5) continue; // Numbers only (short)
        if (/^[\[\]\(\)\.,]+$/.test(trimmed)) continue; // Special chars only

        // Detect author's threaded comments (numbered continuation)
        // 1/, 2/, 3/ ... pattern indicates author's own comment thread
        const isNumberedComment = /^\d+\/\s/.test(trimmed);

        // After we've seen some main content, numbered comments indicate start of author's thread
        if (!isInCommentSection && isNumberedComment && mainContentLineCount > 0) {
            // Save current main section
            if (currentSection.blocks.length > 0) {
                sections.push(currentSection);
            }

            // Start comment section (author's own thread)
            isInCommentSection = true;
            currentSection = {
                type: 'comment',
                blocks: []
            };
        }

        // Check for comment indicator (other comment patterns)
        if (!isInCommentSection && isCommentIndicator(trimmed)) {
            if (currentSection.blocks.length > 0) {
                sections.push(currentSection);
            }

            isInCommentSection = true;
            currentSection = {
                type: 'comment',
                blocks: []
            };
            continue;
        }

        // Parse line into blocks
        const lineBlocks = parseLineIntoBlocks(line);

        // Filter and deduplicate blocks
        for (const block of lineBlocks) {
            if (block.type === 'text') {
                const content = block.content.trim();

                // Simple exact duplicate check
                const key = content.substring(0, 200);

                if (seenTexts.has(key)) {
                    continue;
                }

                // Check content characteristics
                const hasKorean = /[가-힣]/.test(content);
                const isNumbered = /^\d+\/\s/.test(content);
                const hasContinuation = content.includes('이어서') || content.includes('👇');
                const contentLength = content.length;

                // Filter out very short comments (likely from other users)
                // BUT: Don't filter numbered comments - they're author's thread!
                const isVeryShort = contentLength < 30;
                const hasOnlyEmoticons = /^[ㅋㅎㄷ\s!?😊😂🤣😭😍🥰👍👏🔥💯😲🙂]+$/.test(content);

                if (!isNumbered && (isVeryShort || hasOnlyEmoticons)) {
                    // Skip very short or emoticon-only comments (unless numbered)
                    continue;
                }

                // In main section, filter out English-only content
                if (!isInCommentSection) {
                    if (!hasKorean && !hasContinuation) {
                        continue;
                    }
                    mainContentLineCount++;
                }

                // In comment section, only keep:
                // 1. ALL numbered comments (author's thread) - REGARDLESS of length
                // 2. Very long detailed comments (> 100 chars)
                if (isInCommentSection) {
                    const isVeryLongComment = contentLength > 100;

                    if (!isNumbered && !isVeryLongComment && !hasContinuation) {
                        // Not numbered, not very long, not continuation -> likely other user
                        continue;
                    }
                }

                seenTexts.add(key);
            }

            currentSection.blocks.push(block);
        }
    }

    // Save final section
    if (currentSection.blocks.length > 0) {
        sections.push(currentSection);
    }

    return {
        sections,
        hasComments: sections.some(s => s.type === 'comment')
    };
}

// ============================================================================
// NEW: Threads Markdown Parser for structured [[[MARKERS]]]
// ============================================================================

export interface ThreadComment {
    id: number;
    text: string;
}

export interface ParsedThread {
    body: string;
    comments: ThreadComment[];
}

/**
 * Parse Threads markdown with explicit markers into structured data
 * Expects format:
 *   [body text]
 *   [[[COMMENTS_SECTION]]]
 *   [comment 1]
 *   [[[COMMENT_SPLIT]]]
 *   [comment 2]
 *   ...
 */
export function parseThreadsMarkdown(md: string): ParsedThread {
    if (!md) {
        return { body: '', comments: [] };
    }

    const [bodyPart, commentsPart] = md.split('[[[COMMENTS_SECTION]]]');
    const body = (bodyPart || '').trim();

    if (!commentsPart) {
        return { body, comments: [] };
    }

    const rawComments = commentsPart
        .split('[[[COMMENT_SPLIT]]]')
        .map(c => c.trim())
        .filter(Boolean);

    const comments: ThreadComment[] = rawComments.map((text, idx) => ({
        id: idx,
        text,
    }));

    return { body, comments };
}
