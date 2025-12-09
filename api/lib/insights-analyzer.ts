/**
 * Insights Analyzer
 * 
 * Analyzes user's clip data to generate personalized insights:
 * - Top keywords, categories, sources
 * - Sentiment breakdown
 * - AI-generated highlight message
 * - New interests detection
 * - Personalized recommendations
 * 
 * NOTE: This is an independent module - does NOT affect existing extraction logic.
 */

import { getFirestore, collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// INTERFACES
// ============================================================================

export interface KeywordStat {
    keyword: string;
    count: number;
}

export interface CategoryStat {
    category: string;
    count: number;
    color?: string;
}

export interface SourceStat {
    source: string;
    domain: string;
    count: number;
    favicon?: string;
}

export interface SentimentBreakdown {
    positive: number;
    neutral: number;
    negative: number;
}

export interface ClipReference {
    id: string;
    title: string;
    url: string;
    wordCount?: number;
}

export interface Recommendation {
    type: 'internal' | 'external';
    title: string;
    reason: string;
    url?: string;
    searchQuery?: string;
    clipId?: string;
}

export interface InsightResult {
    // Period info
    period: 'weekly' | 'monthly' | 'custom';
    startDate: string;
    endDate: string;
    totalClips: number;

    // Statistics
    topKeywords: KeywordStat[];
    topCategories: CategoryStat[];
    topSources: SourceStat[];

    // Sentiment analysis
    sentimentBreakdown: SentimentBreakdown;
    overallSentiment: 'positive' | 'neutral' | 'negative';

    // AI-generated insights
    highlight: string;  // "이번 주에 많이 저장한 주제는 'AI 디자인 트렌드' 입니다"
    newInterests: string[];  // Newly emerging interests
    interestPrediction: string;  // What they might be interested in next

    // Content stats
    longestClip?: ClipReference;
    shortestClip?: ClipReference;

    // Recommendations
    recommendations: Recommendation[];

    // Metadata
    generatedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return 'unknown';
    }
}

/**
 * Get platform display name
 */
function getPlatformDisplayName(platform: string): string {
    const names: Record<string, string> = {
        'youtube': 'YouTube',
        'instagram': 'Instagram',
        'threads': 'Threads',
        'web': 'Web',
        'linkedin': 'LinkedIn',
        'twitter': 'Twitter',
    };
    return names[platform] || platform;
}

/**
 * Get date range for period
 */
function getDateRange(period: 'weekly' | 'monthly' | 'custom', customDays?: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
        case 'weekly':
            start.setDate(end.getDate() - 7);
            break;
        case 'monthly':
            start.setMonth(end.getMonth() - 1);
            break;
        case 'custom':
            start.setDate(end.getDate() - (customDays || 7));
            break;
    }

    return { start, end };
}

/**
 * Count word occurrences in text
 */
function countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

// ============================================================================
// MAIN ANALYZER
// ============================================================================

/**
 * Analyze user's clips and generate insights
 */
