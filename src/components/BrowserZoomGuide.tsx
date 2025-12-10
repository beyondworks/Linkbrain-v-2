import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const BrowserZoomGuide: React.FC<{ language: 'KR' | 'EN' }> = ({ language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }, []);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e1e1e] rounded-full shadow-md text-[14px] font-medium text-[#959595] hover:text-[#21DBA4] hover:shadow-lg transition-all"
            >
                <Search className="w-5 h-5" />
                <span>80%</span>
            </button>

            {/* Popover */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Content */}
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-lg px-6 pb-6 pt-8 z-50">
                        {/* Title */}
                        <div className="text-center mb-3">
                            <p className="text-[16px] font-bold text-[#3d3d3d] dark:text-white leading-tight">
                                {language === 'KR' ? '화면 비율' : 'Use 80%'}
                            </p>
                            <p className="text-[16px] font-bold text-[#3d3d3d] dark:text-white leading-tight">
                                {language === 'KR' ? '80% 권장' : 'screen ratio'}
                            </p>
                        </div>

                        {/* Shortcuts Box */}
                        <div className="bg-[#e5e5e5] dark:bg-[#1e1e1e] rounded-xl p-5 space-y-4">
                            {/* 축소 */}
                            <div className="flex items-center gap-4">
                                <span className="text-[14px] font-bold text-[#5a5a5a] dark:text-gray-300 w-10">
                                    {language === 'KR' ? '축소' : 'Out'}
                                </span>
                                <kbd className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#1e1e1e] rounded-lg text-[16px] font-medium text-black dark:text-white shadow-sm border border-gray-200 dark:border-gray-700">
                                    <span>{isMac ? '⌘' : 'Ctrl'}</span>
                                    <span className="text-[16px]">−</span>
                                </kbd>
                            </div>

                            {/* 확대 */}
                            <div className="flex items-center gap-4">
                                <span className="text-[14px] font-bold text-[#5a5a5a] dark:text-gray-300 w-10">
                                    {language === 'KR' ? '확대' : 'In'}
                                </span>
                                <kbd className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#1e1e1e] rounded-lg text-[16px] font-medium text-black dark:text-white shadow-sm border border-gray-200 dark:border-gray-700">
                                    <span>{isMac ? '⌘' : 'Ctrl'}</span>
                                    <span className="text-[16px]">+</span>
                                </kbd>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BrowserZoomGuide;
