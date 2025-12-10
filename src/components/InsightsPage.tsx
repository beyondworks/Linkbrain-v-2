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
    ArrowLeft, Download, Share2, Globe, Activity, Zap
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

    // Brand Colors
    const brandColor = "text-[#21DBA4]";
    const brandBg = "bg-[#21DBA4]";
    const brandLightBg = "bg-[#21DBA4]/10";

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
        if (!user) {
            console.log('[InsightsPage] No user found, skipping fetch');
            return;
        }
        console.log('[InsightsPage] Fetching data for user:', user.uid);
        setLoading(true);

        try {
            const token = await user.getIdToken();
            console.log('[InsightsPage] Got auth token');

            // Fetch insights
            const insightUrl = `/api/insights?userId=${user.uid}&period=${activeTab}`;
            console.log('[InsightsPage] Calling API:', insightUrl);

            const insightRes = await fetch(insightUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (insightRes.ok) {
                const data = await insightRes.json();
                console.log('[InsightsPage] Insight data received:', data);
                setInsight(data.insight);
            } else {
                console.error('[InsightsPage] Insight API failed:', insightRes.status, insightRes.statusText);
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

    // Helper for date range display
    const getDateRangeLabel = () => {
        if (!insight) return '';
        const start = new Date(insight.startDate);
        const end = new Date(insight.endDate);
        return `${start.toLocaleDateString(language === 'KR' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(language === 'KR' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 pb-20 pt-8 font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border border-[#E0E0E0] dark:border-gray-700 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:border-[#21DBA4] transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                            {language === 'KR' ? 'AI 인사이트' : 'AI Insight'}
                            <span className="text-xs font-normal px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Beta</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-[#2a2a2a] rounded-full p-1">
                        <button
                            onClick={() => setActiveTab('weekly')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'weekly' ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            {language === 'KR' ? '주간' : 'Weekly'}
                        </button>
                        <button
                            onClick={() => setActiveTab('monthly')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'monthly' ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            {language === 'KR' ? '월간' : 'Monthly'}
                        </button>
                    </div>

                    <button
                        onClick={() => generateReport(activeTab)}
                        disabled={generating}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-white font-medium shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 ${brandBg}`}
                        style={{ boxShadow: '0 4px 14px 0 rgba(33, 219, 164, 0.3)' }}
                    >
                        {generating ? <RefreshCw className="w-4 h- animate-spin" /> : <FileText className="w-4 h-4" />}
                        <span>{language === 'KR' ? '리포트 생성' : 'Generate Report'}</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-8 animate-fade-in">
                {loading ? (
                    <LoadingState />
                ) : !insight || insight.totalClips === 0 ? (
                    <EmptyState language={language} />
                ) : (
                    <>
                        {/* Top Section: Overview / Trend */}
                        <section className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1 dark:text-white">
                                        {activeTab === 'weekly'
                                            ? (language === 'KR' ? '주간 인사이트 요약' : 'Weekly Insight Summary')
                                            : (language === 'KR' ? '월간 인사이트 요약' : 'Monthly Insight Summary')
                                        }
                                    </h2>
                                    <p className="text-gray-400 text-sm">{getDateRangeLabel()}</p>
                                </div>
                                <div className={`p-3 rounded-2xl ${brandLightBg} ${brandColor}`}>
                                    <Sparkles size={24} />
                                </div>
                            </div>

                            {/* Highlight Text */}
                            <div className="mb-8">
                                <p className="text-lg text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {insight.highlight}
                                </p>
                            </div>

                            {/* Simulated Chart Area - Visual Only as per request */}
                            <div className="h-32 w-full flex items-end gap-2 sm:gap-4 opacity-80">
                                {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                        <div className="w-full relative h-full flex items-end rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
                                            <div
                                                style={{ height: `${height}%` }}
                                                className={`w-full rounded-2xl transition-all duration-500 ease-out group-hover:bg-[#21DBA4] ${i === 5 ? brandBg : 'bg-gray-200 dark:bg-gray-700'}`}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${i === 5 ? brandColor : 'text-gray-400'}`}>
                                            {language === 'KR'
                                                ? ['월', '화', '수', '목', '금', '토', '일'][i]
                                                : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Grid Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Card 1: Trending Keywords */}
                            <Card title={language === 'KR' ? '인기 키워드' : 'Popular Keywords'} icon={<TrendingUp size={20} className={brandColor} />}>
                                <div className="flex flex-wrap gap-2.5">
                                    {insight.topKeywords.slice(0, 10).map((kw, i) => (
                                        <span
                                            key={i}
                                            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all hover:scale-105 cursor-default
                                              ${i < 3
                                                    ? `${brandLightBg} ${brandColor} border border-[#21DBA4]/20`
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}
                                            `}
                                        >
                                            {kw.keyword} <span className="opacity-60 text-xs ml-1">{kw.count}</span>
                                        </span>
                                    ))}
                                </div>
                            </Card>

                            {/* Card 2: Main Sources */}
                            <Card title={language === 'KR' ? '주요 출처' : 'Top Sources'} icon={<Globe size={20} className="text-blue-500" />}>
                                <div className="space-y-4">
                                    {insight.topSources.slice(0, 5).map((source, i) => (
                                        <div key={i} className="flex items-center justify-between group p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors -mx-2 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                                                    {source.favicon ? <img src={source.favicon} alt="" className="w-5 h-5" /> : <Globe size={18} />}
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-gray-200">{source.source}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-800 dark:bg-gray-400 rounded-full"
                                                        style={{ width: `${Math.min((source.count / insight.totalClips) * 100 * 2, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white w-6 text-right">{source.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Card 3: Sentiment Analysis */}
                            <Card title={language === 'KR' ? '감정 분석' : 'Sentiment Analysis'} icon={<Activity size={20} className="text-purple-500" />}>
                                <div className="space-y-6 pt-2">
                                    <SentimentBar
                                        label={language === 'KR' ? '긍정 (Positive)' : 'Positive'}
                                        percent={sentimentPercentages.positive}
                                        color="bg-[#21DBA4]"
                                    />
                                    <SentimentBar
                                        label={language === 'KR' ? '중립 (Neutral)' : 'Neutral'}
                                        percent={sentimentPercentages.neutral}
                                        color="bg-gray-300 dark:bg-gray-600"
                                    />
                                    <SentimentBar
                                        label={language === 'KR' ? '부정 (Negative)' : 'Negative'}
                                        percent={sentimentPercentages.negative}
                                        color="bg-red-400"
                                    />
                                </div>
                                <div className="mt-8 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        <span className="font-bold text-slate-700 dark:text-gray-200">{language === 'KR' ? '인사이트:' : 'Insight:'}</span> {insight.highlight}
                                    </p>
                                </div>
                            </Card>

                            {/* Card 4: New Interests */}
                            <Card title={language === 'KR' ? '새로운 관심사' : 'New Interests'} icon={<Zap size={20} className="text-yellow-500" />}>
                                <div className="space-y-3">
                                    {insight.newInterests && insight.newInterests.length > 0 ? (
                                        insight.newInterests.slice(0, 4).map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] hover:border-[#21DBA4]/30 hover:shadow-sm transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-[#21DBA4]">
                                                        <Sparkles size={14} />
                                                    </div>
                                                    <span className="font-medium text-slate-700 dark:text-gray-200">{item}</span>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#21DBA4] transition-colors" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 py-4 text-center">
                                            {language === 'KR' ? '새로운 관심사가 아직 없습니다.' : 'No new interests found yet.'}
                                        </p>
                                    )}
                                </div>

                                {insight.interestPrediction && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            {language === 'KR' ? 'AI 예측' : 'AI Prediction'}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-gray-300">
                                            {insight.interestPrediction}
                                        </p>
                                    </div>
                                )}
                            </Card>

                        </div>

                        {/* Reports List Section (Optional, kept for history) */}
                        {reports.length > 0 && (
                            <section className="mt-12">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[#21DBA4]" />
                                    {language === 'KR' ? '지난 리포트' : 'Past Reports'}
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {reports.map((report) => (
                                        <ReportCard key={report.id} report={report} language={language} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Reusable Components

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-[#1e1e1e] p-6 lg:p-8 rounded-[32px] shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
        <div className="flex items-center gap-3 mb-6">
            {icon}
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
        </div>
        <div className="flex-1">
            {children}
        </div>
    </div>
);

const SentimentBar: React.FC<{ label: string; percent: number; color: string }> = ({ label, percent, color }) => (
    <div>
        <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-gray-400">{label}</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{percent}%</span>
        </div>
        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    </div>
);

const ReportCard: React.FC<{ report: Report; language: 'KR' | 'EN' }> = ({ report, language }) => (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-5 border border-[#b5b5b5]/30 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between w-full md:w-[300px]">
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
            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 h-[250px] animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a2a2a]" />
                    <div className="h-5 bg-gray-100 dark:bg-[#2a2a2a] rounded w-1/3" />
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-100 dark:bg-[#2a2a2a] rounded w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-[#2a2a2a] rounded w-3/4" />
                    <div className="h-4 bg-gray-100 dark:bg-[#2a2a2a] rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

const EmptyState: React.FC<{ language: 'KR' | 'EN' }> = ({ language }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center bg-white dark:bg-[#1e1e1e] rounded-[32px] border border-gray-100 dark:border-gray-800"
        style={{ minHeight: '300px' }}
    >
        <TrendingUp className="w-12 h-12 text-[#21DBA4] mb-4 opacity-50" />
        <h2 className="text-[16px] font-semibold text-slate-800 dark:text-white mb-2">
            {language === 'KR' ? '아직 분석할 데이터가 충분하지 않아요' : 'Not enough data to analyze yet'}
        </h2>
        <p className="text-[14px] text-gray-500 dark:text-gray-400">
            {language === 'KR'
                ? '링크를 저장하면 AI가 인사이트를 분석해드립니다'
                : 'Save more links and AI will analyze your insights'}
        </p>
    </motion.div>
);

export default InsightsPage;
