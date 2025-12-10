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
    ChevronRight, ChevronLeft, RefreshCw, FileText, Clock, Star,
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
        <div className="w-full h-full bg-white dark:bg-[#121212] overflow-auto pt-2" style={{ zoom: 1.15 }}>
            {/* Header Area */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 px-6 md:px-8 py-4 mb-6">
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                    {/* Left: Title & Back */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-full bg-white dark:bg-[#1e1e1e] border border-[#E0E0E0] dark:border-gray-700 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:border-[#21DBA4] transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-[18px] font-bold text-[#3d3d3d] dark:text-white">
                            {language === 'KR' ? 'AI 인사이트' : 'AI Insights'}
                        </h1>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Period Toggle */}
                        <div className="bg-white dark:bg-[#1e1e1e] p-1 rounded-full border border-gray-200 dark:border-gray-800 flex items-center">
                            {(['weekly', 'monthly'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setActiveTab(period)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === period
                                        ? 'bg-[#3d3d3d] text-white dark:bg-white dark:text-black shadow-sm'
                                        : 'text-[#959595] hover:text-[#3d3d3d] dark:hover:text-gray-300'
                                        }`}
                                >
                                    {period === 'weekly'
                                        ? (language === 'KR' ? '주간' : 'Weekly')
                                        : (language === 'KR' ? '월간' : 'Monthly')
                                    }
                                </button>
                            ))}
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={() => generateReport(activeTab)}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-2 bg-[#21DBA4] text-white rounded-full text-sm font-bold hover:bg-[#1ec795] transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                        >
                            {generating ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                            {language === 'KR' ? '리포트 생성' : 'Generate Report'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 md:px-8 pb-20 w-full">
                {/* Content */}
                <div className="space-y-6">
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
                                className="bg-gradient-to-br from-[#21DBA4] to-[#1ec795] rounded-[24px] p-8 text-white shadow-lg"
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
                                <p className="text-xl md:text-3xl font-bold leading-snug">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                {language === 'KR' ? '예측' : 'Prediction'}
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
                                    className="pt-6"
                                >
                                    <h2 className="text-lg font-bold text-[#3d3d3d] dark:text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#21DBA4]" />
                                        {language === 'KR' ? '지난 리포트' : 'Past Reports'}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
    );
};

// Sub-components

const StatsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-6 border border-[#b5b5b5]/30 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
    >
        <div className="flex items-center gap-2.5 mb-5 text-[#21DBA4]">
            {icon}
            <h3 className="font-semibold text-[#3d3d3d] dark:text-white text-[15px]">{title}</h3>
        </div>
        <div className="flex-1">
            {children}
        </div>
    </motion.div>
);

const SentimentBar: React.FC<{ label: string; percentage: number; color: string }> = ({ label, percentage, color }) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#3d3d3d] dark:text-white text-[13px]">{label}</span>
            <span className="text-[#959595] text-[12px]">{percentage}%</span>
        </div>
        <div className="h-2 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: color }}
            />
        </div>
    </div>
);

const ReportCard: React.FC<{ report: Report; language: 'KR' | 'EN' }> = ({ report, language }) => (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-5 border border-[#b5b5b5]/30 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[18px] bg-[#21DBA4]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#21DBA4]" />
            </div>
            <div>
                <h4 className="font-semibold text-[#3d3d3d] dark:text-white text-[15px] mb-0.5">
                    {language === 'KR'
                        ? `${report.type === 'weekly' ? '주간' : '월간'} 리포트`
                        : `${report.type === 'weekly' ? 'Weekly' : 'Monthly'} Report`
                    }
                </h4>
                <p className="text-[12px] text-[#959595]">
                    {new Date(report.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#959595] group-hover:text-[#21DBA4] transition-colors" />
    </div>
);

const LoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-6 border border-[#b5b5b5]/30 dark:border-gray-800 h-[200px] animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a2a2a]" />
                    <div className="h-4 bg-gray-100 dark:bg-[#2a2a2a] rounded w-1/3" />
                </div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-100 dark:bg-[#2a2a2a] rounded w-full" />
                    <div className="h-3 bg-gray-100 dark:bg-[#2a2a2a] rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-[#2a2a2a] rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

const EmptyState: React.FC<{ language: 'KR' | 'EN' }> = ({ language }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#b5b5b5]/30 dark:border-gray-800"
        style={{ minHeight: '200px' }}
    >
        <h2 className="text-[15px] font-semibold text-[#3d3d3d] dark:text-white mb-2">
            {language === 'KR' ? '아직 분석할 데이터가 없어요' : 'No data to analyze yet'}
        </h2>
        <p className="text-[13px] text-[#959595] dark:text-gray-400">
            {language === 'KR'
                ? '클립을 저장하면 AI가 자동으로 관심사를 분석해드려요'
                : 'Save clips and AI will analyze your interests automatically'}
        </p>
    </motion.div>
);

export default InsightsPage;
