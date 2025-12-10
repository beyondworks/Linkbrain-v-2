/**
 * Threads Text Normalizer
 * 
 * Transforms raw Threads content into a consistent format:
 * - Separates main content from comments using "Comments (N)" header
 * - Normalizes line breaks to \n\n for paragraphs
 * - Removes common noise patterns (Report a problem, etc.)
 * - Outputs: MainContent + **COMMENTS_SECTION** + Comment1 **COMMENT_DIVIDER** Comment2 ...
 * 
 * This function is IDEMPOTENT - running it multiple times produces the same result
 */

// Common noise patterns to remove from the end of content
const NOISE_PATTERNS = [
    /Report a problem[\s\S]*$/i,
    /Log in to see more replies[\s\S]*$/i,
    /Related threads[\s\S]*$/i,
    /\* © \d{4} \*[\s\S]*$/i,
    /View all \d+ replies[\s\S]*$/i,
];

// UI text patterns that should be removed
const UI_NOISE = [
    /^Translate$/gim,
    /^Log in$/gim,
    /^Sign up$/gim,
    /^Follow$/gim,
    /^Like$/gim,
    /^Reply$/gim,
    /^Share$/gim,
    /^Repost$/gim,
    /^\d+\s*(likes?|replies?|reposts?|views?)$/gim,
];

/**
 * Check if a paragraph is primarily English (70%+ English letters)
 */
const isMostlyEnglish = (text: string): boolean => {
    const englishLetters = (text.match(/[a-zA-Z]/g) || []).length;
    const koreanChars = (text.match(/[가-힣]/g) || []).length;
    const total = englishLetters + koreanChars;
    if (total === 0) return false;
    return englishLetters / total > 0.7;
};

/**
 * Check if main content is primarily Korean (30%+ Korean characters)
 */
const isKoreanContent = (text: string): boolean => {
    const koreanChars = (text.match(/[가-힣]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    if (totalChars === 0) return false;
    return koreanChars / totalChars > 0.3;
};

/**
 * Clean a single line of text
 * Removes URLs, numbers, brackets, Author markers, etc.
 */
const cleanLine = (line: string): string => {
    let cleaned = line.trim();

    // Remove -Author or ·Author markers
    cleaned = cleaned.replace(/^[-·]?Author$/i, '');
    cleaned = cleaned.replace(/[-·]Author\s*/gi, '');

    // Remove all URLs (with or without brackets)
    cleaned = cleaned.replace(/\]?https?:\/\/[^\s\]\)]+\]?/g, '');

    // Remove markdown link artifacts
    cleaned = cleaned.replace(/\]\s*\(\s*\)/g, '');
    cleaned = cleaned.replace(/\[\s*\]/g, '');
    cleaned = cleaned.replace(/\[[^\]]*\]\([^\)]*\)/g, '');

    // Remove leftover brackets
    cleaned = cleaned.replace(/^\]+$/g, '');
    cleaned = cleaned.replace(/^\[+$/g, '');
    cleaned = cleaned.replace(/^[\[\]]+$/g, '');

    // Remove standalone numbers (engagement counts like 642, 36, 191)
    cleaned = cleaned.replace(/^\d+$/g, '');

    // Remove equals decorative lines
    cleaned = cleaned.replace(/={3,}/g, '');

    // Remove like/share counts patterns
    cleaned = cleaned.replace(/^\d+\.?\d*K?\s+\d+\.?\d*K?\s*$/g, '');
    cleaned = cleaned.replace(/\b\d+\.?\d*K?\s+\d+\.?\d*K?\b/g, '');

    // Remove Image N: patterns
    cleaned = cleaned.replace(/^\[?Image\s*\d+[:\]]?.*$/gi, '');

    // Remove media indicators
    cleaned = cleaned.replace(/^\(media\)$/i, '');

    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
};

/**
 * Check if a line should be skipped entirely
 */
