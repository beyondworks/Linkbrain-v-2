/**
 * InsightsPage Component
 * 
 * Full insights dashboard showing:
 * - Weekly/Monthly highlight
 * - Keyword cloud
 * - Top sources
 * - Sentiment analysis
 * - Report history
 * 
 * Matches existing design system (ClipGrid, ProfilePage style).
 * 
 * NOTE: This is a NEW page - does NOT modify existing pages.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Sparkles, TrendingUp, PieChart, BarChart3, Calendar,
    ChevronRight, RefreshCw, FileText, Clock, Star,
    ArrowLeft, Download, Share2
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

// Types
interface KeywordStat {
    keyword: string;
    count: number;
}

interface CategoryStat {
    category: string;
    count: number;
}

interface SourceStat {
    source: string;
    count: number;
    favicon?: string;
}

interface SentimentBreakdown {
    positive: number;
    neutral: number;
    negative: number;
}

interface InsightData {
    period: 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    totalClips: number;
    topKeywords: KeywordStat[];
    topCategories: CategoryStat[];
    topSources: SourceStat[];
    sentimentBreakdown: SentimentBreakdown;
    overallSentiment: 'positive' | 'neutral' | 'negative';
    highlight: string;
    newInterests: string[];
    interestPrediction: string;
    generatedAt: string;
}

interface Report {
    id: string;
    type: 'weekly' | 'monthly';
    period: { start: string; end: string; label: string };
    totalClips: number;
    highlight: string;
    isRead: boolean;
    createdAt: string;
}

interface InsightsPageProps {
    language: 'KR' | 'EN';
    onBack: () => void;
    user?: any;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ language, onBack, user: propUser }) => {
    const [user, setUser] = useState<any>(propUser || null);
    const [insight, setInsight] = useState<InsightData | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (propUser) {
            setUser(propUser);
        } else {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
            });
            return () => unsubscribe();
        }
    }, [propUser]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const token = await user.getIdToken();

            // Fetch insights
            const insightRes = await fetch(`/api/insights?userId=${user.uid}&period=${activeTab}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (insightRes.ok) {
                const data = await insightRes.json();
                setInsight(data.insight);
            }

            // Fetch reports
            const reportsRes = await fetch(`/api/reports?userId=${user.uid}&limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (reportsRes.ok) {
                const data = await reportsRes.json();
                setReports(data.reports || []);
            }
        } catch (err) {
            console.error('[InsightsPage] Error:', err);
            toast.error(language === 'KR' ? '데이터를 불러오는데 실패했습니다' : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (type: 'weekly' | 'monthly') => {
        if (!user) return;
        setGenerating(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.uid, type })
            });

            if (response.ok) {
                toast.success(language === 'KR' ? '리포트가 생성되었습니다' : 'Report generated');
                fetchData();
            }
        } catch (err) {
            toast.error(language === 'KR' ? '리포트 생성에 실패했습니다' : 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    // Calculate sentiment percentages
    const getSentimentPercentages = () => {
        if (!insight) return { positive: 0, neutral: 0, negative: 0 };
        const total = insight.sentimentBreakdown.positive + insight.sentimentBreakdown.neutral + insight.sentimentBreakdown.negative;
        if (total === 0) return { positive: 0, neutral: 0, negative: 0 };
        return {
            positive: Math.round((insight.sentimentBreakdown.positive / total) * 100),
            neutral: Math.round((insight.sentimentBreakdown.neutral / total) * 100),
            negative: Math.round((insight.sentimentBreakdown.negative / total) * 100)
        };
    };

    const sentimentPercentages = getSentimentPercentages();

    return (
        <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onBack}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-[#3d3d3d] dark:text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-[#3d3d3d] dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#21DBA4]" />
                                    {language === 'KR' ? 'AI 인사이트' : 'AI Insights'}
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={() => generateReport(activeTab)}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-2 bg-[#21DBA4] text-white rounded-full text-sm font-medium hover:bg-[#1ec795] transition-colors disabled:opacity-50"
                        >
                            {generating ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            {language === 'KR' ? '리포트 생성' : 'Generate Report'}
                        </button>
                    </div>

                    {/* Period Tabs */}
                    <div className="flex gap-2 mt-4">
                        {(['weekly', 'monthly'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setActiveTab(period)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === period
                                    ? 'bg-[#21DBA4] text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-[#3d3d3d] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {period === 'weekly'
                                    ? (language === 'KR' ? '주간' : 'Weekly')
                                    : (language === 'KR' ? '월간' : 'Monthly')
                                }
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
                {loading ? (
                    <LoadingState />
                ) : !insight || insight.totalClips === 0 ? (
                    <EmptyState language={language} />
                ) : (
                    <>
                        {/* Highlight Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-[#21DBA4] to-[#1ec795] rounded-2xl p-6 text-white shadow-lg"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-sm font-medium opacity-90">
                                    {activeTab === 'weekly'
                                        ? (language === 'KR' ? '이번 주 하이라이트' : 'This Week\'s Highlight')
                                        : (language === 'KR' ? '이번 달 하이라이트' : 'This Month\'s Highlight')
                                    }
                                </span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold leading-snug">
                                {insight.highlight}
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-sm opacity-80">
                                <TrendingUp className="w-4 h-4" />
                                <span>
                                    {language === 'KR'
                                        ? `총 ${insight.totalClips}개의 클립 분석`
                                        : `${insight.totalClips} clips analyzed`
                                    }
                                </span>
                            </div>
                        </motion.div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Top Keywords */}
                            <StatsCard
                                title={language === 'KR' ? '인기 키워드' : 'Top Keywords'}
                                icon={<BarChart3 className="w-5 h-5" />}
                            >
                                <div className="flex flex-wrap gap-2">
                                    {insight.topKeywords.slice(0, 8).map((kw, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 rounded-full text-sm font-medium"
                                            style={{
                                                backgroundColor: `rgba(33, 219, 164, ${0.1 + (0.15 * (1 - idx / 8))})`,
                                                color: '#21DBA4'
                                            }}
                                        >
                                            {kw.keyword}
                                            <span className="ml-1 opacity-60">({kw.count})</span>
                                        </span>
                                    ))}
                                </div>
                            </StatsCard>

                            {/* Top Sources */}
                            <StatsCard
                                title={language === 'KR' ? '주요 출처' : 'Top Sources'}
                                icon={<PieChart className="w-5 h-5" />}
                            >
                                <div className="space-y-3">
                                    {insight.topSources.slice(0, 5).map((source, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {source.favicon && (
                                                    <img src={source.favicon} alt="" className="w-4 h-4 rounded" />
                                                )}
                                                <span className="text-sm text-[#3d3d3d] dark:text-white">
                                                    {source.source}
                                                </span>
                                            </div>
                                            <span className="text-sm text-[#959595]">{source.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </StatsCard>

                            {/* Sentiment Analysis */}
                            <StatsCard
                                title={language === 'KR' ? '감정 분석' : 'Sentiment Analysis'}
                                icon={<Star className="w-5 h-5" />}
                            >
                                <div className="space-y-3">
                                    <SentimentBar
                                        label={language === 'KR' ? '긍정' : 'Positive'}
                                        percentage={sentimentPercentages.positive}
                                        color="#21DBA4"
                                    />
                                    <SentimentBar
                                        label={language === 'KR' ? '중립' : 'Neutral'}
                                        percentage={sentimentPercentages.neutral}
                                        color="#959595"
                                    />
                                    <SentimentBar
                                        label={language === 'KR' ? '부정' : 'Negative'}
                                        percentage={sentimentPercentages.negative}
                                        color="#EF4444"
                                    />
                                </div>
                            </StatsCard>

                            {/* New Interests */}
                            <StatsCard
                                title={language === 'KR' ? '새로운 관심사' : 'New Interests'}
                                icon={<TrendingUp className="w-5 h-5" />}
                            >
                                {insight.newInterests && insight.newInterests.length > 0 ? (
                                    <div className="space-y-2">
                                        {insight.newInterests.map((interest, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-[#21DBA4]/5"
                                            >
                                                <Star className="w-4 h-4 text-[#21DBA4]" />
                                                <span className="text-sm text-[#3d3d3d] dark:text-white">
                                                    {interest}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#959595]">
                                        {language === 'KR' ? '새로운 관심사가 발견되지 않았습니다' : 'No new interests detected'}
                                    </p>
                                )}

                                {insight.interestPrediction && (
                                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                                            {language === 'KR' ? '🔮 예측' : '🔮 Prediction'}
                                        </p>
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            {insight.interestPrediction}
                                        </p>
                                    </div>
                                )}
                            </StatsCard>
                        </div>

                        {/* Past Reports */}
                        {reports.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-lg font-bold text-[#3d3d3d] dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[#21DBA4]" />
                                    {language === 'KR' ? '지난 리포트' : 'Past Reports'}
                                </h2>
                                <div className="space-y-3">
                                    {reports.map((report) => (
                                        <ReportCard key={report.id} report={report} language={language} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Sub-components
const StatsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800"
    >
        <div className="flex items-center gap-2 mb-4 text-[#21DBA4]">
            {icon}
            <h3 className="font-semibold text-[#3d3d3d] dark:text-white">{title}</h3>
        </div>
        {children}
    </motion.div>
);

const SentimentBar: React.FC<{ label: string; percentage: number; color: string }> = ({ label, percentage, color }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#3d3d3d] dark:text-white">{label}</span>
            <span className="text-[#959595]">{percentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    </div>
);

const ReportCard: React.FC<{ report: Report; language: 'KR' | 'EN' }> = ({ report, language }) => (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-[#21DBA4]/30 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${report.type === 'weekly' ? 'bg-[#21DBA4]/10' : 'bg-blue-500/10'
                }`}>
                <Calendar className={`w-5 h-5 ${report.type === 'weekly' ? 'text-[#21DBA4]' : 'text-blue-500'
                    }`} />
            </div>
            <div>
                <p className="font-medium text-[#3d3d3d] dark:text-white">
                    {report.period.label}
                </p>
                <p className="text-xs text-[#959595]">
                    {report.totalClips} {language === 'KR' ? '클립' : 'clips'}
                    {!report.isRead && (
                        <span className="ml-2 px-1.5 py-0.5 bg-[#21DBA4] text-white text-[10px] rounded-full">
                            NEW
                        </span>
                    )}
                </p>
            </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#959595]" />
    </div>
);

const LoadingState = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
        ))}
    </div>
);

const EmptyState: React.FC<{ language: 'KR' | 'EN' }> = ({ language }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
    >
        <Sparkles className="w-16 h-16 text-[#21DBA4]/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#3d3d3d] dark:text-white mb-2">
            {language === 'KR' ? '아직 분석할 데이터가 없어요' : 'No data to analyze yet'}
        </h2>
        <p className="text-[#959595] max-w-sm mx-auto">
            {language === 'KR'
                ? '클립을 저장하면 AI가 자동으로 관심사를 분석해드려요'
                : 'Save some clips and AI will analyze your interests automatically'
            }
        </p>
    </motion.div>
);

export default InsightsPage;
