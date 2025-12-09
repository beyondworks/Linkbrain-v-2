import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Globe, AtSign, Instagram, Youtube, Settings, LogOut, ChevronUp, User, Search, Star, LayoutGrid, List } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getCategoryColor } from '../lib/categoryColors';
import svgPathsOpen from "../imports/svg-necy6hi9g3";
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface MobileSidebarProps {
    onCategorySelect?: (category: string | null) => void;
    onNavigate?: (view: 'clips' | 'collections') => void;
    onCreateCollection?: () => void;
    onCollectionSelect?: (collection: any) => void;
    onSourceSelect?: (source: string | null) => void;
    onSearch?: (query: string) => void;
    onLogout?: () => void;
    onSettingsClick?: () => void;
    onProfileClick?: () => void;
    currentView: string;
    language?: 'KR' | 'EN';
    onClose?: () => void;
    menuState?: {
        isMyClipOpen: boolean;
        isSourceOpen: boolean;
        isCollectionsOpen: boolean;
    };
    onMenuToggle?: (key: 'isMyClipOpen' | 'isSourceOpen' | 'isCollectionsOpen') => void;
    user?: any;
}

const MobileSidebar = ({
    onCategorySelect,
    onNavigate,
    onCreateCollection,
    onCollectionSelect,
    onSourceSelect,
    onSearch,
    onLogout,
    onSettingsClick,
    onProfileClick,
    currentView,
    language = 'KR',
    onClose,
    menuState = { isMyClipOpen: true, isSourceOpen: true, isCollectionsOpen: true },
    onMenuToggle,
    user
}: MobileSidebarProps) => {

    const [tags, setTags] = React.useState<{ name: string, color: { bg: string, text: string } }[]>([]);
    const [sources, setSources] = React.useState<{ name: string, icon: React.ReactNode }[]>([]);
    const [collections, setCollections] = React.useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // === UX Enhancement States (shared with desktop via localStorage) ===
    const [categoryFilter, setCategoryFilter] = useState('');
    const [collectionFilter, setCollectionFilter] = useState('');
    const [categoryViewMode, setCategoryViewMode] = useState<'list' | 'cloud'>(() => {
        const saved = localStorage.getItem('sidebar_categoryViewMode');
        return (saved === 'cloud' ? 'cloud' : 'list') as 'list' | 'cloud';
    });
    const [favoriteCategories, setFavoriteCategories] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('sidebar_favoriteCategories');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [recentCategories, setRecentCategories] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('sidebar_recentCategories');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Persist view mode
    useEffect(() => {
        localStorage.setItem('sidebar_categoryViewMode', categoryViewMode);
    }, [categoryViewMode]);

    // Persist favorites
    useEffect(() => {
        localStorage.setItem('sidebar_favoriteCategories', JSON.stringify(favoriteCategories));
    }, [favoriteCategories]);

    // Persist recent
    useEffect(() => {
        localStorage.setItem('sidebar_recentCategories', JSON.stringify(recentCategories));
    }, [recentCategories]);

    // Toggle favorite
    const toggleFavorite = (categoryName: string) => {
        setFavoriteCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    // Track recent category usage
    const handleCategorySelect = (categoryName: string | null) => {
        if (categoryName && categoryName !== 'All') {
            setRecentCategories(prev => {
                const filtered = prev.filter(c => c !== categoryName);
                const updated = [categoryName, ...filtered].slice(0, 5);
                localStorage.setItem('sidebar_recentCategories', JSON.stringify(updated));
                return updated;
            });
        }
        onCategorySelect && onCategorySelect(categoryName);
    };

    // Debounced search - matches desktop Sidebar behavior
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    React.useEffect(() => {
        if (!user) {
            setCollections([]);
            setTags([]);
            setSources([]);
            return;
        }

        // Fetch Collections
        const qCollections = query(
            collection(db, 'collections'),
            where('userId', '==', user.uid)
        );

        const unsubscribeCollections = onSnapshot(qCollections, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCollections(fetched);
        });

        // Fetch Clips for Tags and Sources
        const qClips = query(
            collection(db, 'clips'),
            where('userId', '==', user.uid)
        );

        const unsubscribeClips = onSnapshot(qClips, (snapshot) => {
            const clips = snapshot.docs.map(doc => doc.data());

            // Extract unique categories
            const uniqueCategories = Array.from(new Set(clips.map((clip: any) => clip.category))).filter(Boolean);

            const newTags = uniqueCategories.map(cat => ({
                name: cat as string,
                color: getCategoryColor(cat as string)
            }));
            setTags(newTags);

            // Extract unique sources
            const uniqueSources = Array.from(new Set(clips.map((clip: any) => clip.source || clip.platform))).filter(Boolean); // Handle source or platform field
            const newSources = uniqueSources.map(src => {
                const sourceName = src as string;
                // Normalize source name for icon matching if needed
                const lowerName = sourceName.toLowerCase();
                // Capitalize for display
                const displayName = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

                let icon = <Globe className="w-4 h-4" />;
                if (lowerName.includes('instagram')) icon = <Instagram className="w-4 h-4" />;
                else if (lowerName.includes('youtube')) icon = <Youtube className="w-4 h-4" />;
                else if (lowerName.includes('threads')) icon = <AtSign className="w-4 h-4" />;
                else if (lowerName.includes('twitter') || lowerName.includes('x.com')) icon = <span className="text-xs font-bold">X</span>;

                return { name: displayName, icon };
            });
            setSources(newSources);
        });

        return () => {
            unsubscribeCollections();
            unsubscribeClips();
        };
    }, [user]);



    const handleLinkClick = (action: () => void) => {
        action();
        onClose && onClose();
    };

    return (
        <div className="flex flex-col h-full bg-[#fafafa] dark:bg-[#161616]">

            {/* Header */}
            <div
                className="px-6 pt-8 pb-6 flex items-center gap-3 cursor-pointer"
                onClick={() => handleLinkClick(() => onNavigate && onNavigate('clips'))}
            >
                <div className="w-[32px] h-[32px] rounded-[8px] bg-[#21DBA4] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 40 40" fill="none">
                        <path d={svgPathsOpen.p35b52a00} fill="currentColor" />
                    </svg>
                </div>
                <span className="text-[#21dba4] text-[24px] font-bold leading-none">Linkbrain</span>
            </div>

            {/* Menu Content */}
            <div className="flex flex-col overflow-y-auto no-scrollbar flex-1 px-4">

                {/* Search */}
                <div className="mb-6 mt-2">
                    <div className="w-full bg-white dark:bg-[#1e1e1e] rounded-[20px] pl-4 pr-3 py-2.5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <Search className="w-4 h-4 text-[#959595]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={language === 'KR' ? "검색..." : "Search..."}
                            className="w-full bg-transparent outline-none text-[15px] text-[#3d3d3d] dark:text-white placeholder-[#c5c5c5]"
                        />
                    </div>
                </div>

                {/* My Clip */}
                <div className="flex flex-col gap-2 mb-6">
                    <div
                        className="flex items-center justify-between cursor-pointer group px-2"
                        onClick={() => {
                            if (currentView === 'clips' || currentView === 'clip-detail') {
                                onMenuToggle && onMenuToggle('isMyClipOpen');
                            } else {
                                handleLinkClick(() => onNavigate && onNavigate('clips'));
                            }
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-[32px] h-[32px] bg-[#959595] rounded-[8px] flex items-center justify-center text-white group-hover:bg-[#21DBA4] transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                                    <path d={svgPathsOpen.p15428980} fill="currentColor" />
                                </svg>
                            </div>
                            <span className="text-[#3d3d3d] dark:text-white text-[16px] font-medium group-hover:text-[#21DBA4] transition-colors">My Clip</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* View Mode Toggle */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoryViewMode(prev => prev === 'list' ? 'cloud' : 'list');
                                }}
                                className="w-5 h-5 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] transition-colors"
                            >
                                {categoryViewMode === 'list' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                            </button>
                            <motion.div
                                animate={{ rotate: menuState.isMyClipOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronUp className="w-4 h-4 text-[#959595]" />
                            </motion.div>
                        </div>
                    </div>

                    <AnimatePresence initial={false}>
                        {menuState.isMyClipOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="pl-[44px] pt-1 flex flex-col gap-2">
                                    {/* Category Filter (if > 3 tags) */}
                                    {tags.length > 3 && (
                                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-[8px] px-2 py-1.5 mb-1 mr-4">
                                            <Search className="w-3 h-3 text-[#959595]" />
                                            <input
                                                type="text"
                                                value={categoryFilter}
                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                placeholder={language === 'KR' ? "카테고리 검색..." : "Filter..."}
                                                className="w-full bg-transparent outline-none text-[13px] text-[#3d3d3d] dark:text-white placeholder-[#959595]"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    )}

                                    {/* Cloud or List View */}
                                    <div className={categoryViewMode === 'cloud' ? 'flex flex-wrap gap-1.5 pr-4' : 'flex flex-col gap-2'}>
                                        <button
                                            onClick={() => handleLinkClick(() => handleCategorySelect('All'))}
                                            className="bg-[#e0e0e0] dark:bg-[#333] h-[28px] px-3 rounded-[8px] self-start flex items-center hover:opacity-80 transition-opacity cursor-pointer text-left"
                                        >
                                            <span className="text-[#5a5a5a] dark:text-gray-300 text-[14px] font-medium">All</span>
                                        </button>

                                        {/* Sorted and Filtered Tags */}
                                        {(() => {
                                            const filteredTags = tags.filter(tag =>
                                                !categoryFilter || tag.name.toLowerCase().includes(categoryFilter.toLowerCase())
                                            );

                                            const sortedTags = [...filteredTags].sort((a, b) => {
                                                const aFav = favoriteCategories.includes(a.name) ? 0 : 1;
                                                const bFav = favoriteCategories.includes(b.name) ? 0 : 1;
                                                if (aFav !== bFav) return aFav - bFav;

                                                const aRecent = recentCategories.indexOf(a.name);
                                                const bRecent = recentCategories.indexOf(b.name);
                                                if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
                                                if (aRecent !== -1) return -1;
                                                if (bRecent !== -1) return 1;

                                                return a.name.localeCompare(b.name);
                                            });

                                            return sortedTags.map(tag => {
                                                // Long press state for mobile
                                                let longPressTimer: NodeJS.Timeout | null = null;

                                                const handleTouchStart = () => {
                                                    longPressTimer = setTimeout(() => {
                                                        toggleFavorite(tag.name);
                                                        if (navigator.vibrate) navigator.vibrate(50);
                                                    }, 500);
                                                };

                                                const handleTouchEnd = () => {
                                                    if (longPressTimer) {
                                                        clearTimeout(longPressTimer);
                                                        longPressTimer = null;
                                                    }
                                                };

                                                return (
                                                    <div key={tag.name} className="group/tag relative self-start flex items-center">
                                                        <button
                                                            onClick={() => handleLinkClick(() => handleCategorySelect(tag.name))}
                                                            onTouchStart={handleTouchStart}
                                                            onTouchEnd={handleTouchEnd}
                                                            onTouchCancel={handleTouchEnd}
                                                            className={`${tag.color.bg} h-[28px] px-3 rounded-[8px] flex items-center hover:opacity-80 transition-opacity cursor-pointer text-left select-none`}
                                                        >
                                                            {favoriteCategories.includes(tag.name) && (
                                                                <Star className="w-2.5 h-2.5 mr-1 fill-current" />
                                                            )}
                                                            <span className={`${tag.color.text} text-[14px] font-medium`}>{tag.name}</span>
                                                        </button>
                                                        {/* Favorite Toggle */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFavorite(tag.name);
                                                            }}
                                                            className="absolute -right-5 opacity-0 group-hover/tag:opacity-100 transition-opacity p-0.5"
                                                        >
                                                            <Star className={`w-3 h-3 ${favoriteCategories.includes(tag.name) ? 'fill-yellow-400 text-yellow-400' : 'text-[#959595]'}`} />
                                                        </button>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Source Menu */}
                <div className="flex flex-col gap-2 mb-6">
                    <div
                        className="flex items-center justify-between cursor-pointer group px-2"
                        onClick={() => {
                            if (onSourceSelect) onSourceSelect(null);
                            onMenuToggle && onMenuToggle('isSourceOpen');
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-[32px] h-[32px] bg-[#959595] rounded-[8px] flex items-center justify-center text-white group-hover:bg-[#21DBA4] transition-colors">
                                <Globe className="w-5 h-5" />
                            </div>
                            <span className="text-[#3d3d3d] dark:text-white text-[16px] font-medium group-hover:text-[#21DBA4] transition-colors">Source</span>
                        </div>
                        <motion.div
                            animate={{ rotate: menuState.isSourceOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronUp className="w-4 h-4 text-[#959595]" />
                        </motion.div>
                    </div>

                    <AnimatePresence initial={false}>
                        {menuState.isSourceOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="pl-[44px] pt-1 flex flex-col gap-2">
                                    {sources.map(source => (
                                        <button
                                            key={source.name}
                                            onClick={() => handleLinkClick(() => onSourceSelect && onSourceSelect(source.name))}
                                            className="bg-gray-100 dark:bg-[#333] h-[28px] px-3 rounded-[8px] self-start flex items-center hover:bg-gray-200 dark:hover:bg-[#444] transition-colors cursor-pointer text-left gap-2"
                                        >
                                            <span className="text-[#5a5a5a] dark:text-gray-300">{source.icon}</span>
                                            <span className="text-[#5a5a5a] dark:text-gray-300 text-[14px] font-medium">{source.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Collections */}
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center justify-between group px-2">
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => {
                                if (currentView === 'collections' || currentView === 'collection-detail') {
                                    onMenuToggle && onMenuToggle('isCollectionsOpen');
                                } else {
                                    handleLinkClick(() => onNavigate && onNavigate('collections'));
                                    // Preserve state, so don't force open
                                }
                            }}
                        >
                            <div className="w-[32px] h-[32px] bg-[#959595] rounded-[8px] flex items-center justify-center text-white group-hover:bg-[#21DBA4] transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                                    <path d={svgPathsOpen.p18756800} fill="currentColor" />
                                </svg>
                            </div>
                            <span className="text-[#3d3d3d] dark:text-white text-[16px] font-medium group-hover:text-[#21DBA4] transition-colors">Collections</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="w-[24px] h-[24px] flex items-center justify-center rounded-full hover:bg-[#e0e0e0] dark:hover:bg-[#333] text-[#959595] hover:text-[#21DBA4] transition-colors cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLinkClick(() => onCreateCollection && onCreateCollection());
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div
                                className="cursor-pointer"
                                onClick={() => onMenuToggle && onMenuToggle('isCollectionsOpen')}
                            >
                                <motion.div
                                    animate={{ rotate: menuState.isCollectionsOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronUp className="w-4 h-4 text-[#959595]" />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence initial={false}>
                        {menuState.isCollectionsOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="pl-[44px] pt-1 flex flex-col gap-2">
                                    {/* Collection Filter (if > 3) */}
                                    {collections.length > 3 && (
                                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-[8px] px-2 py-1.5 mb-1 mr-4">
                                            <Search className="w-3 h-3 text-[#959595]" />
                                            <input
                                                type="text"
                                                value={collectionFilter}
                                                onChange={(e) => setCollectionFilter(e.target.value)}
                                                placeholder={language === 'KR' ? "컬렉션 검색..." : "Filter..."}
                                                className="w-full bg-transparent outline-none text-[13px] text-[#3d3d3d] dark:text-white placeholder-[#959595]"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    )}

                                    {/* Filtered Collections */}
                                    {(() => {
                                        const filteredCollections = collections.filter(c =>
                                            !collectionFilter || c.name.toLowerCase().includes(collectionFilter.toLowerCase())
                                        );

                                        return filteredCollections.length > 0 ? filteredCollections.map(collection => (
                                            <button
                                                key={collection.id}
                                                onClick={() => handleLinkClick(() => onCollectionSelect && onCollectionSelect(collection))}
                                                className="bg-gray-100 dark:bg-[#333] h-[28px] px-3 rounded-[8px] self-start flex items-center hover:bg-gray-200 dark:hover:bg-[#444] transition-colors cursor-pointer text-left group/item"
                                            >
                                                <span className="text-[#5a5a5a] dark:text-gray-300 text-[14px] font-medium whitespace-nowrap group-hover/item:text-[#21dba4] transition-colors">
                                                    {collection.name}
                                                </span>
                                            </button>
                                        )) : (
                                            <div className="text-xs text-gray-400">
                                                {collectionFilter
                                                    ? (language === 'KR' ? '검색 결과 없음' : 'No results')
                                                    : (language === 'KR' ? '컬렉션 없음' : 'None')
                                                }
                                            </div>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer: User Profile */}
            <div className="px-6 pb-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="w-full bg-white dark:bg-[#1e1e1e] rounded-[16px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-[40px] h-[40px] rounded-full bg-[#959595] overflow-hidden flex items-center justify-center text-white">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-full h-full" viewBox="0 0 50 50" fill="none">
                                            <circle cx="25" cy="25" r="25" fill="currentColor" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[#3d3d3d] dark:text-white text-[15px] font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                                        {user?.displayName || user?.email || "Guest"}
                                    </span>
                                    <span className="text-[#959595] text-[13px] leading-tight">{user ? "Member" : "Guest"}</span>
                                </div>
                            </div>
                            <ChevronUp className="w-4 h-4 text-[#959595]" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="center" sideOffset={8} className="w-[260px] rounded-[16px] bg-white dark:bg-[#1e1e1e]">
                        <DropdownMenuItem onClick={() => handleLinkClick(() => onProfileClick && onProfileClick())} className="cursor-pointer py-2.5">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLinkClick(() => onSettingsClick && onSettingsClick())} className="cursor-pointer py-2.5">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            if (user) {
                                handleLinkClick(() => onLogout && onLogout());
                            } else {
                                handleLinkClick(() => onLogout && onLogout()); // Assuming onLogout handles redirect or we need to navigate
                            }
                        }} className={`cursor-pointer py-2.5 ${user ? 'text-red-500 focus:text-red-500' : 'text-[#3d3d3d] dark:text-white'}`}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{user ? "Log Out" : "Log In"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default MobileSidebar;
