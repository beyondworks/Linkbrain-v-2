/**
 * InsightsPage Component
 * 
 * ROLLBACK TO VERSION: Step 138 (Reference Matching Design)
 * Reason: User requested rollback of size/chip changes.
 * 
 * Structure:
 * 1. Chart Hero (Full width)
 * 2. Keywords (Left) + Sources (Right)
 * 3. Sentiment (Left) + New Interests (Right)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Sparkles, TrendingUp, ChevronRight, ChevronLeft,
    RefreshCw, FileText, Zap, Activity,
    Instagram, Youtube, AtSign, Globe, Star
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

// --- Types ---
interface KeywordStat { keyword: string; count: number; }
interface CategoryStat { category: string; count: number; }
interface SourceStat { source: string; count: number; favicon?: string; }
interface SentimentBreakdown { positive: number; neutral: number; negative: number; }
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

interface InsightsPageProps {
    language: 'KR' | 'EN';
    onBack: () => void;
    user?: any;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ language, onBack, user: propUser }) => {
    const [user, setUser] = useState<any>(propUser || null);
    const [insight, setInsight] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
    const [generating, setGenerating] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        if (propUser) setUser(propUser);
        else onAuthStateChanged(auth, setUser);
    }, [propUser]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/insights?userId=${user.uid}&period=${activeTab}&forceRefresh=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInsight(data.insight);
            }
        } catch {
            toast.error(language === 'KR' ? '데이터 로드 실패' : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        if (!user) return;
        setGenerating(true);
        try {
            const token = await user.getIdToken();
            await Promise.all([
                fetch('/api/reports', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, type: 'weekly' }) }),
                fetch('/api/reports', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, type: 'monthly' }) })
            ]);
            toast.success(language === 'KR' ? '리포트 생성 완료' : 'Reports generated');
            fetchData();
        } catch {
            toast.error(language === 'KR' ? '리포트 생성 실패' : 'Failed to generate');
        } finally {
            setGenerating(false);
        }
    };

    // --- Helpers ---
    const getDateRangeLabel = () => {
        if (!insight) return '';
        const start = new Date(insight.startDate);
        const end = new Date(insight.endDate);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (language === 'KR') {
            return `${start.toLocaleDateString('ko-KR', options)} - ${end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`;
        }
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const getSentimentPercents = () => {
        if (!insight) return { pos: 0, neu: 0, neg: 0 };
        const { positive, neutral, negative } = insight.sentimentBreakdown;
        const total = positive + neutral + negative || 1;
        return {
            pos: Math.round((positive / total) * 100),
            neu: Math.round((neutral / total) * 100),
            neg: Math.round((negative / total) * 100)
        };
    };
    const sents = getSentimentPercents();

    // Source Icon Helper
    const SourceIcon = ({ name }: { name: string }) => {
        const n = name.toLowerCase();
        if (n.includes('youtube')) return <Youtube className="w-5 h-5 text-red-500" />;
        if (n.includes('instagram')) return <Instagram className="w-5 h-5 text-pink-500" />;
        if (n.includes('threads')) return <AtSign className="w-5 h-5 text-black dark:text-white" />;
        if (n.includes('twitter') || n.includes('x.com')) return <span className="w-5 h-5 flex items-center justify-center font-bold text-xs">X</span>;
        return <Globe className="w-5 h-5 text-blue-500" />;
    };

    // --- Render ---
    return (
        <div className="w-full min-h-screen bg-gray-50/50 dark:bg-[#111] pb-20 pt-8 font-sans text-slate-800 dark:text-slate-100">
            <div className="max-w-[1200px] mx-auto px-6">

                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-8 pb-6 border-b border-gray-200 dark:border-white/10">
                    <div className="w-full md:w-auto flex items-center gap-3 md:gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6 text-gray-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">AI Insight</h1>
                                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded">Beta</span>
                            </div>
                            {/* Mobile Date */}
                            <p className="md:hidden text-xs text-gray-400 mt-1">{getDateRangeLabel()}</p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4">
                        {/* Desktop Date - hidden on mobile */}
                        <p className="hidden md:block text-sm text-gray-400 font-medium mr-4">
                            {getDateRangeLabel()}
                        </p>

                        {/* Toggle */}
                        <div className="flex bg-gray-100 dark:bg-[#222] p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('weekly')}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'weekly' ? 'bg-white dark:bg-[#333] shadow-sm text-slate-900 dark:text-white' : 'text-gray-400'}`}
                            >
                                {language === 'KR' ? 'Weekly' : 'Weekly'}
                            </button>
                            <button
                                onClick={() => setActiveTab('monthly')}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'monthly' ? 'bg-white dark:bg-[#333] shadow-sm text-slate-900 dark:text-white' : 'text-gray-400'}`}
                            >
                                {language === 'KR' ? 'Monthly' : 'Monthly'}
                            </button>
                        </div>

                        {/* Gen Button */}
                        <button
                            onClick={generateReport}
                            disabled={generating}
                            className="bg-[#21DBA4] hover:bg-[#1lb993] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-colors"
                        >
                            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            <span>{language === 'KR' ? '리포트 생성' : 'Generate'}</span>
                        </button>
                    </div>
                </header>

                {/* --- CONTENT GRID --- */}
                {loading ? (
                    <div className="animate-pulse space-y-6">
                        <div className="h-[300px] bg-white dark:bg-[#222] rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-[300px] bg-white dark:bg-[#222] rounded-3xl" />
                            <div className="h-[300px] bg-white dark:bg-[#222] rounded-3xl" />
                        </div>
                    </div>
                ) : !insight ? (
                    <div className="text-center py-20 text-gray-400">No Data Available</div>
                ) : (
                    <div className="flex flex-col gap-6">

                        {/* ROW 1: HERO CHART */}
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                            {/* Top Row: Title + Icon */}
                            <div className="flex justify-between items-start mb-8 z-10 relative">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {language === 'KR' ? '주간 인사이트 요약' : 'Weekly Insight Summary'}
                                    </h2>
                                    <p className="text-sm text-gray-400">{getDateRangeLabel()}</p>
                                </div>
                                <div className="p-3 bg-[#EFFFF9] dark:bg-[#21DBA4]/10 rounded-full text-[#21DBA4]">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Chart Bars */}
                            <div className="flex items-end justify-between h-[220px] gap-2 md:gap-6 z-10 relative">
                                {[35, 50, 45, 80, 60, 95, 75].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="w-full h-full flex items-end bg-transparent rounded-t-xl relative">
                                            <div
                                                style={{ height: `${h}%` }}
                                                className={`w-full rounded-t-lg transition-all duration-700 
                                                    ${i === 5 ? 'bg-[#21DBA4]' : 'bg-[#E0E0E0] dark:bg-[#333] group-hover:bg-[#21DBA4]/50'}`}
                                            />
                                        </div>
                                        <span className={`text-[12px] font-medium ${i === 5 ? 'text-[#21DBA4] font-bold' : 'text-gray-400'}`}>
                                            {language === 'KR' ? ['월', '화', '수', '목', '금', '토', '일'][i] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ROW 2: KEYWORDS + SOURCES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Keywords */}
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-8 text-[#21DBA4]">
                                    <TrendingUp className="w-5 h-5" />
                                    <h3 className="font-bold text-slate-900 dark:text-white ml-2 text-base">
                                        {language === 'KR' ? '인기 키워드' : 'Popular Keywords'}
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {insight.topKeywords.slice(0, 8).map((kw, i) => (
                                        <span key={i} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5
                                            ${i < 3 ? 'bg-[#EFFFF9] dark:bg-[#21DBA4]/10 text-[#21DBA4]' : 'bg-[#F5F5F7] dark:bg-[#2a2a2a] text-slate-500 dark:text-slate-400'}
                                        `}>
                                            {kw.keyword}
                                            <span className="text-[10px] opacity-60 ml-1">{kw.count}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Sources */}
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-8 text-blue-500">
                                    <Globe className="w-5 h-5" />
                                    <h3 className="font-bold text-slate-900 dark:text-white ml-2 text-base">
                                        {language === 'KR' ? '주요 출처' : 'Top Sources'}
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    {insight.topSources.slice(0, 4).map((src, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg">
                                                    <SourceIcon name={src.source} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{src.source}</span>
                                            </div>
                                            <div className="flex items-center gap-3 w-[120px]">
                                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
                                                    <div style={{ width: `${Math.min(src.count * 10, 100)}%` }} className="h-full bg-slate-800 dark:bg-white rounded-full" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white w-6 text-right">{src.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ROW 3: SENTIMENT + PREDICTION */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Sentiment */}
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-8 text-purple-500">
                                    <Activity className="w-5 h-5" />
                                    <h3 className="font-bold text-slate-900 dark:text-white ml-2 text-base">
                                        {language === 'KR' ? '감정 품질 분석' : 'Sentiment Quality'}
                                    </h3>
                                </div>

                                <div className="space-y-6 mb-8">
                                    <SentimentRow label={language === 'KR' ? '긍정 (Positive)' : 'Positive'} pct={sents.pos} color="bg-[#21DBA4]" />
                                    <SentimentRow label={language === 'KR' ? '중립 (Neutral)' : 'Neutral'} pct={sents.neu} color="bg-slate-300" />
                                    <SentimentRow label={language === 'KR' ? '부정 (Negative)' : 'Negative'} pct={sents.neg} color="bg-red-400" />
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl flex gap-3 items-start">
                                    <div className="mt-1 min-w-[4px] h-[40px] bg-purple-400 rounded-full" />
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Insight:</span>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {language === 'KR'
                                                ? '전체적으로 긍정적인 반응이 지배적입니다. 특히 AI 개발 관련 콘텐츠의 참여도가 높습니다.'
                                                : 'Overall sentiment is highly positive. High engagement observed in AI development content.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Prediction */}
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col">
                                <div className="flex items-center gap-2 mb-8 text-yellow-500">
                                    <Zap className="w-5 h-5" />
                                    <h3 className="font-bold text-slate-900 dark:text-white ml-2 text-base">
                                        {language === 'KR' ? '새로운 관심사 발견' : 'New Interests'}
                                    </h3>
                                </div>

                                <div className="flex-1 flex flex-col gap-3 mb-6">
                                    {insight.newInterests.length > 0 ? insight.newInterests.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border border-gray-100 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-[#EFFFF9] dark:bg-[#21DBA4]/20 rounded text-[#21DBA4]">
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300" />
                                        </div>
                                    )) : (
                                        <div className="text-sm text-gray-400">{language === 'KR' ? '데이터 부족' : 'No predictions yet'}</div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">AI Prediction</p>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                                        {insight.interestPrediction || (language === 'KR'
                                            ? '이번 주는 AI 관련 콘텐츠에 지속적인 관심을 보일 것으로 예측됩니다.'
                                            : 'Sustained interest in AI-related content is predicted for next week.')}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SentimentRow = ({ label, pct, color }: { label: string, pct: number, color: string }) => (
    <div>
        <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
            <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${color}`} />
        </div>
    </div>
);

export default InsightsPage;
