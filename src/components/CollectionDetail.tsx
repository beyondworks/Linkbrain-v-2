import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import ClipCard from './ClipCard';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import svgPaths from "../imports/svg-7yby5ysznz";
import svgPathsOpen from "../imports/svg-necy6hi9g3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getCategoryColor } from '../lib/categoryColors';
import { toast } from 'sonner';

interface CollectionDetailProps {
  collection: {
    id: string; // Changed to string for Firestore ID
    name: string;
    color: string;
    count?: number;
    clipCount?: number;
  };
  onBack: () => void;
  onClipClick?: (clip: any) => void;
  language?: 'KR' | 'EN';
}

const CollectionDetail = ({ collection: colData, onBack, onClipClick, language = 'KR' }: CollectionDetailProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All Sources');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, 'clips'),
      where('collection', '==', colData.name)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedClips = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category || 'Unsorted',
          categoryColor: getCategoryColor(data.category),
          collection: data.collection,
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
  }, [colData.name]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const collectionName = colData.name;
      // Delete the collection document
      await deleteDoc(doc(db, 'collections', colData.id));

      // Optional: Update clips to remove collection reference?
      // For now, just delete the collection.

      setIsDeleteDialogOpen(false);

      toast.success(language === 'KR' ? "컬렉션이 삭제되었습니다" : "Collection deleted successfully", {
        description: language === 'KR'
          ? `"${collectionName}"이(가) 삭제되었습니다`
          : `"${collectionName}" has been deleted`,
      });

      // Delay navigation to ensure toast appears
      setTimeout(() => {
        onBack();
      }, 300);
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error(language === 'KR' ? "삭제 중 오류가 발생했습니다" : "Error deleting collection", {
        description: language === 'KR'
          ? "다시 시도해주세요"
          : "Please try again",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClips = clips.filter(clip => {
    const categoryMatch = selectedCategory === 'All' || clip.category === selectedCategory;
    const sourceMatch = selectedSource === 'All Sources' || clip.source.toLowerCase() === selectedSource.toLowerCase().replace('all sources', '');
    return categoryMatch && sourceMatch;
  });

  const sortedClips = [...filteredClips].sort((a, b) => {
    // Sort locally
    const dateA = a.createdAt?.seconds || 0;
    const dateB = b.createdAt?.seconds || 0;

    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // Extract unique categories and sources from clips
  const uniqueCategories = Array.from(new Set(clips.map(clip => clip.category))).filter(Boolean).sort();
  const uniqueSources = Array.from(new Set(clips.map(clip => clip.source))).filter(Boolean).sort();

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 pb-20 pt-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-[#E0E0E0] flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:border-[#21DBA4] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white`} style={{ backgroundColor: colData.color }}>
              <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                <path d={svgPathsOpen.p18756800} fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-[#3d3d3d] text-[24px] font-bold leading-none">{colData.name}</h2>
              <span className="text-[#959595] text-[14px]">{clips.length} clips</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-[12px] text-[#959595] text-[14px] hover:border-[#21DBA4] hover:text-[#21DBA4] transition-colors focus:outline-none">
              <span>{selectedCategory === 'All' ? (language === 'KR' ? '카테고리' : 'Category') : selectedCategory}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border border-gray-100 shadow-lg p-1">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-gray-50 text-sm text-gray-600 px-3 py-2 focus:text-[#21dba4]"
                onClick={() => setSelectedCategory('All')}
              >
                All
              </DropdownMenuItem>
              {uniqueCategories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  className="cursor-pointer rounded-lg hover:bg-gray-50 text-sm text-gray-600 px-3 py-2 focus:text-[#21dba4]"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Source Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-[12px] text-[#959595] text-[14px] hover:border-[#21DBA4] hover:text-[#21DBA4] transition-colors focus:outline-none">
              <span>{selectedSource === 'All Sources' ? (language === 'KR' ? '출처' : 'Source') : selectedSource}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border border-gray-100 shadow-lg p-1">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-gray-50 text-sm text-gray-600 px-3 py-2 focus:text-[#21dba4]"
                onClick={() => setSelectedSource('All Sources')}
              >
                All Sources
              </DropdownMenuItem>
              {uniqueSources.map((source) => (
                <DropdownMenuItem
                  key={source}
                  className="cursor-pointer rounded-lg hover:bg-gray-50 text-sm text-gray-600 px-3 py-2 focus:text-[#21dba4]"
                  onClick={() => setSelectedSource(source)}
                >
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Button */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] rounded-[12px] text-[#959595] text-[14px] hover:border-[#21DBA4] hover:text-[#21DBA4] transition-colors focus:outline-none">
              <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border border-gray-100 shadow-lg p-1">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-gray-50 text-sm text-gray-600 px-3 py-2 focus:text-[#21dba4]"
                onClick={() => setSortOrder('newest')}
              >
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-gray-50 text-sm text-gray-600 px-3 py-2 focus:text-[#21dba4]"
                onClick={() => setSortOrder('oldest')}
              >
                Oldest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex items-center gap-2 border-l border-r border-gray-200 px-4 mx-2">
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

          {/* Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#959595] transition-colors focus:outline-none">
              <MoreHorizontal className="w-6 h-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white rounded-xl border border-gray-100 shadow-lg p-1">
              <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gray-50 text-sm text-gray-600 px-3 py-2">
                Edit Collection
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-red-50 text-sm text-red-500 px-3 py-2"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#E0E0E0] mb-8"></div>

      {/* Content Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {sortedClips.map(clip => (
          <ClipCard
            key={clip.id}
            {...clip}
            variant={viewMode}
            onClick={() => onClipClick && onClipClick(clip)}
          />
        ))}
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={language === 'KR' ? "컬렉션 삭제" : "Delete Collection"}
        descriptionLines={language === 'KR'
          ? [`"${colData.name}" 컬렉션을 삭제하시겠습니까?`, "이 작업은 되돌릴 수 없습니다."]
          : [`Are you sure you want to delete "${colData.name}"?`, "This action cannot be undone."]}
        isLoading={isDeleting}
        language={language}
      />
    </div>
  );
};

export default CollectionDetail;
