/**
 * Naver Blog Text Normalizer
 * 
 * Cleans Naver Blog content specifically:
 * - Removes navigation and UI elements
 * - Cleans up special characters and arrows
 * - Preserves main blog post content
 * - Extracts clean text from mobile version
 * 
 * NOTE: Only applies to blog.naver.com URLs
 * Does NOT affect Threads/Instagram/YouTube
 */

/**
 * Clean up special characters and formatting noise
 */
function cleanSpecialChars(text: string): string {
    let t = text;

    // Remove leading arrows and bullets from lines
    t = t.replace(/^[>\-•▶►▷→◆◇■□●○★☆]+\s*/gm, '');

    // Remove trailing arrows
    t = t.replace(/[>\-▶►▷→]+\s*$/gm, '');

    // Clean up multiple asterisks (bold markdown artifacts)
    t = t.replace(/\*{2,}/g, '');

    // Remove standalone special chars
    t = t.replace(/^[#*>\-─│┃]+$/gm, '');

    // Clean up excessive whitespace
    t = t.replace(/[ \t]{3,}/g, '  ');

    return t;
}

/**
 * Remove Naver-specific noise patterns
 */
function removeNaverNoise(text: string): string {
    let t = text;

    // Remove common Naver UI elements
    const noisePatterns = [
        /이웃추가/g,
        /공감\s*\d*/g,
        /댓글\s*\d*/g,
        /구독하기/g,
        /블로그 홈/g,
        /블로그로 돌아가기/g,
        /프로필/g,
        /포스트 목록/g,
        /이전 포스트/g,
        /다음 포스트/g,
        /블로그 메뉴/g,
        /공지사항/g,
        /최근 포스트/g,
        /내 블로그/g,
        /글쓰기/g,
        /통계/g,
        /관리/g,
        /로그인/g,
        /네이버 블로그/g,
        /N Pay/g,
        /스마트스토어/g,
        /NAVER/gi,
        /https?:\/\/[^\s]+/g, // Remove URLs
        /맨\s*위로/g,
        /TOP/g,
        /첨부파일/g,
        /좋아요\s*\d*/g,
    ];

    for (const pattern of noisePatterns) {
        t = t.replace(pattern, '');
    }

    return t;
}

/**
 * Extract main content from Naver blog markdown
 */
function extractNaverContent(text: string): string {
    const lines = text.split('\n');
    const contentLines: string[] = [];
    let foundContent = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines at the start
        if (!foundContent && !trimmed) continue;

        // Skip very short lines (likely UI elements)
        if (trimmed.length < 3 && trimmed.length > 0) continue;

        // Skip lines with just numbers (dates, counts)
        if (/^\d+$/.test(trimmed)) continue;

        // Skip lines that look like navigation
        if (/^(이전|다음|목록|홈|검색|메뉴)\s*$/.test(trimmed)) continue;

        // Found substantial content
        if (trimmed.length > 15) {
            foundContent = true;
        }

        if (foundContent && trimmed.length > 0) {
            contentLines.push(trimmed);
        }
    }

    return contentLines.join('\n');
}

/**
 * Main normalizer for Naver Blog content
 */
export function normalizeNaverBlog(raw: string): string {
    if (!raw) return '';

    let text = raw;

    // Step 1: Remove image markdown
    text = text.replace(/!\[.*?\]\(.*?\)/gs, '');
    text = text.replace(/\[\[?Image\s*\d*:?[^\]]*\]\]?/gi, '');

    // Step 2: Clean markdown links - keep label
    text = text.replace(/\[([^\]]*?)\]\((https?:\/\/[^\)]*?)\)/g, '$1');

    // Step 3: Clean special characters
    text = cleanSpecialChars(text);

    // Step 4: Remove Naver-specific noise
    text = removeNaverNoise(text);

    // Step 5: Extract main content
    text = extractNaverContent(text);

    // Step 6: Clean up and format paragraphs nicely
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        // Check if this looks like a new paragraph/section
        const isNewSection = /^[가-힣A-Za-z]/.test(trimmed) && trimmed.length > 30;

        if (isNewSection && currentParagraph.length > 0) {
            paragraphs.push(currentParagraph.join(' '));
            currentParagraph = [];
        }

        currentParagraph.push(trimmed);
    }

    if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
    }

    // Filter out very short paragraphs
    const filtered = paragraphs.filter(p => p.length > 15);

    return filtered.join('\n\n');
}

export default normalizeNaverBlog;