export async function analyzeUserClips(
    db: FirebaseFirestore.Firestore,
    userId: string,
    period: 'weekly' | 'monthly' | 'custom' = 'weekly',
    customDays?: number
): Promise<InsightResult> {
    const { start, end } = getDateRange(period, customDays);

    console.log(`[Insights] Analyzing clips for user ${userId} from ${start.toISOString()} to ${end.toISOString()}`);

    // Query clips within date range
    const clipsRef = collection(db, 'clips');
    const q = query(
        clipsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', start.toISOString()),
        where('createdAt', '<=', end.toISOString()),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const clips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as any[];

    console.log(`[Insights] Found ${clips.length} clips in period`);

    if (clips.length === 0) {
        return createEmptyInsight(period, start, end);
    }

    // Aggregate statistics
    const keywordCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const sourceCounts: Record<string, { count: number; domain: string }> = {};
    const sentimentCounts: SentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };

    let longestClip: ClipReference | undefined;
    let shortestClip: ClipReference | undefined;
    let maxWords = 0;
    let minWords = Infinity;

    for (const clip of clips) {
        // Keywords
        if (clip.keywords && Array.isArray(clip.keywords)) {
            for (const keyword of clip.keywords) {
                const k = keyword.toLowerCase().trim();
                if (k) {
                    keywordCounts[k] = (keywordCounts[k] || 0) + 1;
                }
            }
        }

        // Categories
        if (clip.category) {
            const cat = clip.category;
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        // Sources (platform + domain)
        const platform = clip.platform || 'web';
        const domain = extractDomain(clip.url || '');
        const sourceKey = getPlatformDisplayName(platform);
        if (!sourceCounts[sourceKey]) {
            sourceCounts[sourceKey] = { count: 0, domain };
        }
        sourceCounts[sourceKey].count++;

        // Sentiment
        const sentiment = clip.sentiment || 'neutral';
        if (sentimentCounts[sentiment as keyof SentimentBreakdown] !== undefined) {
            sentimentCounts[sentiment as keyof SentimentBreakdown]++;
        }

        // Word count for longest/shortest
        const wordCount = countWords(clip.summary || clip.title || '');
        if (wordCount > maxWords) {
            maxWords = wordCount;
            longestClip = {
                id: clip.id,
                title: clip.title || 'Untitled',
                url: clip.url,
                wordCount
            };
        }
        if (wordCount < minWords && wordCount > 0) {
            minWords = wordCount;
            shortestClip = {
                id: clip.id,
                title: clip.title || 'Untitled',
                url: clip.url,
                wordCount
            };
        }
    }

    // Sort and get top items
    const topKeywords = Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const topSources = Object.entries(sourceCounts)
        .map(([source, data]) => ({
            source,
            domain: data.domain,
            count: data.count,
            favicon: `https://www.google.com/s2/favicons?domain=${data.domain}&sz=32`
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Determine overall sentiment
    const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
    let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (sentimentCounts.positive > sentimentCounts.negative && sentimentCounts.positive > sentimentCounts.neutral) {
        overallSentiment = 'positive';
    } else if (sentimentCounts.negative > sentimentCounts.positive && sentimentCounts.negative > sentimentCounts.neutral) {
        overallSentiment = 'negative';
    }

    // Generate AI insights
    const aiInsights = await generateAIInsights(topKeywords, topCategories, topSources, clips.length, period);

    // Generate recommendations
    const recommendations = await generateRecommendations(topKeywords, topCategories, clips);

    return {
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalClips: clips.length,
        topKeywords,
        topCategories,
        topSources,
        sentimentBreakdown: sentimentCounts,
        overallSentiment,
        highlight: aiInsights.highlight,
        newInterests: aiInsights.newInterests,
        interestPrediction: aiInsights.prediction,
        longestClip,
        shortestClip,
        recommendations,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Generate AI-powered insights using Gemini
 */
async function generateAIInsights(
    topKeywords: KeywordStat[],
    topCategories: CategoryStat[],
    topSources: SourceStat[],
    totalClips: number,
    period: 'weekly' | 'monthly' | 'custom'
): Promise<{ highlight: string; newInterests: string[]; prediction: string }> {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn('[Insights] No Gemini API key, using fallback insights');
        return generateFallbackInsights(topKeywords, topCategories, period);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const periodKo = period === 'weekly' ? '이번 주' : period === 'monthly' ? '이번 달' : '최근';

        const prompt = `
사용자의 콘텐츠 저장 패턴을 분석해서 인사이트를 생성해주세요.

데이터:
- 총 저장 수: ${totalClips}개
- 상위 키워드: ${topKeywords.slice(0, 5).map(k => `${k.keyword}(${k.count}회)`).join(', ')}
- 상위 카테고리: ${topCategories.slice(0, 3).map(c => `${c.category}(${c.count}개)`).join(', ')}
- 주요 출처: ${topSources.slice(0, 3).map(s => s.source).join(', ')}

다음을 JSON 형식으로 출력하세요:
{
  "highlight": "${periodKo}에 많이 저장한 주제에 대한 한 문장 요약 (친근한 말투, 이모지 포함)",
  "newInterests": ["새롭게 발견된 관심사 1-3개"],
  "prediction": "다음에 관심 가질 것 같은 주제 예측 (한 문장)"
}

JSON만 출력하세요.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                highlight: parsed.highlight || generateFallbackHighlight(topKeywords, period),
                newInterests: parsed.newInterests || [],
                prediction: parsed.prediction || ''
            };
        }
    } catch (error) {
        console.error('[Insights] AI generation error:', error);
    }

    return generateFallbackInsights(topKeywords, topCategories, period);
}

/**
 * Fallback insights when AI is not available
 */
function generateFallbackInsights(
    topKeywords: KeywordStat[],
    topCategories: CategoryStat[],
    period: 'weekly' | 'monthly' | 'custom'
): { highlight: string; newInterests: string[]; prediction: string } {
    return {
        highlight: generateFallbackHighlight(topKeywords, period),
        newInterests: topKeywords.slice(3, 6).map(k => k.keyword),
        prediction: topKeywords.length > 0
            ? `${topKeywords[0].keyword} 관련 콘텐츠에 계속 관심이 있을 것 같아요`
            : ''
    };
}

/**
 * Generate fallback highlight message
 */
function generateFallbackHighlight(topKeywords: KeywordStat[], period: 'weekly' | 'monthly' | 'custom'): string {
    const periodKo = period === 'weekly' ? '이번 주' : period === 'monthly' ? '이번 달' : '최근';

    if (topKeywords.length === 0) {
        return `${periodKo}에 저장한 클립이 없습니다`;
    }

    const topKeyword = topKeywords[0].keyword;
    return `🎯 ${periodKo}에 많이 저장한 주제는 '${topKeyword}' 입니다`;
}

/**
 * Generate content recommendations
 */
async function generateRecommendations(
    topKeywords: KeywordStat[],
    topCategories: CategoryStat[],
    clips: any[]
): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Internal recommendations: Find clips that might be related but less viewed
    // This would require more sophisticated matching in production
    if (clips.length > 5) {
        const randomClip = clips[Math.floor(Math.random() * clips.length)];
        recommendations.push({
            type: 'internal',
            title: randomClip.title || 'Saved Clip',
            reason: '비슷한 관심사의 클립을 다시 살펴보세요',
            clipId: randomClip.id,
            url: randomClip.url
        });
    }

    // External recommendations based on top keywords
    for (const keyword of topKeywords.slice(0, 2)) {
        recommendations.push({
            type: 'external',
            title: `${keyword.keyword} 관련 콘텐츠`,
            reason: `자주 저장하는 '${keyword.keyword}' 주제의 새로운 콘텐츠를 찾아보세요`,
            searchQuery: keyword.keyword
        });
    }

    return recommendations;
}

/**
 * Create empty insight result for users with no clips
 */
function createEmptyInsight(period: 'weekly' | 'monthly' | 'custom', start: Date, end: Date): InsightResult {
    const periodKo = period === 'weekly' ? '이번 주' : period === 'monthly' ? '이번 달' : '최근';

    return {
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalClips: 0,
        topKeywords: [],
        topCategories: [],
        topSources: [],
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        overallSentiment: 'neutral',
        highlight: `${periodKo}에 저장한 클립이 없습니다. 관심 있는 콘텐츠를 저장해보세요! 📚`,
        newInterests: [],
        interestPrediction: '',
        recommendations: [],
        generatedAt: new Date().toISOString()
    };
}

export default analyzeUserClips;
