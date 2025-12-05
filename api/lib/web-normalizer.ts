/**
 * Web Text Normalizer
 * 
 * Cleans and structures general web content:
 * - Removes image markdown
 * - Cleans markdown links (keeps label, removes URL)
 * - Removes garbage tokens and JSON blocks
 * - Normalizes paragraph formatting
 * 
 * NOTE: Only applies to source === 'web'
 * Instagram/YouTube are NOT affected.
 */

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

    // Step 5: Clean up whitespace and format paragraphs
    const paragraphs = text
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    // Step 6: Filter out very short/noise paragraphs
    const filtered = paragraphs.filter(p => {
        if (p.length < 3) return false;
        if (/^\d+$/.test(p)) return false;
        if (/^[!?.,]+$/.test(p)) return false;
        return true;
    });

    return filtered.join('\n\n');
}

/**
 * Alias for cleaner import
 */
export const cleanGenericMarkdown = normalizeWeb;

export default normalizeWeb;
