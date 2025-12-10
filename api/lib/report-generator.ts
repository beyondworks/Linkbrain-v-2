/**
 * Report Generator
 * 
 * Generates comprehensive insight reports including:
 * - Keyword cloud data
 * - Source statistics
 * - Content analysis (longest/shortest)
 * - Sentiment analysis
 * - AI-powered predictions and recommendations
 * 
 * Reports are stored in Firestore and can be retrieved later.
 * 
 * NOTE: Independent module - does NOT affect existing functionality.
 */

import { getFirestore, Firestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { analyzeUserClips, InsightResult, KeywordStat, CategoryStat, SourceStat, Recommendation } from './insights-analyzer';

// ============================================================================
// INTERFACES
// ============================================================================

export interface WordCloudItem {
    text: string;
    value: number;  // Weight for visualization
}

export interface SentimentAnalysis {
    overall: 'positive' | 'neutral' | 'negative';
    breakdown: {
        positive: number;
        neutral: number;
        negative: number;
    };
    percentages: {
        positive: number;
        neutral: number;
        negative: number;
    };
    insight: string;  // AI-generated sentiment insight
}

export interface ClipStat {
    id: string;
    title: string;
    url: string;
    wordCount: number;
}

export interface Report {
    id: string;
    userId: string;
    type: 'weekly' | 'monthly';

    // Period info
    period: {
        start: string;
        end: string;
        label: string;  // "12월 1주차" or "2024년 12월"
    };

    // Statistics
    totalClips: number;
    keywordCloud: WordCloudItem[];
    topCategories: CategoryStat[];
    topSources: SourceStat[];

    // Content analysis
    longestClip?: ClipStat | null;
    shortestClip?: ClipStat | null;
    averageWordCount: number;

    // Sentiment analysis
    sentimentAnalysis: SentimentAnalysis;

    // AI insights
    highlight: string;
    newInterests: string[];
    interestPrediction: string;

    // Recommendations
    recommendations: Recommendation[];

    // Metadata
    createdAt: string;
    isRead: boolean;
    notificationSent: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get human-readable period label
 */
function getPeriodLabel(type: 'weekly' | 'monthly', startDate: Date): string {
    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();

    if (type === 'monthly') {
        return `${year}년 ${month}월`;
    }

    // Weekly: Calculate week number of the month
    const firstDayOfMonth = new Date(year, startDate.getMonth(), 1);
    const weekNumber = Math.ceil((startDate.getDate() + firstDayOfMonth.getDay()) / 7);

    return `${month}월 ${weekNumber}주차`;
}

/**
 * Convert keywords to word cloud format
 */
function toWordCloud(keywords: KeywordStat[]): WordCloudItem[] {
    if (keywords.length === 0) return [];

    // Normalize values for visualization (1-100 scale)
    const maxCount = Math.max(...keywords.map(k => k.count));

    return keywords.map(k => ({
        text: k.keyword,
        value: Math.max(10, Math.round((k.count / maxCount) * 100))
    }));
}

/**
 * Generate sentiment insight text
 */
function generateSentimentInsight(
    overall: 'positive' | 'neutral' | 'negative',
    percentages: { positive: number; neutral: number; negative: number }
): string {
    if (overall === 'positive') {
        return `대부분의 콘텐츠가 긍정적인 톤을 가지고 있어요 (${percentages.positive}%). 영감을 주는 콘텐츠를 많이 저장하시네요.`;
    } else if (overall === 'negative') {
        return `비판적이거나 문제 해결 관련 콘텐츠를 많이 저장하셨어요 (${percentages.negative}%). 분석적인 시각을 가지고 계시네요.`;
    } else {
        return `다양한 톤의 콘텐츠를 균형있게 저장하셨어요. 폭넓은 관심사를 가지고 계시네요.`;
    }
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate a comprehensive report
 */
export async function generateReport(
    db: Firestore,
    userId: string,
    type: 'weekly' | 'monthly'
): Promise<Report> {
    console.log(`[Report Generator] Creating ${type} report for user ${userId}`);

    // Get insights data
    const insight = await analyzeUserClips(db, userId, type);

    // Calculate period dates
    const endDate = new Date();
    const startDate = new Date();
    if (type === 'weekly') {
        startDate.setDate(endDate.getDate() - 7);
    } else {
        startDate.setMonth(endDate.getMonth() - 1);
    }

    // Calculate average word count
    let averageWordCount = 0;
    if (insight.longestClip && insight.shortestClip) {
        averageWordCount = Math.round((insight.longestClip.wordCount! + insight.shortestClip.wordCount!) / 2);
    }

    // Calculate sentiment percentages
    const total = insight.sentimentBreakdown.positive + insight.sentimentBreakdown.neutral + insight.sentimentBreakdown.negative;
    const percentages = {
        positive: total > 0 ? Math.round((insight.sentimentBreakdown.positive / total) * 100) : 0,
        neutral: total > 0 ? Math.round((insight.sentimentBreakdown.neutral / total) * 100) : 0,
        negative: total > 0 ? Math.round((insight.sentimentBreakdown.negative / total) * 100) : 0
    };

    // Generate report ID
    const reportId = `${userId}_${type}_${new Date().toISOString().split('T')[0]}`;

    const report: Report = {
        id: reportId,
        userId,
        type,
        period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            label: getPeriodLabel(type, startDate)
        },
        totalClips: insight.totalClips,
        keywordCloud: toWordCloud(insight.topKeywords),
        topCategories: insight.topCategories,
        topSources: insight.topSources,
        longestClip: insight.longestClip ? {
            id: insight.longestClip.id,
            title: insight.longestClip.title,
            url: insight.longestClip.url,
            wordCount: insight.longestClip.wordCount || 0
        } : null,
        shortestClip: insight.shortestClip ? {
            id: insight.shortestClip.id,
            title: insight.shortestClip.title,
            url: insight.shortestClip.url,
            wordCount: insight.shortestClip.wordCount || 0
        } : null,
        averageWordCount,
        sentimentAnalysis: {
            overall: insight.overallSentiment,
            breakdown: insight.sentimentBreakdown,
            percentages,
            insight: generateSentimentInsight(insight.overallSentiment, percentages)
        },
        highlight: insight.highlight,
        newInterests: insight.newInterests,
        interestPrediction: insight.interestPrediction,
        recommendations: insight.recommendations,
        createdAt: new Date().toISOString(),
        isRead: false,
        notificationSent: false
    };

    console.log(`[Report Generator] Report generated with ${report.totalClips} clips, ${report.keywordCloud.length} keywords`);

    return report;
}

/**
 * Check if a report should be generated (prevents duplicates)
 */
export function shouldGenerateReport(
    existingReports: Report[],
    type: 'weekly' | 'monthly'
): boolean {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if a report of this type was already generated today
    const existingToday = existingReports.find(r =>
        r.type === type &&
        r.createdAt.split('T')[0] === today
    );

    return !existingToday;
}

export default generateReport;
