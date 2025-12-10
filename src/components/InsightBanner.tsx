/**
 * InsightBanner Component
 * 
 * Displays AI-generated insight highlight on the homepage.
 * Matches existing design system with glassmorphism effect.
 * 
 * NOTE: This is a NEW component - does NOT modify existing components.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface InsightData {
    highlight: string;
    totalClips: number;
    topKeywords: { keyword: string; count: number }[];
    period: 'weekly' | 'monthly';
}

interface InsightBannerProps {
    language: 'KR' | 'EN';
    onViewDetails?: () => void;
}

const InsightBanner: React.FC<InsightBannerProps> = ({ language, onViewDetails }) => {
    const [insight, setInsight] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            fetchInsight();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchInsight = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/insights?userId=${user.uid}&period=weekly`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch insights');
            }

            const data = await response.json();
            setInsight(data.insight);
        } catch (err) {
            console.error('[InsightBanner] Error:', err);
            setError('인사이트를 불러오는데 실패했습니다');
        } finally {
            setLoading(false);
        }
    };

    // Don't render if user is not logged in
    if (!user) return null;

    // Loading state
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[1400px] mx-auto mb-6 px-0"
            >
                <div className="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-[20px] p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#21DBA4]/20 animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
                    </div>
                </div>
            </motion.div>
        );
    }

    // Error or no data state - show simple centered message
    if (error || !insight || insight.totalClips === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-full px-0 flex flex-col items-center gap-4 py-2"
            >
                <p className="text-[13px] text-[#959595] dark:text-gray-200 font-medium text-center">
                    {language === 'KR'
                        ? '클립을 저장하면 AI가 자동으로 관심사를 분석해드려요'
                        : 'Save clips and AI will analyze your interests'
                    }
                </p>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onViewDetails}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#1e1e1e] rounded-full border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                >
                    <Sparkles className="w-4 h-4 text-[#21DBA4]" />
                    <span className="text-[14px] text-[#3d3d3d] dark:text-gray-200 font-medium group-hover:text-[#21DBA4] transition-colors">
                        {language === 'KR' ? '인사이트 페이지 보기' : 'View insights page'}
                    </span>
                </motion.button>
            </motion.div>
        );
    }

    // Determine keywords to show
    const MAX_TAGS = 4;
    const keywordsToShow = insight.topKeywords.slice(0, MAX_TAGS);
    const extraCount = insight.topKeywords.length - MAX_TAGS;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full px-0"
        >
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onViewDetails}
                className="w-full bg-white dark:bg-[#1e1e1e] rounded-[20px] p-5 lg:p-6 border border-[#21DBA4]/50 dark:border-[#21DBA4]/30 shadow-[0_0px_20px_rgba(33,219,164,0.15)] hover:shadow-[0_0px_25px_rgba(33,219,164,0.25)] cursor-pointer group transition-all flex items-center justify-between gap-4 relative overflow-hidden"
            >
                {/* Background Glow Effect */}
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#21DBA4]/5 rounded-full blur-[50px] pointer-events-none" />

                <div className="flex items-center gap-5 flex-1 min-w-0 z-10">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#21DBA4]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        {/* Highlight Message */}
                        <h3 className="text-[16px] font-bold text-[#1a1a1a] dark:text-white truncate">
                            {insight.highlight}
                        </h3>

                        {/* Stats & Tags Row */}
                        <div className="flex items-center gap-3">
                            {/* Analysis Count */}
                            <div className="flex items-center gap-1.5 text-[#959595] dark:text-gray-400 flex-shrink-0">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span className="text-[13px] font-medium">
                                    {language === 'KR'
                                        ? `${insight.totalClips}개의 클립 분석`
                                        : `${insight.totalClips} clips analyzed`
                                    }
                                </span>
                            </div>

                            {/* Divider (Desktop only) */}
                            <div className="hidden md:block w-[1px] h-3 bg-gray-300 dark:bg-gray-700" />

                            {/* Tags (Desktop only) */}
                            <div className="hidden md:flex items-center gap-2">
                                {keywordsToShow.map((kw, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-0.5 text-[11px] font-medium text-[#5a5a5a] dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full"
                                    >
                                        {kw.keyword}
                                    </span>
                                ))}
                                {extraCount > 0 && (
                                    <span className="text-[11px] font-medium text-[#959595]">
                                        +{extraCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 z-10 pl-2">
                    <ChevronRight className="w-5 h-5 text-[#bbbbbb] group-hover:text-[#21DBA4] transition-colors" />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InsightBanner;
