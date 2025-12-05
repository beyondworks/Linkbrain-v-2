/**
 * Web Text Normalizer
 * 
 * Cleans and structures general web content:
 * - Removes navigation menus, sidebars, footers
 * - Removes image markdown
 * - Cleans markdown links (keeps label, removes URL)
 * - Removes garbage tokens and JSON blocks
 * - Focuses on article/main content
 * 
 * NOTE: Only applies to source === 'web'
 * Instagram/YouTube/Threads are NOT affected.
 */

// Navigation/menu keywords to detect and remove
const NAV_KEYWORDS = [
    '뉴스홈', '뉴스스탠드', '홈', '메뉴', '검색', '로그인', '회원가입',
    '구독', '알림', '설정', '프리미엄', '마이페이지', '고객센터',
    '광고문의', '이용약관', '개인정보', '저작권', '뉴스제보',
    'HOME', 'MENU', 'LOGIN', 'SUBSCRIBE', 'SEARCH', 'SETTINGS',
    '전체기사', '최신기사', '인기기사', '포토', '영상', '연예', '스포츠',
    '경제', '정치', '사회', '국제', '문화', '생활', 'IT', '과학',
    '오피니언', '인터뷰', '칼럼', '사설', '기획', '특집'
];

// Footer patterns
const FOOTER_PATTERNS = [
    /copyright/i,
    /©\s*\d{4}/,
    /all\s*rights\s*reserved/i,
    /무단\s*전재/,
    /재배포\s*금지/,
    /저작권\s*보호/,
    /문의\s*메일/,
    /대표\s*전화/,
    /사업자\s*등록/
];

// Category list patterns (news sites often have these)
const CATEGORY_PATTERN = /^[\*\-•]\s*(.{1,20})$/;

/**
 * Check if a line looks like navigation/category item
 */
function isNavOrCategory(line: string): boolean {
    const trimmed = line.trim();

    // Very short lines with nav keywords
    if (trimmed.length < 30 && NAV_KEYWORDS.some(kw => trimmed.includes(kw))) {
        return true;
    }

    // Bullet point category lists
    if (CATEGORY_PATTERN.test(trimmed) && trimmed.length < 25) {
        return true;
    }

    return false;
}

/**
 * Check if line looks like footer content
 */
function isFooterContent(line: string): boolean {
    return FOOTER_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * Remove all image markdown patterns
 */
function removeImageMarkdown(text: string): string {
    // ![alt](url) pattern
    let t = text.replace(/!\[.*?\]\(.*?\)/gs, '');

    // [[Image N: ...]] patterns
    t = t.replace(/\[\[?Image\s*\d*:?[^\]]*\]\]?/gi, '');

    return t;
}

/**
 * Clean markdown links: [label](url) → label or remove
 */
function cleanMarkdownLinks(text: string): string {
    return text.replace(/\[([^\]]*?)\]\((https?:\/\/[^\)]*?)\)/g, (match, label) => {
        const cleanLabel = (label || '').trim();

        // Noise labels → remove entirely
        if (!cleanLabel) return '';
        if (/^링크$/i.test(cleanLabel)) return '';
        if (/^link$/i.test(cleanLabel)) return '';
        if (/^Log in$/i.test(cleanLabel)) return '';
        if (/^로그인$/i.test(cleanLabel)) return '';
        if (/^Read more$/i.test(cleanLabel)) return '';
        if (/^Learn more$/i.test(cleanLabel)) return '';
        if (/^Click here$/i.test(cleanLabel)) return '';
        if (/^더보기$/i.test(cleanLabel)) return '';
        if (/^자세히$/i.test(cleanLabel)) return '';

        // Keep meaningful labels
        return cleanLabel;
    });
}

/**
 * Remove garbage tokens
 */
function removeGarbageTokens(text: string): string {
    let t = text;

    // Empty brackets
    t = t.replace(/\[\s*\]/g, '');
    t = t.replace(/\(\s*\)/g, '');

    // [링크] tokens
    t = t.replace(/\[링크\]/gi, '');

    // Standalone URLs
    t = t.replace(/^https?:\/\/\S+$/gm, '');

    // Email addresses
    t = t.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');

    // Phone numbers
    t = t.replace(/\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4}/g, '');

    return t;
}

