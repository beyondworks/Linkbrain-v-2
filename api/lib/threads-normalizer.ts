/**
 * Threads Text Normalizer (Version 5 - Major Cleanup)
 * 
 * Comprehensive text cleaning for Threads content:
 * - Image markdown completely removed (![...](url))
 * - Markdown links cleaned ([label](url) → label or removed)
 * - JSON/prompt blocks removed
 * - Paragraph deduplication
 * - Structured output with [[[COMMENTS_SECTION]]] / [[[COMMENT_SPLIT]]] markers
 * 
 * NOTE: Instagram/YouTube are NOT affected - only Threads uses this.
 */

// ============================================================================
// STEP 1: Core cleaning functions
// ============================================================================

/**
 * Remove all image markdown patterns
 */
function removeImageMarkdown(text: string): string {
    // ![alt text](url) - complete image markdown
    let t = text.replace(/!\[.*?\]\(.*?\)/gs, '');

    // [[Image N: ...]] patterns
    t = t.replace(/\[\[?Image\s*\d*:?[^\]]*\]\]?/gi, '');

    // Standalone image URLs on their own line
    t = t.replace(/^https?:\/\/scontent[^\s]+$/gm, '');
    t = t.replace(/^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)[^\s]*$/gim, '');

    return t;
}

/**
 * Clean markdown links: [label](url) → label or remove entirely
 */
function cleanMarkdownLinks(text: string): string {
    // Pattern: [label](url)
    let t = text.replace(/\[([^\]]*?)\]\((https?:\/\/[^\)]*?)\)/g, (match, label) => {
        const cleanLabel = (label || '').trim();

        // Empty label or noise labels → remove entirely
        if (!cleanLabel) return '';
        if (/^링크$/i.test(cleanLabel)) return '';
        if (/^link$/i.test(cleanLabel)) return '';
        if (/^Log in$/i.test(cleanLabel)) return '';
        if (/^로그인$/i.test(cleanLabel)) return '';
        if (/^Read more$/i.test(cleanLabel)) return '';
        if (/^Learn more$/i.test(cleanLabel)) return '';
        if (/^더 보기$/i.test(cleanLabel)) return '';
        if (/^Thread\s*={3,}/i.test(cleanLabel)) return '';
        if (/^\d+\/\d+\/\d+$/i.test(cleanLabel)) return ''; // Date patterns like 11/22/25
        if (/^@?\w+$/i.test(cleanLabel) && cleanLabel.length < 20) return ''; // Short usernames

        // Keep meaningful labels (but without URL)
        return cleanLabel;
    });

    return t;
}

/**
 * Remove garbage tokens and empty brackets
 */
function removeGarbageTokens(text: string): string {
    let t = text;

    // Empty brackets
    t = t.replace(/\[\s*\]/g, '');
    t = t.replace(/\(\s*\)/g, '');

    // [링크] tokens
    t = t.replace(/\[링크\]/gi, '');

    // Broken link fragments
    t = t.replace(/^\]\(https?:\/\/[^\)]+\)$/gm, '');
    t = t.replace(/\]\(https?:\/\/[^\s\)]+/g, '');

    // Standalone URLs
    t = t.replace(/^https?:\/\/\S+$/gm, '');

    // CDN URLs in text
    t = t.replace(/https?:\/\/scontent[^\s]+/g, '');
    t = t.replace(/https?:\/\/[^\s]+\.cdninstagram\.com[^\s]*/g, '');
    t = t.replace(/https?:\/\/[^\s]+\.fbcdn\.net[^\s]*/g, '');

    return t;
}

/**
 * Remove JSON/prompt blocks (AI image generation prompts, etc.)
 */
