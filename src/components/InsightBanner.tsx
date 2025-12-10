/**
 * InsightBanner Component (Static CTA Version)
 * 
 * Displays a static Call-to-Action to visit the insights page.
 * Always visible on the homepage, removing data fetching logic.
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface InsightBannerProps {
    language: 'KR' | 'EN';
    onViewDetails?: () => void;
}

const InsightBanner: React.FC<InsightBannerProps> = ({ language, onViewDetails }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full px-0"
        >
            <div className="w-full flex flex-col items-center gap-6 py-8">
                <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium text-center">
                    {language === 'KR'
                        ? '클립을 저장하면 AI가 자동으로 관심사를 분석해드려요'
                        : 'Save clips and AI will analyze your interests'
                    }
                </p>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onViewDetails}
                    className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-[#1e1e1e] rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#21DBA4]/50 dark:hover:border-[#21DBA4]/50 transition-all group"
                >
                    <Sparkles className="w-4 h-4 text-[#21DBA4]" />
                    <span className="text-[14px] text-slate-600 dark:text-slate-200 font-medium group-hover:text-[#21DBA4] transition-colors">
                        {language === 'KR' ? '인사이트 페이지 보기' : 'View insights page'}
                    </span>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default InsightBanner;
