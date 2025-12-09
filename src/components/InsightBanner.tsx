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
                className="w-full px-0 flex flex-col items-center gap-4 py-2"
            >
                {/* Highlight Message - Centered */}
                <p className="text-[13px] text-[#7d7d7d] dark:text-gray-400 font-medium text-center">
                    {language === 'KR'
                        ? '클립을 저장하면 AI가 자동으로 관심사를 분석해드려요'
                        : 'Save clips and AI will analyze your interests'
                    }
                </p>

                {/* Pill Button */}
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
                className="w-full bg-white dark:bg-[#1e1e1e] rounded-[24px] p-5 border border-[#b5b5b5]/30 dark:border-gray-800 shadow-sm cursor-pointer group transition-all hover:shadow-md flex items-center gap-4"
            >
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-[18px] bg-[#21DBA4]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#21DBA4]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                    {/* Highlight Message */}
                    <p className="text-[15px] text-[#3d3d3d] dark:text-white font-medium truncate mb-1">
                        {insight.highlight}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-[#959595]" />
                            <span className="text-[12px] text-[#959595] dark:text-gray-400">
                                {language === 'KR'
                                    ? `${insight.totalClips}개의 클립 분석`
                                    : `${insight.totalClips} clips analyzed`
                                }
                            </span>
                        </div>

                        {/* Keywords (Mini) */}
                        {insight.topKeywords && insight.topKeywords.length > 0 && (
                            <div className="hidden md:flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700 pl-3">
                                {insight.topKeywords.slice(0, 3).map((kw, idx) => (
                                    <span key={idx} className="text-[11px] text-[#959595]">#{kw.keyword}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-transparent group-hover:bg-[#f0f0f0] dark:group-hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-[#959595] group-hover:text-[#3d3d3d] dark:group-hover:text-white transition-colors" />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InsightBanner;
