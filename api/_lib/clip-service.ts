
import { OpenAI } from 'openai';
import * as cheerio from 'cheerio';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { cacheImagesWithFallback } from './image-storage';
import { filterClipImages } from './image-filter';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

const db = getFirestore();

// ============================================================================
// INTERFACES
// ============================================================================

export interface ClipContentInput {
    url: string;
    sourceType: 'instagram' | 'threads' | 'youtube' | 'web' | 'twitter';
    rawText?: string;           // MUST be actual extracted text, never AI-generated
    htmlContent?: string;       // MUST be actual HTML, never AI-generated  
    images?: string[];          // MUST be actual image URLs, never AI-generated
    userId: string;
    author?: string;            // Author name or handle
    authorAvatar?: string;      // Author profile image
    authorHandle?: string;      // Platform-specific handle (e.g., @username)
}

export interface ClipMetadata {
    title: string;
    summary: string;
    keywords: string[];
    category: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    type: 'article' | 'video' | 'image' | 'social_post' | 'website';
}

export interface Clip {
    id: string;
    userId: string;
    url: string;
    platform: string;
    template: string;
    title: string;
    summary: string;
    keywords: string[];
    category: string;
    sentiment: string;
    type: string;
    image: string | null;
    author: string;
    authorHandle?: string;           // NEW: Platform handle (@username)
    authorAvatar?: string;           // NEW: Profile image URL
    authorProfile: any;
    mediaItems: any[];
    engagement: any;
    mentions: Array<{ label: string; url: string }>;
    comments: any[];
    publishDate: string | null;
    htmlContent: string;
    collectionIds: string[];
    viewCount: number;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
    rawMarkdown?: string;
    contentMarkdown?: string;
    contentHtml?: string;
    images?: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect platform from URL
 * Handles redirect URLs (l.threads.net, t.co) and short domains (instagr.am, youtu.be)
 */
export const detectPlatform = (url: string, sourceHint?: string): string => {
    if (sourceHint) return sourceHint;

    const urlLower = url.toLowerCase();

    // Threads (including www and redirects)
    if (urlLower.includes('threads.net') ||
        urlLower.includes('threads.com') ||
        urlLower.includes('www.threads') ||
        urlLower.includes('l.threads.net')) return 'threads';

    // Instagram (including short domain)
    if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) return 'instagram';

    // YouTube
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';

    // X/Twitter (including t.co redirects)
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com') || urlLower.includes('t.co')) return 'twitter';

    return 'web';
};

/**
 * Extract text from HTML
 */
export const extractTextFromHtml = (html: string): string => {
    try {
        const $ = cheerio.load(html);

        // Remove script and style tags
        $('script, style, noscript').remove();

        // Extract text from main content elements
        const textElements: string[] = [];
        $('h1, h2, h3, h4, h5, h6, p, li, span, div').each((_, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 10) {
                textElements.push(text);
            }
        });

        return textElements.join('\n\n');
    } catch (error) {
        console.error('Error extracting text from HTML:', error);
        return '';
    }
};

/**
 * Generate fallback title from URL or raw text
 * IMPORTANT: This is NOT AI-generated, just simple extraction
 */
const fallbackTitle = (url: string, rawText: string = ''): string => {
    // Try first line of text
    if (rawText) {
        const firstLine = rawText.split('\n')[0].trim();
        if (firstLine.length > 0) {
            return firstLine.substring(0, 100);
        }
    }

    // Fallback to hostname
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        return hostname;
    } catch {
        return 'Untitled Link';
    }
};

/**
 * Generate fallback summary from raw text
 * IMPORTANT: This is NOT AI-generated, just truncation of actual text
 */
const fallbackSummary = (rawText: string, language: string = 'KR'): string => {
    if (!rawText || rawText.trim().length === 0) {
        return language === 'KR'
            ? '원문 링크만 저장된 클립입니다.'
            : 'URL-only clip. Click to view original content.';
    }

    // If text is short enough, use it as-is
    if (rawText.length <= 300) {
        return rawText.trim();
    }

    // Otherwise truncate
    return rawText.substring(0, 300).trim() + '…';
};

/**
 * Generate metadata using OpenAI
 * 
 * CRITICAL RULES:
 * 1. ONLY called when rawText exists and is non-empty
 * 2. temperature = 0 for deterministic results
 * 3. Prompt explicitly forbids generating new content
 * 4. AI can ONLY summarize/classify existing rawText
 * 5. Returns null if rawText is insufficient
 */
