/**
 * ArticlePage Component
 * DESIGN: Matches target screenshot exactly
 * - Hero: Content at TOP-LEFT, compact height
 * - 'Weekly Top Pick' header OUTSIDE hero
 * - Filters: 'All' green circle, others simple pills
 * - Cards: 'Read Now' buttons ON images
 */

import React, { useState } from 'react';
import {
    Search, Bell, User, Heart, Bookmark, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';

interface ArticlePageProps {
    language: 'KR' | 'EN';
    onBack: () => void;
    user?: any;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ language, onBack, user }) => {
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Design', 'Development', 'Crypto', 'Startup', 'Marketing', 'Productivity'];

    const articles = [
        {
            id: 1,
            title: "2026 UI Trends: Beyond Glassmorphism",
            summary: "Deep dive into the next wave of interface design. Based on recent Dribbble and Behance saves.",
            category: "Design",
            savedClips: 12,
            author: "Sarah K.",
            timeAgo: "2 hrs ago",
            likes: 342,
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        },
        {
            id: 2,
            title: "Understanding the 40B Asset Recovery Process",
            summary: "A comprehensive synthesis of news articles regarding the recent exchange hack and recovery.",
            category: "Crypto",
            savedClips: 8,
            author: "CryptoDaily",
            timeAgo: "5 hrs ago",
            likes: 128,
            image: "https://images.unsplash.com/photo-1621504450168-b8c4375361fe?q=80&w=2574&auto=format&fit=crop",
        },
        {
            id: 3,
            title: "React vs Vue in 2025: A Performance Review",
            summary: "Comparing rendering speeds and developer experience based on 15 tech blog posts.",
            category: "Development",
            savedClips: 15,
            author: "DevCommunity",
            timeAgo: "1 day ago",
            likes: 890,
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
        },
        {
            id: 4,
            title: "The 'Second Brain' Methodology Guide",
            summary: "How to organize your digital life. Summarized from Notion templates and YouTube tutorials.",
            category: "Productivity",
            savedClips: 22,
            author: "LinkBrain Official",
            timeAgo: "2 days ago",
            likes: 1205,
            image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop",
        },
        {
            id: 5,
            title: "Y Combinator W25 Batch Analysis",
            summary: "Common themes and pivot strategies found in the latest batch of YC startups.",
            category: "Startup",
            savedClips: 6,
            author: "VentureScout",
            timeAgo: "3 days ago",
            likes: 45,
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop",
        },
        {
            id: 6,
            title: "Short-form Video Algorithms Decoded",
            summary: "What makes a Reel go viral? Insights gathered from 30 marketing case studies.",
            category: "Marketing",
            savedClips: 30,
            author: "ViralLab",
            timeAgo: "4 days ago",
            likes: 677,
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop",
        }
    ];

    return (
        <div className="w-full min-h-screen bg-white dark:bg-[#111] pb-24 font-sans text-slate-900 dark:text-slate-100">
            <div className="max-w-[1200px] mx-auto px-8 md:px-12 pt-8">

                {/* HEADER */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Discovery</h1>
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-[#222] text-slate-500 dark:text-gray-400 text-xs font-bold rounded-lg">Articles</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#222] rounded-full text-sm outline-none w-[280px] focus:ring-2 focus:ring-[#21DBA4]/20 font-medium text-slate-700 dark:text-gray-200 placeholder-gray-400 border border-gray-100 dark:border-gray-800"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111]" />
                        </button>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#21DBA4] to-blue-500 p-[2px] cursor-pointer hover:scale-105 transition-transform">
                            <div className="w-full h-full rounded-full bg-white dark:bg-[#222] overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-1.5 text-gray-400" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* WEEKLY TOP PICK HEADER - OUTSIDE HERO */}
                <div className="flex items-center gap-2 mb-4">
                    <FilledSparkles className="text-[#21DBA4]" size={20} />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Top Pick</h2>
                </div>

                {/* HERO CARD - CONTENT AT TOP-LEFT */}
                <div className="relative w-full h-[280px] rounded-[28px] overflow-hidden mb-12 shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop"
                        alt="Hero"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 bg-gray-200 dark:bg-gray-800"
                    />

                    {/* Content positioned at TOP-LEFT */}
                    <div className="absolute top-0 left-0 p-6 md:p-8 z-20 max-w-[65%]">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-0.5 bg-[#21DBA4] text-white text-[10px] font-bold rounded-md flex items-center gap-1 uppercase tracking-wide">
                                <FilledSparkles size={9} /> AI Trends
                            </span>
                            <span className="text-white/90 text-[11px] font-medium flex items-center gap-1">
                                <Clock size={10} /> 5 min read
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2.5 drop-shadow-xl">
                            The Rise of 'Vibe Coding':<br />How AI Changes Design Systems
                        </h2>

                        <p className="text-white/80 text-xs md:text-sm mb-4 leading-relaxed line-clamp-2 drop-shadow-md">
                            Analyzing 24 saved clips about MCP, Gemini 2.0, and No-code tools. Explore how the role of designers is shifting from 'Pixel Perfect' to 'Logic Architect'.
                        </p>
                    </div>

                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex -space-x-2.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white/30 bg-gray-300 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="Curator" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-white text-xs font-bold drop-shadow-md">Curated by LinkBrain + 12 others</span>
                        </div>

                        <button className="px-5 py-2 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs transition-all flex items-center gap-1.5 rounded-full shadow-lg">
                            Read Article
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* FILTER TABS - All is green circle, others are simple */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto scrollbar-hide py-1">
                    <button
                        onClick={() => setActiveTab('All')}
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                            ${activeTab === 'All'
                                ? 'bg-[#21DBA4] text-white shadow-md'
                                : 'bg-gray-100 dark:bg-[#222] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]'}
                        `}
                    >
                        All
                    </button>
                    {tabs.slice(1).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all
                                ${activeTab === tab
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ARTICLE GRID - with Read Now buttons ON images */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {articles.map(article => (
                        <div key={article.id} className="group flex flex-col gap-4 cursor-pointer">
                            {/* Card Image with overlay button */}
                            <div className="relative w-full aspect-[16/11] rounded-[20px] overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 bg-gray-100 dark:bg-[#222]">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Category badge */}
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-900 shadow-sm uppercase tracking-wide">
                                        {article.category}
                                    </span>
                                </div>

                                {/* Read Now button - appears on hover */}
                                <button className="absolute bottom-3 right-3 z-10 px-4 py-2 bg-white hover:bg-gray-50 text-slate-900 font-bold text-xs rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-1">
                                    Read Now
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Card Content */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[#21DBA4] mb-2">
                                    <FilledSparkles size={11} />
                                    <span className="text-[11px] font-bold uppercase tracking-wide">Based on {article.savedClips} saved clips</span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-[#21DBA4] transition-colors line-clamp-2">
                                    {article.title}
                                </h3>

                                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                                    {article.summary}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${article.id}`} alt={article.author} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{article.author}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span className="text-xs text-gray-400">{article.timeAgo}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-400">
                                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                            <Heart size={15} />
                                            <span className="text-xs font-medium">{article.likes}</span>
                                        </button>
                                        <button className="hover:text-[#21DBA4] transition-colors">
                                            <Bookmark size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function FilledSparkles({ size = 16, className = "" }: { size?: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M9.90429 2C10.2972 5.09395 12.8727 8.01664 15.6599 8.92429C12.756 9.87321 10.3204 12.8715 9.90429 16C9.48818 12.8715 7.05266 9.87321 4.1487 8.92429C6.9359 8.01664 9.51139 5.09395 9.90429 2Z" />
            <path d="M16.9043 14C17.1007 15.547 18.3885 17.0083 19.7821 17.4621C18.3301 17.9366 17.1123 19.4357 16.9043 21C16.6962 19.4357 15.4784 17.9366 14.0264 17.4621C15.4201 17.0083 16.7078 15.547 16.9043 14Z" />
        </svg>
    )
}

export default ArticlePage;
