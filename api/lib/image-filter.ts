
const BLOCKED_SIZE_PATTERNS = [
    's150x150',
    's96x96',
    's64x64',
    's32x32',
    's48x48',
    's16x16',
    'p50x50',
    'p150x150'
];

const BLOCKED_KEYWORDS = [
    'sprite',
    'icon',
    'favicon',
    'emoji',
    'reaction',
    'badge',
    'logo',
    'profile',
    'avatar',
    'user',
    'author'
];

/**
 * Filters out unwanted images from a list of URLs.
 * Removes profile pictures, icons, UI elements, and small thumbnails.
 */
export function filterClipImages(urls: string[]): string[] {
    if (!urls || urls.length === 0) return [];

    const unique = Array.from(new Set(urls)); // Remove duplicates

    return unique.filter((raw) => {
        if (!raw) return false;

        // Remove query parameters for checking patterns, but keep original for return if needed
        // However, some CDNs use query params for sizing, so we check the full URL too
        const url = raw.split('?')[0];
        const lowerRaw = raw.toLowerCase();
        const lowerUrl = url.toLowerCase();

        // 1) Must be http/https
        if (!lowerRaw.startsWith('http')) return false;

        // 2) Remove unwanted formats
        if (lowerUrl.endsWith('.svg') || lowerUrl.endsWith('.ico') || lowerUrl.endsWith('.gif')) return false;

        // 3) Remove small thumbnail patterns common in Instagram/Threads/FB
        if (BLOCKED_SIZE_PATTERNS.some((p) => lowerRaw.includes(p))) {
            return false;
        }

        // 4) Remove keywords indicating UI elements or profile pictures
        if (BLOCKED_KEYWORDS.some((k) => lowerRaw.includes(k))) {
            return false;
        }

        return true;
    });
}