export const safeGenerateMetadata = async (
    rawText: string,
    url: string,
    platform: string,
    language: string = 'KR'
): Promise<ClipMetadata | null> => {
    // RULE: Never call AI if no raw text
    if (!rawText || rawText.trim().length === 0) {
        console.log('[AI Metadata] Skipping: No raw text available');
        return null;
    }

    try {
        const langName = language === 'KR' ? 'Korean' : 'English';

        const prompt = `You are a metadata generation assistant. Your job is to analyze EXISTING content and create metadata.

CRITICAL RULES:
- DO NOT generate, invent, or hallucinate ANY information not present in CONTENT below
- DO NOT add examples, explanations, or expand on ideas
- DO NOT make assumptions or predictions
- ONLY extract and reorganize what already exists in CONTENT
- If CONTENT is short, keep summary short too (direct quote is fine)
- Summary MUST be derived ONLY from CONTENT, no additions

URL: ${url}
Platform: ${platform}

CONTENT:
"""
${rawText.substring(0, 5000)}
"""

Generate JSON metadata based STRICTLY on the CONTENT above:
{
  "title": "Descriptive title in ${langName} (max 60 chars, from CONTENT only)",
  "summary": "3-5 sentence summary in ${langName} (from CONTENT only, no additions)",
  "keywords": ["5 relevant keywords in ${langName} from CONTENT"],
  "category": "One of: Design, Dev, AI, Product, Other",
  "sentiment": "positive | neutral | negative",
  "type": "article | video | image | social_post | website"
}

Return ONLY valid JSON, no markdown or explanations.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0, // CRITICAL: Deterministic results
            max_tokens: 400,
            messages: [
                {
                    role: 'system',
                    content: 'You are a precise metadata extractor. You NEVER generate new information. You ONLY reorganize existing content.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const responseText = completion.choices[0].message.content || '{}';

        // Extract JSON
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('[AI Metadata] Failed to extract JSON from response');
            return null;
        }

        const aiData = JSON.parse(jsonMatch[0]);

        // Validate and return
        return {
            title: aiData.title || fallbackTitle(url, rawText),
            summary: aiData.summary || fallbackSummary(rawText, language),
            keywords: Array.isArray(aiData.keywords) ? aiData.keywords.slice(0, 5) : [],
            category: aiData.category || 'Other',
            sentiment: aiData.sentiment || 'neutral',
            type: aiData.type || 'website'
        };

    } catch (error) {
        console.error('[AI Metadata] Generation failed:', error);
        return null;
    }
};

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

/**
 * Create a clip from raw content
 * 
 * INVARIANTS (MUST BE MAINTAINED):
 * 1. contentMarkdown = rawText (exactly as provided, no AI modification)
 * 2. htmlContent = input.htmlContent (exactly as provided, no AI modification)
 * 3. images = input.images (exactly as provided, no AI modification)
 * 4. AI only generates: title, summary, keywords, category (from rawText)
 * 5. If rawText is empty, NO AI call is made
 * 6. Fallback metadata is simple extraction, not AI generation
 */
export const createClipFromContent = async (
    input: ClipContentInput,
    options?: { language?: string }
): Promise<Clip> => {
    const { url, sourceType, rawText, htmlContent, images, userId, author, authorAvatar, authorHandle } = input;
    const language = options?.language || 'KR';

    console.log(`[Clip Service] Creating clip from raw content`);
    console.log(`[Clip Service] - URL: ${url}`);
    console.log(`[Clip Service] - Raw text length: ${rawText?.length || 0} chars`);
    console.log(`[Clip Service] - Images count: ${images?.length || 0}`);
    console.log(`[Clip Service] - Author: ${author || './A'}`);
    console.log(`[Clip Service] - Author Avatar: ${authorAvatar || './A'}`);


    // INVARIANT: Store raw content exactly as provided
    const contentMarkdown = rawText || '';
    const contentHtml = htmlContent || '';

    // Filter images to remove profile pics, icons, and UI elements
    const rawImages = images || [];
    const filteredImages = filterClipImages(rawImages);
    console.log(`[Clip Service] Filtered images: ${rawImages.length} -> ${filteredImages.length}`);

    // Cache images to Firebase Storage for permanent access
    // This prevents image loss from expired CDN URLs (especially Instagram/Threads)
    let clipImages: string[] = filteredImages;
    if (filteredImages.length > 0) {
        console.log(`[Clip Service] Caching ${filteredImages.length} images to Firebase Storage...`);
        clipImages = await cacheImagesWithFallback(filteredImages, userId);
        console.log(`[Clip Service] - Cached images: ${clipImages.length}`);
    }

    // Try to generate AI metadata (only if rawText exists)
    let metadata: ClipMetadata | null = null;
    if (rawText && rawText.trim().length > 0) {
        metadata = await safeGenerateMetadata(rawText, url, sourceType, language);
    }

    // Use AI metadata if available, otherwise use fallbacks
    const title = metadata?.title || fallbackTitle(url, rawText || '');
    const summary = metadata?.summary || fallbackSummary(rawText || '', language);
    const keywords = metadata?.keywords || [];
    const category = metadata?.category || 'Other';
    const sentiment = metadata?.sentiment || 'neutral';
    const type = metadata?.type || 'website';

    console.log(`[Clip Service] - AI metadata: ${metadata ? 'generated' : 'skipped (no text)'}`);
    console.log(`[Clip Service] - Title: ${title}`);

    // Limit content size to avoid Firestore 1MB document limit
    const MAX_CONTENT_LENGTH = 100000; // 100KB for text content
    const MAX_IMAGES = 10; // Limit number of images

    const truncatedMarkdown = contentMarkdown.length > MAX_CONTENT_LENGTH
        ? contentMarkdown.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated...]'
        : contentMarkdown;
    const truncatedHtml = contentHtml && contentHtml.length > MAX_CONTENT_LENGTH
        ? contentHtml.substring(0, MAX_CONTENT_LENGTH)
        : contentHtml;
    const limitedImages = clipImages.slice(0, MAX_IMAGES);

    console.log(`[Clip Service] - Content limited: markdown ${contentMarkdown.length} -> ${truncatedMarkdown.length}, images ${clipImages.length} -> ${limitedImages.length}`);

    // Determine thumbnail with fallback
    const fallbackThumbnails = [
        '/fallback-thumbnails/fallback-1.png',
        '/fallback-thumbnails/fallback-2.png',
        '/fallback-thumbnails/fallback-3.png'
    ];
    const randomFallback = fallbackThumbnails[Math.floor(Math.random() * fallbackThumbnails.length)];
    const thumbnailImage = limitedImages.length > 0 ? limitedImages[0] : randomFallback;

    // Prepare clip data
    const now = Timestamp.now();
    const clipData = {
        userId,
        url,
        platform: sourceType,
        template: sourceType,
        source: sourceType, // For sidebar filter consistency
        title,
        summary,
        keywords,
        category,
        sentiment,
        type,
        image: thumbnailImage,
        author: author || '',
        ...(authorAvatar && { authorAvatar }), // Only include if defined
        authorHandle: authorHandle || '',
        authorProfile: authorAvatar ? {
            avatar: authorAvatar,
            handle: authorHandle || author || ''
        } : null,
        mediaItems: clipImages,
        engagement: {
            likes: '0',
            views: '0',
            comments: '0'
        },
        mentions: [{ label: 'Original link', url }],
        comments: [],
        publishDate: null,
        htmlContent: truncatedHtml,
        collectionIds: [],
        viewCount: 0,
        likeCount: 0,
        createdAt: now,  // Use Firestore Timestamp
        updatedAt: now,  // Use Firestore Timestamp
        // INVARIANT: These fields MUST contain ONLY raw extracted content
        rawMarkdown: truncatedMarkdown,
        contentMarkdown: truncatedMarkdown,
        contentHtml: truncatedHtml,
        images: limitedImages
    };

    // Save to Firestore using Admin SDK
    const docRef = await db.collection('clips').add(clipData);

    console.log(`[Clip Service] Clip created: ${docRef.id}`);
    console.log(`[Clip Service] - userId: ${userId}`);

    // Return created clip
    return {
        id: docRef.id,
        ...clipData,
        createdAt: clipData.createdAt.toDate().toISOString(),
        updatedAt: clipData.updatedAt.toDate().toISOString()
    };
};