const shouldSkipLine = (line: string): boolean => {
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed.length === 0) return true;

    // Skip very short lines (less than 2 chars)
    if (trimmed.length < 2) return true;

    // Skip standalone numbers
    if (/^\d+$/.test(trimmed)) return true;

    // Skip -Author or ·Author markers
    if (/^[-·]?Author$/i.test(trimmed)) return true;

    // Skip URLs only
    if (/^https?:\/\//.test(trimmed)) return true;

    // Skip bracket-only lines
    if (/^[\[\]\(\)]+$/.test(trimmed)) return true;

    // Skip UI elements
    if (/^(Translate|Log in|Sign up|Follow|Like|Reply|Share|Repost)$/i.test(trimmed)) return true;

    // Skip timestamp patterns (Korean)
    if (/^\d+\s*(분|시간|일|주|개월|년)\s*전$/i.test(trimmed)) return true;

    // Skip Korean names only (2-10 chars)
    if (/^[가-힣]{2,10}$/.test(trimmed) && trimmed.length < 12) return true;

    return false;
};

/**
 * Main normalizer function
 * Transforms raw Threads text into consistent format
 */
export function normalizeThreadsText(raw: string): string {
    if (!raw) return '';

    // If already normalized (has our tokens), just clean up slightly
    if (raw.includes('**COMMENTS_SECTION**')) {
        // Already normalized - just ensure clean formatting
        return raw
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    let text = raw
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')   // Remove trailing whitespace per line
        .trim();

    // Remove UI noise patterns  
    for (const pattern of UI_NOISE) {
        text = text.replace(pattern, '');
    }

    // Remove noise from the end
    for (const pattern of NOISE_PATTERNS) {
        text = text.replace(pattern, '');
    }
    text = text.trim();

    // Try to find "Comments (N)" header
    // Flexible regex: Comments(1), Comments (8), Comment(3), etc.
    const commentsHeaderMatch = text.match(/Comments?\s*\(\d+\)/i);

    if (!commentsHeaderMatch) {
        // No comments section found - just normalize line breaks
        const lines = text
            .split('\n')
            .map(cleanLine)
            .filter(l => l.length > 0)
            .filter(l => !shouldSkipLine(l));

        // Join with double newlines for paragraph separation
        return lines.join('\n\n');
    }

    // Split into main content and comments section
    const headerIndex = text.indexOf(commentsHeaderMatch[0]);
    const beforeComments = text.substring(0, headerIndex).trim();
    const afterHeader = text.substring(headerIndex + commentsHeaderMatch[0].length).trim();

    // Process main content - clean each line and join with double newlines
    const mainLines = beforeComments
        .split('\n')
        .map(cleanLine)
        .filter(l => l.length > 0)
        .filter(l => !shouldSkipLine(l));

    const mainContent = mainLines.join('\n\n');
    const mainIsKorean = isKoreanContent(mainContent);

    // Process comments section - split by double newlines (paragraph breaks)
    const commentBlocks = afterHeader
        .split(/\n{2,}/)
        .map(block => {
            // Clean each line within the block
            const lines = block
                .split('\n')
                .map(cleanLine)
                .filter(l => l.length > 0)
                .filter(l => !shouldSkipLine(l));
            return lines.join('\n');
        })
        .filter(block => block.length > 0);

    // Filter out noise comments
    const validComments = commentBlocks.filter(block => {
        // Skip very short blocks (less than 10 chars) 
        if (block.length < 10) return false;

        // Skip blocks that are mostly English when main content is Korean
        // This filters out unrelated threads/spam
        if (mainIsKorean && isMostlyEnglish(block) && block.length > 100) {
            return false;
        }

        return true;
    });

    // Remove duplicate comments (first 100 chars match)
    const seen = new Set<string>();
    const uniqueComments = validComments.filter(comment => {
        const key = comment.substring(0, 100).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Build output
    if (uniqueComments.length === 0) {
        return mainContent;
    }

    const commentsSection = uniqueComments.join('\n**COMMENT_DIVIDER**\n');

    return `${mainContent}\n\n**COMMENTS_SECTION**\n${commentsSection}`;
}

/**
 * Extract comment count from raw text
 */
export function extractCommentCount(raw: string): number {
    const match = raw.match(/Comments?\s*\((\d+)\)/i);
    return match ? parseInt(match[1], 10) : 0;
}

export default normalizeThreadsText;