/**
 * Remove JSON/prompt blocks
 */
function removeJsonBlocks(text: string): string {
    const paragraphs = text
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean);

    const cleaned: string[] = [];

    for (const p of paragraphs) {
        // Skip JSON-like prompt blocks
        if (p.includes('"style_mode"')) continue;
        if (p.includes('"negative_prompt"')) continue;

        // Skip blocks that look like JSON
        const isJsonLike = p.length > 200 &&
            p.includes('{') &&
            p.includes('":') &&
            (p.match(/"/g) || []).length > 10;
        if (isJsonLike) continue;

        cleaned.push(p);
    }

    return cleaned.join('\n\n');
}

/**
 * Remove navigation sections and category lists
 */
function removeNavigationSections(text: string): string {
    const lines = text.split('\n');
    const filtered: string[] = [];
    let consecutiveNavCount = 0;
    let skipUntilContent = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines but don't reset counter
        if (!trimmed) {
            if (!skipUntilContent) filtered.push(line);
            continue;
        }

        // Check if this looks like nav/category
        if (isNavOrCategory(trimmed)) {
            consecutiveNavCount++;
            // If we see 3+ consecutive nav items, start skipping
            if (consecutiveNavCount >= 3) {
                skipUntilContent = true;
            }
            continue;
        }

        // Check for footer
        if (isFooterContent(trimmed)) {
            skipUntilContent = true;
            continue;
        }

        // Real content - reset counters
        if (trimmed.length > 50) {
            consecutiveNavCount = 0;
            skipUntilContent = false;
        }

        if (!skipUntilContent) {
            filtered.push(line);
        }
    }

    return filtered.join('\n');
}

/**
 * Extract main article content (focus on longest coherent section)
 */
function extractMainContent(text: string): string {
    const paragraphs = text
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    // Find the "main content zone" - paragraphs with substantial text
    const contentParagraphs: string[] = [];
    let inContent = false;
    let contentStarted = false;

    for (const p of paragraphs) {
        // Skip very short paragraphs at the beginning
        if (!contentStarted && p.length < 50) {
            continue;
        }

        // Found substantial content
        if (p.length > 80) {
            contentStarted = true;
            inContent = true;
        }

        if (contentStarted) {
            // Stop if we hit footer-like content
            if (isFooterContent(p)) break;

            // Include if in content zone
            if (inContent || p.length > 30) {
                contentParagraphs.push(p);
            }
        }
    }

    return contentParagraphs.join('\n\n');
}

/**
 * Main normalizer for web content
 */
export function normalizeWeb(raw: string): string {
    if (!raw) return '';

    let text = raw;

    // Step 1: Remove image markdown
    text = removeImageMarkdown(text);

    // Step 2: Clean markdown links
    text = cleanMarkdownLinks(text);

    // Step 3: Remove garbage tokens
    text = removeGarbageTokens(text);

    // Step 4: Remove JSON blocks
    text = removeJsonBlocks(text);

    // Step 5: Remove navigation sections
    text = removeNavigationSections(text);

    // Step 6: Extract main content
    text = extractMainContent(text);

    // Step 7: Clean up whitespace and format paragraphs
    const paragraphs = text
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    // Step 8: Filter out very short/noise paragraphs
    const filtered = paragraphs.filter(p => {
        if (p.length < 10) return false;
        if (/^\d+$/.test(p)) return false;
        if (/^[!?.,]+$/.test(p)) return false;
        // Skip lines that are just timestamps
        if (/^\d{4}[-./]\d{1,2}[-./]\d{1,2}/.test(p) && p.length < 20) return false;
        return true;
    });

    return filtered.join('\n\n');
}

/**
 * Alias for cleaner import
 */
export const cleanGenericMarkdown = normalizeWeb;

export default normalizeWeb;

