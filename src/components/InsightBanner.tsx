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
import { Sparkles, ChevronRight, TrendingUp, RefreshCw } from 'lucide-react';
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
                className="w-full max-w-[1400px] mx-auto mb-6 px-[32px] md:px-6"
            >
                <div className="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#21DBA4]/20 animate-pulse" />
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Error or no data state - show placeholder banner
    if (error || !insight || insight.totalClips === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-full max-w-[1400px] mx-auto mb-6 px-[32px] md:px-6"
            >
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={onViewDetails}
                    className="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer group transition-all hover:shadow-md hover:border-[#21DBA4]/30"
                >
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#21DBA4]/50 to-[#1ec795]/50 flex items-center justify-center shadow-sm">
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] md:text-[16px] text-[#3d3d3d] dark:text-white font-medium">
                                {language === 'KR'
                                    ? '클립을 저장하면 AI가 관심사를 분석해드려요'
                                    : 'Save clips and AI will analyze your interests'
                                }
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="w-3 h-3 text-[#21DBA4]" />
                                <span className="text-[12px] text-[#959595] dark:text-gray-400">
                                    {language === 'KR' ? '인사이트 페이지 보기' : 'View insights page'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <ChevronRight className="w-5 h-5 text-[#959595] group-hover:text-[#21DBA4] group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full max-w-[1400px] mx-auto mb-6 px-[32px] md:px-6"
        >
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onViewDetails}
                className="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer group transition-all hover:shadow-md hover:border-[#21DBA4]/30"
            >
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#21DBA4] to-[#1ec795] flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Highlight Message */}
                        <p className="text-[14px] md:text-[16px] text-[#3d3d3d] dark:text-white font-medium truncate">
                            {insight.highlight}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-2 mt-1">
                            <TrendingUp className="w-3 h-3 text-[#21DBA4]" />
                            <span className="text-[12px] text-[#959595] dark:text-gray-400">
                                {language === 'KR'
                                    ? `${insight.totalClips}개의 클립 분석`
                                    : `${insight.totalClips} clips analyzed`
                                }
                            </span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-[#959595] group-hover:text-[#21DBA4] group-hover:translate-x-1 transition-all" />
                    </div>
                </div>

                {/* Top Keywords (optional, shown on larger screens) */}
                {insight.topKeywords && insight.topKeywords.length > 0 && (
                    <div className="hidden md:flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-[11px] text-[#959595] dark:text-gray-500">
                            {language === 'KR' ? '인기 키워드:' : 'Top keywords:'}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {insight.topKeywords.slice(0, 4).map((kw, idx) => (
                                <span
                                    key={idx}
                                    className="text-[11px] px-2 py-0.5 rounded-full bg-[#21DBA4]/10 text-[#21DBA4] font-medium"
                                >
                                    #{kw.keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default InsightBanner;