function removeJsonPromptBlocks(text: string): string {
    const paragraphs = text
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean);

    const cleaned: string[] = [];

    for (const p of paragraphs) {
        // Skip JSON-like prompt blocks
        if (p.includes('"style_mode"')) continue;
        if (p.includes('"negative_prompt"')) continue;
        if (p.includes('"prompt"') && p.includes('"style"')) continue;
        if (p.includes('"render_intent"')) continue;
        if (p.includes('"aesthetic_controls"')) continue;

        // Skip blocks that look like JSON (long, has { and ":)
        const isJsonLike = p.length > 200 &&
            p.includes('{') &&
            p.includes('":') &&
            (p.match(/"/g) || []).length > 10;
        if (isJsonLike) continue;

        // Skip blocks starting with {{ or JSON array
        if (p.startsWith('{{') || p.startsWith('[{')) continue;

        cleaned.push(p);
    }

    return cleaned.join('\n\n');
}

/**
 * Remove Translate blocks and thread metadata
 */
function removeMetadata(text: string): string {
    let t = text;

    // Translate block (Translate followed by content until next paragraph)
    t = t.replace(/^Translate\s*$/gm, '');

    // Thread ===== metadata
    t = t.replace(/Thread\s*={3,}.*$/gm, '');
    t = t.replace(/\[Thread\s*={3,}[^\]]*\]/gi, '');

    // System messages
    t = t.replace(/^Author$/gm, '');
    t = t.replace(/^-Author$/gm, '');
    t = t.replace(/^Report a problem.*$/gm, '');
    t = t.replace(/^Related threads.*$/gm, '');
    t = t.replace(/^Log in to see.*$/gm, '');
    t = t.replace(/^View all \d+ replies.*$/gm, '');
    t = t.replace(/^No photo description available.*$/gm, '');
    t = t.replace(/^May be an image of.*$/gm, '');
    t = t.replace(/^May be a.*image.*$/gm, '');
    t = t.replace(/^profile picture.*$/gm, '');
    t = t.replace(/^Sorry, we're having trouble.*$/gm, '');

    return t;
}

/**
 * Deduplicate paragraphs (remove exact duplicates)
 */
function deduplicateParagraphs(text: string): string {
    const paragraphs = text
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean);

    const seen = new Set<string>();
    const deduped: string[] = [];

    for (const p of paragraphs) {
        // Normalize for comparison (collapse whitespace)
        const key = p.replace(/\s+/g, ' ').trim().toLowerCase();
        if (!key) continue;
        if (key.length < 3) continue; // Skip very short

        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(p);
    }

    return deduped.join('\n\n');
}

/**
 * Clean individual lines
 */
function cleanLine(line: string): string {
    let t = line.trim();

    // Remove inline URLs
    t = t.replace(/https?:\/\/\S+/g, '');

    // Clean up extra whitespace
    t = t.replace(/\s{2,}/g, ' ').trim();

    return t;
}

/**
 * Filter out noise lines
 */
function isNoiseLine(line: string): boolean {
    const t = line.trim();

    if (!t) return true;
    if (t.length < 2) return true;

    // Standalone numbers
    if (/^\d+$/.test(t) && t.length <= 4) return true;
    if (/^\d+\.?\d*[KM]?$/.test(t) && t.length <= 5) return true;

    // Single punctuation
    if (/^[!?.,]+$/.test(t)) return true;

    // Only [링크] or empty brackets
    if (/^\[링크\]$/.test(t)) return true;
    if (/^\[\s*\]$/.test(t)) return true;

    // ig_cache_key and similar
    if (/ig_cache_key/i.test(t)) return true;

    return false;
}

// ============================================================================
// STEP 2: Main normalizer function
// ============================================================================

const hasHangul = (s: string) => /[가-힣]/.test(s);

export function normalizeThreads(raw: string): string {
    if (!raw) return '';

    let text = raw;

    // Step 1: Remove image markdown
    text = removeImageMarkdown(text);

    // Step 2: Clean markdown links
    text = cleanMarkdownLinks(text);

    // Step 3: Remove garbage tokens
    text = removeGarbageTokens(text);

    // Step 4: Remove JSON/prompt blocks
    text = removeJsonPromptBlocks(text);

    // Step 5: Remove metadata
    text = removeMetadata(text);

    // Step 6: Deduplicate paragraphs
    text = deduplicateParagraphs(text);

    // Step 7: Split by Comments(N) for body/comments separation
    const parts = text.split(/Comments?\s*\(\d+\)/i);
    const bodyRaw = parts[0] || '';
    const commentsRaw = parts[1] || '';

    // Step 8: Process body lines
    const bodyLines = bodyRaw
        .split('\n')
        .map(cleanLine)
        .filter(l => !isNoiseLine(l));

    // Step 9: Process comment lines
    const commentLines = commentsRaw
        .split('\n')
        .map(cleanLine)
        .filter(l => !isNoiseLine(l));

    // Step 10: Korean filter
    const bodyKorean = bodyLines.filter(hasHangul);
    const commentsKorean = commentLines.filter(hasHangul);

    const finalBodyLines = bodyKorean.length > 0 ? bodyKorean : bodyLines;
    const finalCommentLines = commentsKorean.length > 0 ? commentsKorean : commentLines;

    // Step 11: Deduplicate body lines again
    const seenBody = new Set<string>();
    const dedupedBody: string[] = [];
    for (const line of finalBodyLines) {
        const key = line.replace(/\s+/g, ' ').trim().toLowerCase();
        if (seenBody.has(key)) continue;
        seenBody.add(key);
        dedupedBody.push(line);
    }

    const finalBody = dedupedBody.join('\n\n');

    // Step 12: Build final output
    if (finalCommentLines.length === 0) {
        return finalBody;
    }

    const commentsWithMarkers = finalCommentLines.join('\n\n[[[COMMENT_SPLIT]]]\n\n');

    return [
        finalBody,
        '[[[COMMENTS_SECTION]]]',
        commentsWithMarkers,
    ].join('\n\n');
}

export default normalizeThreads;
