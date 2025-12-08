import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Globe, Smartphone, AtSign, Instagram, Youtube, Settings, LogOut, ChevronUp, User, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import svgPaths from "../imports/svg-7yby5ysznz";
import svgPathsOpen from "../imports/svg-necy6hi9g3";

import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getCategoryColor } from '../lib/categoryColors';

interface SidebarProps {
  onCategorySelect?: (category: string | null) => void;
  onNavigate?: (view: 'clips' | 'collections') => void;
  onCreateCollection?: () => void;
  onCollectionSelect?: (collection: any) => void;
  onSourceSelect?: (source: string | null) => void;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  currentView: 'clips' | 'collections' | 'collection-detail' | 'settings' | 'profile';
  language?: 'KR' | 'EN';
  user?: any;
}

const Sidebar = ({ onCategorySelect, onNavigate, onCreateCollection, onCollectionSelect, onSourceSelect, onSearch, onLogout, onSettingsClick, onProfileClick, currentView, language = 'KR', user }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMyClipOpen, setIsMyClipOpen] = useState(true);
  const [isSourceOpen, setIsSourceOpen] = useState(true);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [tags, setTags] = useState<{ name: string, color: { bg: string, text: string } }[]>([]);
  const [sources, setSources] = useState<{ name: string, icon: React.ReactNode }[]>([]);

  // Debounced search
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
      const clips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed left-0 top-0 bottom-0 border-r border-gray-100 dark:border-gray-800 transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 overflow-hidden bg-[#fafafa] dark:bg-[#161616] ${isOpen ? 'w-[400px] shadow-2xl' : 'w-[80px] md:w-[100px]'
          }`}
      >
        {/* OPEN STATE CONTENT */}
        <div
          className={`absolute top-0 left-0 w-[400px] h-full flex flex-col px-0 transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-200 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >

          {/* Header */}
          <div className="px-8 pt-10 pb-8 flex items-center justify-between">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => onCategorySelect && onCategorySelect(null)}
            >
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#21DBA4] flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 40 40" fill="none">
                  <path d={svgPathsOpen.p35b52a00} fill="currentColor" />
                </svg>
              </div>
              <span className="text-[#21dba4] text-[35px] font-bold leading-none whitespace-nowrap">Linkbrain</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-[18px] h-[18px] text-[#959595] hover:text-[#21DBA4] transition-colors">
              <svg className="w-full h-full" viewBox="0 0 18 18" fill="none">
                <path d={svgPathsOpen.p3bad4b80} fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col overflow-y-auto no-scrollbar flex-1">

            {/* Divider */}
            <div className="w-full h-px bg-[#E0E0E0] dark:bg-gray-800"></div>

            {/* My Clip */}
            <div className="px-8 py-4 flex flex-col gap-2">
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => {
                  if (currentView === 'clips') {
                    setIsMyClipOpen(!isMyClipOpen);
                  } else {
                    onNavigate && onNavigate('clips');
                    setIsMyClipOpen(true);
                  }
                }}
              >
                <div className="flex items-center gap-[20px]">
                  <div className="w-[40px] h-[40px] bg-[#959595] rounded-[10px] flex items-center justify-center text-white group-hover:bg-[#21DBA4] transition-colors">
                    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                      <path d={svgPathsOpen.p15428980} fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[#3d3d3d] dark:text-white text-[20px] font-medium group-hover:text-[#21DBA4] transition-colors whitespace-nowrap">My Clip</span>
                </div>
                <motion.div
                  animate={{ rotate: isMyClipOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-5 h-5 text-[#959595]" />
                </motion.div>
              </div>

              {/* Categories (Tags) */}
              <AnimatePresence initial={false}>
                {isMyClipOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-[60px] pt-2 flex flex-col gap-[10px]">
                      <button
                        onClick={() => onCategorySelect && onCategorySelect('All')}
                        className="bg-[#e0e0e0] dark:bg-[#333] h-[30px] px-4 rounded-[10px] self-start flex items-center hover:opacity-80 transition-opacity cursor-pointer text-left"
                      >
                        <span className="text-[#5a5a5a] dark:text-gray-300 text-[16px] font-medium whitespace-nowrap">All</span>
                      </button>
                      {tags.map(tag => (
                        <button
                          key={tag.name}
                          onClick={() => onCategorySelect && onCategorySelect(tag.name)}
                          className={`${tag.color.bg} h-[30px] px-4 rounded-[10px] self-start flex items-center hover:opacity-80 transition-opacity cursor-pointer text-left`}
                        >
                          <span className={`${tag.color.text} text-[16px] font-medium whitespace-nowrap`}>{tag.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#E0E0E0] dark:bg-gray-800"></div>

            {/* Source Menu */}
            <div className="px-8 py-4 flex flex-col gap-2">
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => {
                  onSourceSelect && onSourceSelect(null);
                  setIsSourceOpen(!isSourceOpen);
                }}
              >
                <div className="flex items-center gap-[20px]">
                  <div className="w-[40px] h-[40px] bg-[#959595] rounded-[10px] flex items-center justify-center text-white group-hover:bg-[#21DBA4] transition-colors">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[#3d3d3d] dark:text-white text-[20px] font-medium group-hover:text-[#21DBA4] transition-colors whitespace-nowrap">Source</span>
                </div>
                <motion.div
                  animate={{ rotate: isSourceOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-5 h-5 text-[#959595]" />
                </motion.div>
              </div>

              {/* Source Items */}
              <AnimatePresence initial={false}>
                {isSourceOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-[60px] pt-2 flex flex-col gap-[10px]">
                      {sources.map(source => (
                        <button
                          key={source.name}
                          onClick={() => onSourceSelect && onSourceSelect(source.name)}
                          className="bg-gray-100 dark:bg-[#333] h-[30px] px-4 rounded-[10px] self-start flex items-center hover:bg-gray-200 dark:hover:bg-[#444] transition-colors cursor-pointer text-left gap-2"
                        >
                          <span className="text-[#5a5a5a] dark:text-gray-300">{source.icon}</span>
                          <span className="text-[#5a5a5a] dark:text-gray-300 text-[16px] font-medium whitespace-nowrap">{source.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#E0E0E0] dark:bg-gray-800"></div>

            {/* Collections */}
            <div className="px-8 pt-4 pb-2 flex flex-col gap-2">
              <div className="flex items-center justify-between group">
                <div
                  className="flex items-center gap-[20px] cursor-pointer"
                  onClick={() => {
                    if (currentView === 'collections') {
                      setIsCollectionsOpen(!isCollectionsOpen);
                    } else {
                      onNavigate && onNavigate('collections');
                      setIsCollectionsOpen(true);
                    }
                  }}
                >
                  <div className="w-[40px] h-[40px] bg-[#959595] rounded-[10px] flex items-center justify-center text-white group-hover:bg-[#21DBA4] transition-colors">
                    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                      <path d={svgPathsOpen.p18756800} fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[#3d3d3d] dark:text-white text-[20px] font-medium group-hover:text-[#21DBA4] transition-colors whitespace-nowrap">Collections</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Add Collection Button */}
                  <button
                    className="w-[24px] h-[24px] flex items-center justify-center rounded-full hover:bg-[#e0e0e0] dark:hover:bg-[#333] text-[#959595] hover:text-[#21DBA4] transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateCollection && onCreateCollection();
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCollectionsOpen(!isCollectionsOpen);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isCollectionsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronUp className="w-5 h-5 text-[#959595]" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Collection Folders */}
              <AnimatePresence initial={false}>
                {isCollectionsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-[60px] pt-2 flex flex-col gap-[10px]">
                      {collections.length > 0 ? collections.map(collection => (
                        <button
                          key={collection.id}
                          onClick={() => onCollectionSelect && onCollectionSelect(collection)}
                          className="bg-gray-100 dark:bg-[#333] h-[30px] px-4 rounded-[10px] self-start flex items-center hover:bg-gray-200 dark:hover:bg-[#444] transition-colors cursor-pointer text-left group/item"
                        >
                          <span className="text-[#5a5a5a] dark:text-gray-300 text-[16px] font-medium whitespace-nowrap group-hover/item:text-[#21dba4] transition-colors">
                            {collection.name}
                          </span>
                        </button>
                      )) : (
                        <div className="text-sm text-gray-400 pl-2">{language === 'KR' ? '컬렉션이 없습니다' : 'No collections'}</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#E0E0E0] dark:bg-gray-800 mt-2 mb-6"></div>

            {/* Bottom Section */}
            <div className="px-8 pb-10 flex flex-col gap-[30px] mt-auto">
              {/* Search Input */}
              <div className="w-full bg-white dark:bg-[#1e1e1e] rounded-[30px] pl-5 pr-4 py-3 shadow-[1px_1px_5px_0px_rgba(0,0,0,0.1)] flex items-center gap-4">
                <div className="w-5 h-5 text-[#959595] flex-shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 23 23" fill="none">
                    <path d={svgPathsOpen.p2e7abd80} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                    <path d={svgPathsOpen.p1edab900} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'KR' ? "검색어를 입력하세요..." : "Search Keywords..."}
                  className="w-full bg-transparent outline-none text-[18px] text-[#3d3d3d] dark:text-white placeholder-[#c5c5c5] dark:placeholder-gray-600"
                />
              </div>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="w-full bg-white dark:bg-[#1e1e1e] rounded-[20px] p-5 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-[50px] h-[50px] rounded-full bg-[#959595] overflow-hidden flex items-center justify-center text-white">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-full h-full" viewBox="0 0 50 50" fill="none">
                            <circle cx="25" cy="25" r="25" fill="currentColor" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[#3d3d3d] dark:text-white text-[18px] font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                          {user?.displayName || user?.email || "Guest"}
                        </span>
                        <span className="text-[#959595] text-[16px] leading-tight whitespace-nowrap">{user ? (language === 'KR' ? '멤버' : 'Member') : (language === 'KR' ? '게스트' : 'Guest')}</span>
                      </div>
                    </div>
                    <ChevronUp className="w-5 h-5 text-[#959595] group-hover:text-[#21DBA4] transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="center" className="w-[330px] mb-2 rounded-[20px] p-2 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800">
                  <DropdownMenuLabel className="text-[#959595]">{language === 'KR' ? '내 계정' : 'My Account'}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:bg-gray-800" />
                  <DropdownMenuItem onClick={() => onProfileClick && onProfileClick()} className="cursor-pointer py-3 rounded-[12px] focus:bg-gray-50 dark:focus:bg-[#252525] text-[#3d3d3d] dark:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>{language === 'KR' ? '프로필' : 'Profile'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSettingsClick && onSettingsClick()} className="cursor-pointer py-3 rounded-[12px] focus:bg-gray-50 dark:focus:bg-[#252525] text-[#3d3d3d] dark:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{language === 'KR' ? '설정' : 'Settings'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-800" />
                  <DropdownMenuItem onClick={() => {
                    if (user) {
                      onLogout && onLogout();
                    } else {
                      onLogout && onLogout();
                    }
                  }} className={`cursor-pointer py-3 rounded-[12px] ${user ? 'text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20' : 'text-[#3d3d3d] dark:text-white focus:bg-gray-50 dark:focus:bg-[#252525]'}`}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{user ? (language === 'KR' ? '로그아웃' : 'Log Out') : (language === 'KR' ? '로그인' : 'Log In')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>


        {/* CLOSED STATE CONTENT */}
        <div
          className={`absolute top-0 left-0 w-full h-full flex flex-col items-center py-8 bg-white dark:bg-[#1e1e1e] transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-200 pointer-events-auto'
            }`}
        >
          {/* Logo Area - Opens Sidebar when closed */}
          <div
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 mb-12 flex items-center justify-center rounded-2xl bg-[#21DBA4] cursor-pointer hover:scale-105 transition-transform"
          >
            <svg className="w-8 h-8 text-white" viewBox="0 0 40 40" fill="none">
              <path d={svgPaths.p35b52a00} fill="currentColor" />
            </svg>
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col gap-8">
            <button
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] transition-colors group"
            >
              <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
                <rect fill="currentColor" className="opacity-0 group-hover:opacity-10 transition-opacity" width="40" height="40" rx="10" />
                <path d={svgPaths.p15428980} fill="currentColor" />
              </svg>
            </button>

            {/* Source Icon for Closed State */}
            <button
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] transition-colors group"
            >
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 rounded-[10px] transition-opacity"></div>
                <Globe className="w-6 h-6" />
              </div>
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] transition-colors group"
            >
              <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
                <rect fill="currentColor" className="opacity-0 group-hover:opacity-10 transition-opacity" width="40" height="40" rx="10" />
                <path d={svgPaths.p18756800} fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Bottom/User Icon */}
          <div className="mt-auto mb-8">
            <div
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#21DBA4] transition-all"
            >
              <div className="w-full h-full bg-[#959595] flex items-center justify-center text-white">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
