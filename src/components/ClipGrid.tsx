import { useState, useEffect, useRef, useCallback } from 'react';
import svgPaths from "../imports/svg-7yby5ysznz";
import ClipCard from './ClipCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Trash2, X } from "lucide-react";
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface ClipGridProps {
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  selectedSource?: string | null;
  onSourceChange?: (source: string | null) => void;
  onClipClick?: (clip: any) => void;
  language: 'KR' | 'EN';
  showThumbnails?: boolean;
  searchQuery?: string;
}

import { getCategoryColor } from '../lib/categoryColors';

const ClipGrid = ({ selectedCategory, onCategoryChange, selectedSource, onSourceChange, onClipClick, language, showThumbnails = true, searchQuery = '' }: ClipGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [visibleCount, setVisibleCount] = useState(6);
  const [clips, setClips] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 6);
      }
    }, { threshold: 0.1 });

    if (node) observerRef.current.observe(node);
  }, [loading]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setClips([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'clips'),
      where('userId', '==', user.uid)
      // orderBy('createdAt', 'desc') // Removed to avoid index requirement for now
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedClips = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category || 'Unsorted',
          categoryColor: getCategoryColor(data.category),
          collection: data.collection || 'Unsorted',
          title: data.title,
          summary: data.summary,
          url: data.url,
          date: data.createdAt?.toDate().toLocaleString() || 'Just now',
          keywords: data.keywords || [],
          source: data.platform || 'web',
          ...data
        };
      });
      setClips(fetchedClips);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch collections
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'collections'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCollections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollections(fetchedCollections);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredClips = clips.filter(clip => {
    const categoryMatch = !selectedCategory || selectedCategory === 'All' || clip.category === selectedCategory;
    const sourceMatch = !selectedSource || selectedSource === 'All Sources' || clip.source.toLowerCase() === selectedSource.toLowerCase();

    // Search filter - match title, summary, keywords, or URL
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query ||
      clip.title?.toLowerCase().includes(query) ||
      clip.summary?.toLowerCase().includes(query) ||
      clip.url?.toLowerCase().includes(query) ||
      clip.keywords?.some((kw: string) => kw.toLowerCase().includes(query));

    return categoryMatch && sourceMatch && searchMatch;
  });

  const sortedClips = [...filteredClips].sort((a, b) => {
    // Sort locally since we removed Firestore orderBy
    const dateA = a.createdAt?.seconds || 0;
    const dateB = b.createdAt?.seconds || 0;

    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // const finalSortedClips = sortOrder === 'newest' ? sortedClips : [...sortedClips].reverse();
  const visibleClips = sortedClips.slice(0, visibleCount);

  const renderClipItem = (clip: any, variant: 'grid' | 'list') => (
    <div key={clip.id} className="relative">
      {isSelectMode && (
        <input
          type="checkbox"
          checked={selectedClips.has(clip.id)}
          onChange={() => toggleClipSelection(clip.id)}
          className="absolute top-4 right-4 w-5 h-5 z-10 cursor-pointer"
        />
      )}
      <ClipCard
        {...clip}
        variant={variant}
        language={language}
        collections={collections}
        onSelectCollection={(name) => handleSelectCollection(clip.id, name)}
        onCreateCollection={handleCreateCollection}
        onClick={!isSelectMode ? () => onClipClick && onClipClick(clip) : undefined}
        showThumbnail={showThumbnails}
      />
    </div>
  );

  if (loading) {
    return <div className="w-full text-center py-20">Loading clips...</div>;
  }

  if (!user) {
    return (
      <div className="w-full text-center py-20">
        <p className="text-lg text-gray-500">
          {language === 'KR' ? "클립을 보려면 로그인하세요." : "Please login to view your clips."}
        </p>
      </div>
    );
  }

  // Extract unique categories and sources from clips
  const uniqueCategories = Array.from(new Set(clips.map(clip => clip.category))).filter(Boolean).sort();
  const uniqueSources = Array.from(new Set(clips.map(clip => clip.source))).filter(Boolean).sort();

  const toggleClipSelection = (clipId: string) => {
    const newSelected = new Set(selectedClips);
    if (newSelected.has(clipId)) {
      newSelected.delete(clipId);
    } else {
      newSelected.add(clipId);
    }
    setSelectedClips(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedClips.size === visibleClips.length) {
      setSelectedClips(new Set());
    } else {
      setSelectedClips(new Set(visibleClips.map(clip => clip.id)));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedClips).map(clipId =>
          deleteDoc(doc(db, 'clips', clipId))
        )
      );
      toast.success(
        language === 'KR'
          ? `${selectedClips.size}개 클립이 삭제되었습니다`
          : `${selectedClips.size} clip(s) deleted`,
        {
          description: language === 'KR'
            ? "클립이 영구적으로 삭제되었습니다"
            : "Clips have been permanently deleted",
        }
      );
      setSelectedClips(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error("Error deleting clips:", error);
      toast.error(
        language === 'KR' ? "클립 삭제 실패" : "Failed to delete clips",
        {
          description: language === 'KR'
            ? "다시 시도해주세요"
            : "Please try again",
        }
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSelectCollection = async (clipId: string, collectionName: string) => {
    try {
      await updateDoc(doc(db, 'clips', clipId), {
        collection: collectionName
      });
      toast.success(
        language === 'KR' ? '컬렉션이 변경되었습니다' : 'Collection updated',
        {
          description: language === 'KR'
            ? `"${collectionName}" 컬렉션으로 이동됨`
            : `Moved to "${collectionName}"`,
        }
      );
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error(
        language === 'KR' ? '컬렉션 변경 실패' : 'Failed to update collection',
        {
          description: language === 'KR' ? '다시 시도해주세요' : 'Please try again',
        }
      );
    }
  };

  const handleCreateCollection = async (data: { name: string; color: string }) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'collections'), {
        name: data.name,
        color: data.color,
        userId: user.uid,
        createdAt: Timestamp.now()
      });
      toast.success(
        language === 'KR' ? '컬렉션이 생성되었습니다' : 'Collection created',
        {
          description: language === 'KR'
            ? `"${data.name}" 컬렉션이 생성됨`
            : `"${data.name}" created`,
        }
      );
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error(
        language === 'KR' ? '컬렉션 생성 실패' : 'Failed to create collection',
        {
          description: language === 'KR' ? '다시 시도해주세요' : 'Please try again',
        }
      );
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-[20px] md:px-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col flex-1">
          {isSelectMode ? (
            <div className="flex items-center gap-3">
              <h2 className="text-[28px] font-bold text-[#21dba4]">
                {selectedClips.size} {language === 'KR' ? '개 선택됨' : 'Selected'}
              </h2>
              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedClips(new Set());
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors"
                title={language === 'KR' ? '취소' : 'Cancel'}
              >
                <X className="w-5 h-5 text-[#959595]" />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-[28px] font-bold text-[#21dba4]">
                My Clip
                {selectedCategory && selectedCategory !== 'All' ? <span className="text-[#3d3d3d]"> - {selectedCategory}</span> : ''}
              </h2>
              {selectedSource && selectedSource !== 'All Sources' && (
                <span className="text-[#959595] text-sm">Filtered by Source: {selectedSource}</span>
              )}
            </>
          )}
        </div>

        {/* Desktop: Original Layout */}
        <div className="hidden md:flex flex-wrap items-center gap-4">
          {/* Selection & Deletion Actions */}
          {isSelectMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#21dba4] hover:text-[#21dba4] text-[#959595] dark:text-gray-400 text-sm font-medium transition-colors"
              >
                {selectedClips.size === visibleClips.length ? (language === 'KR' ? '전체 해제' : 'Deselect All') : (language === 'KR' ? '전체 선택' : 'Select All')}
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={selectedClips.size === 0 || isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? (language === 'KR' ? '삭제 중...' : 'Deleting...') : (language === 'KR' ? '삭제' : 'Delete')}
              </button>
            </div>
          )}

          {/* Filter Buttons (Dropdowns) */}
          {!isSelectMode && <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#959595] text-[#959595] text-sm hover:border-[#21dba4] hover:text-[#21dba4] transition-colors focus:outline-none">
                <span>{sortOrder === 'newest' ? (language === 'KR' ? '최신순' : 'Newest') : (language === 'KR' ? '오래된순' : 'Oldest')}</span>
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2 focus:text-[#21dba4]"
                  onClick={() => setSortOrder('newest')}
                >
                  {language === 'KR' ? '최신순' : 'Newest'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2 focus:text-[#21dba4]"
                  onClick={() => setSortOrder('oldest')}
                >
                  {language === 'KR' ? '오래된순' : 'Oldest'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#959595] text-[#959595] text-sm hover:border-[#21dba4] hover:text-[#21dba4] transition-colors focus:outline-none">
                <span>{selectedCategory && selectedCategory !== 'All' ? selectedCategory : (language === 'KR' ? '카테고리' : 'Category')}</span>
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                  onClick={() => onCategoryChange && onCategoryChange('All')}
                >
                  All
                </DropdownMenuItem>
                {uniqueCategories.map(category => (
                  <DropdownMenuItem
                    key={category}
                    className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                    onClick={() => onCategoryChange && onCategoryChange(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Source Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#959595] text-[#959595] text-sm hover:border-[#21dba4] hover:text-[#21dba4] transition-colors focus:outline-none">
                <span>{selectedSource && selectedSource !== 'All Sources' ? selectedSource : (language === 'KR' ? '출처' : 'Source')}</span>
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                  onClick={() => onSourceChange && onSourceChange('All Sources')}
                >
                  All Sources
                </DropdownMenuItem>
                {uniqueSources.map(source => (
                  <DropdownMenuItem
                    key={source}
                    className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                    onClick={() => onSourceChange && onSourceChange(source)}
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>}


          {/* View Toggle */}
          <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-[#21dba4]' : 'text-[#959595] hover:text-[#21dba4]'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d={svgPaths.pf49f400} fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'text-[#21dba4]' : 'text-[#959595] hover:text-[#21dba4]'}`}
            >
              <svg className="w-6 h-4" viewBox="0 0 25 14" fill="none">
                <path d={svgPaths.p12692e00} fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Selection Mode Toggle - Desktop */}
          {!isSelectMode && (
            <button
              onClick={() => setIsSelectMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#21dba4] hover:text-[#21dba4] text-[#959595] dark:text-gray-300 text-sm font-medium transition-colors"
              title={language === 'KR' ? '선택 모드' : 'Selection mode'}
            >
              <input
                type="checkbox"
                checked={selectedClips.size > 0 && selectedClips.size === visibleClips.length}
                readOnly
                className="w-4 h-4 cursor-pointer accent-[#21dba4] dark:accent-[#21dba4]"
              />
              <span>{language === 'KR' ? '선택' : 'Select'}</span>
            </button>
          )}
        </div>

        {/* Mobile: Filters with Right-Aligned Selection Button */}
        <div className="flex md:hidden w-full items-center justify-between gap-3">
          {/* Filter Buttons (Dropdowns) */}
          {!isSelectMode && <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#959595] text-[#959595] text-xs hover:border-[#21dba4] hover:text-[#21dba4] transition-colors focus:outline-none">
                <span>{sortOrder === 'newest' ? (language === 'KR' ? '최신순' : 'Newest') : (language === 'KR' ? '오래된순' : 'Oldest')}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2 focus:text-[#21dba4]"
                  onClick={() => setSortOrder('newest')}
                >
                  {language === 'KR' ? '최신순' : 'Newest'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2 focus:text-[#21dba4]"
                  onClick={() => setSortOrder('oldest')}
                >
                  {language === 'KR' ? '오래된순' : 'Oldest'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#959595] text-[#959595] text-xs hover:border-[#21dba4] hover:text-[#21dba4] transition-colors focus:outline-none">
                <span>{selectedCategory && selectedCategory !== 'All' ? selectedCategory : (language === 'KR' ? '카테고리' : 'Category')}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                  onClick={() => onCategoryChange && onCategoryChange('All')}
                >
                  All
                </DropdownMenuItem>
                {uniqueCategories.map(category => (
                  <DropdownMenuItem
                    key={category}
                    className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                    onClick={() => onCategoryChange && onCategoryChange(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Source Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#959595] text-[#959595] text-xs hover:border-[#21dba4] hover:text-[#21dba4] transition-colors focus:outline-none">
                <span>{selectedSource && selectedSource !== 'All Sources' ? selectedSource : (language === 'KR' ? '출처' : 'Source')}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                  onClick={() => onSourceChange && onSourceChange('All Sources')}
                >
                  All Sources
                </DropdownMenuItem>
                {uniqueSources.map(source => (
                  <DropdownMenuItem
                    key={source}
                    className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2"
                    onClick={() => onSourceChange && onSourceChange(source)}
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>}

          {/* Mobile Selection Button - Right Aligned */}
          {!isSelectMode && (
            <button
              onClick={() => setIsSelectMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#21dba4] hover:text-[#21dba4] text-[#959595] dark:text-gray-400 text-xs font-medium transition-colors"
              title={language === 'KR' ? '선택 모드' : 'Selection mode'}
            >
              <input
                type="checkbox"
                checked={false}
                readOnly
                className="w-3.5 h-3.5 cursor-pointer"
              />
              <span>{language === 'KR' ? '선택' : 'Select'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#E0E0E0] mb-8"></div>

      {/* Mobile List View (Always List) */}
      <div className="grid gap-4 grid-cols-1 md:hidden">
        {visibleClips.map((clip) => renderClipItem(clip, 'list'))}
      </div>

      {/* Desktop View (Grid/List Toggleable) */}
      <div className={`hidden md:grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {visibleClips.map((clip) => renderClipItem(clip, viewMode))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {visibleCount < sortedClips.length && (
        <div
          ref={loadMoreRef}
          className="mt-8 h-20 flex items-center justify-center"
        >
          <div className="flex items-center gap-2 text-[#959595]">
            <div className="w-5 h-5 border-2 border-[#21dba4] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">{language === 'KR' ? '불러오는 중...' : 'Loading...'}</span>
          </div>
        </div>
      )}

      {/* Mobile Selection Action Bar */}
      {isSelectMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 px-4 py-3 z-50 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Cancel Button */}
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedClips(new Set());
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#959595] hover:text-[#3d3d3d] dark:hover:text-gray-300 text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              <span>{language === 'KR' ? '취소' : 'Cancel'}</span>
            </button>

            {/* Center: Selection Count & Select All */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#21dba4]">
                {selectedClips.size}{language === 'KR' ? '개' : ''}
              </span>
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#21dba4] hover:text-[#21dba4] text-[#959595] dark:text-gray-400 text-xs font-medium transition-colors"
              >
                {selectedClips.size === visibleClips.length ? (language === 'KR' ? '전체 해제' : 'Deselect') : (language === 'KR' ? '전체 선택' : 'Select All')}
              </button>
            </div>

            {/* Right: Delete Button */}
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={selectedClips.size === 0 || isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? (language === 'KR' ? '삭제 중' : '...') : (language === 'KR' ? '삭제' : 'Delete')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        title={language === 'KR' ? "클립 삭제" : "Delete Clips"}
        descriptionLines={language === 'KR'
          ? [`선택된 ${selectedClips.size}개 클립을 삭제하시겠습니까?`, "이 작업은 되돌릴 수 없습니다."]
          : [`Are you sure you want to delete ${selectedClips.size} selected clip(s)?`, "This action cannot be undone."]}
        isLoading={isDeleting}
        language={language}
      />
    </div>
  );
};

export default ClipGrid;
