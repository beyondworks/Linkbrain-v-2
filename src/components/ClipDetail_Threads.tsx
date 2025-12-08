// Threads Layout Component - Clean parsing with carousel gallery
import React, { useState, useEffect, useRef } from 'react';
import { motion } from "motion/react";
import { MoreHorizontal, User } from 'lucide-react';

// ============================================================================
// Parser - marker-based splitting + smart fallback + deduplication
// ============================================================================

const COMMENTS_MARKER = '[[[COMMENTS_SECTION]]]';
const COMMENT_SEPARATOR = '[[[COMMENT_SPLIT]]]';

interface ParsedThread {
   mainText: string;
   comments: string[];
}

/**
 * Deduplicate paragraphs - remove exact duplicates
 */
function deduplicateParagraphs(text: string): string {
   const paragraphs = text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(Boolean);

   const seen = new Set<string>();
   const result: string[] = [];

   for (const p of paragraphs) {
      // Normalize for comparison
      const key = p.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!key || key.length < 5) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(p);
   }

   return result.join('\n\n');
}

/**
 * Detect if a line looks like a comment (short, reaction-like)
 */
function looksLikeComment(line: string): boolean {
   const t = line.trim();

   // Very short responses are likely comments
   if (t.length < 50) return true;

   // Starts with common comment patterns
   if (/^(헐|대박|와|오|ㅋ|ㅎ|👍|🙏|😍|감사|좋아|항상)/i.test(t)) return true;

   // Question or exclamation only responses
   if (/^[^\n]{5,30}[?!~]+$/.test(t)) return true;

   return false;
}

function splitThreadContent(raw: string): ParsedThread {
   if (!raw) return { mainText: '', comments: [] };

   // First, deduplicate the entire text
   const dedupedRaw = deduplicateParagraphs(raw);

   // Try new markers first
   if (dedupedRaw.includes(COMMENTS_MARKER)) {
      const [mainPart, commentsPart] = dedupedRaw.split(COMMENTS_MARKER);
      const mainText = (mainPart || '').trim();

      const comments = commentsPart
         ? commentsPart
            .split(COMMENT_SEPARATOR)
            .map(c => c.trim())
            .filter(c => c.length > 0)
         : [];

      return { mainText, comments };
   }

   // Fallback: try Comments(N) pattern for legacy data
   const legacyMatch = dedupedRaw.match(/Comments?\s*\(\d+\)/i);
   if (legacyMatch) {
      const splitIndex = dedupedRaw.indexOf(legacyMatch[0]);
      const mainText = dedupedRaw.slice(0, splitIndex).trim();
      const commentsRaw = dedupedRaw.slice(splitIndex + legacyMatch[0].length).trim();

      // Split comments by double newline
      const comments = commentsRaw
         .split(/\n\n+/)
         .map(c => c.trim())
         .filter(c => c.length > 3);

      return { mainText, comments };
   }

   // Smart fallback: try to detect comments by content pattern
   const paragraphs = dedupedRaw.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

   if (paragraphs.length > 1) {
      // Find where comments start (first short response-like paragraph)
      let bodyEndIndex = paragraphs.length;

      for (let i = 1; i < paragraphs.length; i++) {
         const p = paragraphs[i];
         // If we find a short comment-like paragraph after a long body
         if (looksLikeComment(p) && paragraphs[i - 1] && paragraphs[i - 1].length > 100) {
            bodyEndIndex = i;
            break;
         }
      }

      // If we found a split point
      if (bodyEndIndex < paragraphs.length) {
         const mainText = paragraphs.slice(0, bodyEndIndex).join('\n\n');
         const comments = paragraphs.slice(bodyEndIndex);
         return { mainText, comments };
      }
   }

   // No patterns found - return as body only
   return { mainText: dedupedRaw, comments: [] };
}

// ============================================================================
// Main Component
// ============================================================================

export const ThreadsLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   // Get author information (with fallbacks)
   const authorHandle = clip.authorHandle || 'Thread User';
   const authorName = clip.author || `@${authorHandle}`;
   const authorAvatar = clip.authorAvatar || null;

   // Get images - filter out empty/invalid URLs
   const displayImages = React.useMemo(() => {
      const allImages = clip.images && clip.images.length > 0
         ? clip.images
         : (clip.image ? [clip.image] : []);

      return allImages.filter((url: string) => {
         if (!url || typeof url !== 'string') return false;
         // Filter out obvious non-image URLs
         const lower = url.toLowerCase();
         return !lower.match(/\.(mp4|mov|avi|webm|m3u8)$/i);
      });
   }, [clip.images, clip.image]);

   // Carousel state
   const [currentIndex, setCurrentIndex] = useState(0);

   // Drag/swipe state
   const containerRef = useRef<HTMLDivElement>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [startX, setStartX] = useState(0);
   const [translateX, setTranslateX] = useState(0);

   // Reset index when images change
   useEffect(() => {
      setCurrentIndex(0);
   }, [displayImages]);

   // Navigation
   const goToPrev = () => {
      setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
   };

   const goToNext = () => {
      setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
   };

   const goToIndex = (idx: number) => {
      setCurrentIndex(idx);
   };

   // Drag handlers
   const handleDragStart = (clientX: number) => {
      setIsDragging(true);
      setStartX(clientX);
      setTranslateX(0);
   };

   const handleDragMove = (clientX: number) => {
      if (!isDragging) return;
      const diff = clientX - startX;
      setTranslateX(diff);
   };

   const handleDragEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const threshold = 50; // minimum drag distance to trigger navigation
      if (translateX > threshold && displayImages.length > 1) {
         goToPrev();
      } else if (translateX < -threshold && displayImages.length > 1) {
         goToNext();
      }
      setTranslateX(0);
   };

   // Mouse events
   const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
   };

   const handleMouseMove = (e: React.MouseEvent) => {
      handleDragMove(e.clientX);
   };

   const handleMouseUp = () => {
      handleDragEnd();
   };

   const handleMouseLeave = () => {
      if (isDragging) handleDragEnd();
   };

   // Touch events
   const handleTouchStart = (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX);
   };

   const handleTouchMove = (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientX);
   };

   const handleTouchEnd = () => {
      handleDragEnd();
   };

   // Parse content - NO normalization, just marker parsing + dedup
   const { mainText, comments } = React.useMemo(() => {
      const rawText = clip.contentMarkdown || '';

      if (!rawText) return { mainText: '', comments: [] };

      try {
         const result = splitThreadContent(rawText);

         console.log('[ThreadsDetail] parsed:', {
            rawLength: rawText.length,
            mainTextLength: result.mainText.length,
            commentsCount: result.comments.length,
         });

         return result;
      } catch (e) {
         console.error('Failed to parse threads markdown', e);
         return { mainText: rawText, comments: [] };
      }
   }, [clip.contentMarkdown]);

   return (
      <div className="flex flex-col gap-4 overflow-hidden">
         {/* MAIN CONTENT CARD */}
         <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm overflow-hidden">
            {/* Header with author info */}
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-2 border-white dark:border-[#1e1e1e] overflow-hidden flex-shrink-0">
                     {authorAvatar ? (
                        <img
                           src={authorAvatar}
                           alt={authorName}
                           className="w-full h-full object-cover"
                           onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                     ) : (
                        <User className="w-5 h-5 text-white" />
                     )}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[15px] font-semibold text-[#000000] dark:text-white">{authorHandle}</span>
                     <span className="text-[#999999] text-xs">{clip.date}</span>
                  </div>
               </div>
               <MoreHorizontal className="w-5 h-5 text-[#959595] hover:text-[#000000] dark:hover:text-white cursor-pointer" />
            </div>

            {/* Content 헤더 */}
            <h3 className="text-sm font-bold text-[#000000] dark:text-white mb-2">
               Content
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />

            {/* 본문 텍스트 - 모바일에서 줄 간격 개선 */}
            <p
               className="text-[15px] text-[#000000] dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
               style={{ lineHeight: 1.8, overflowWrap: 'break-word', wordBreak: 'break-word' }}
            >
               {mainText}
            </p>

            {/* 댓글 섹션 */}
            {comments.length > 0 && (
               <div className="mt-8">
                  {/* Comments 헤더 (볼드) */}
                  <h3 className="text-sm font-bold text-[#000000] dark:text-white mb-2">
                     Comments
                  </h3>

                  {/* 댓글 리스트 - divide-y로 각 댓글 사이 구분선 */}
                  <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                     {comments.map((comment, idx) => (
                        <div key={idx} className="py-4">
                           <p className="text-[15px] text-[#000000] dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {comment}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* IMAGE CAROUSEL SECTION */}
         {displayImages.length > 0 && (
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm"
            >
               {/* Gallery Header */}
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <svg className="w-4 h-4 text-[#959595]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <h3 className="text-sm font-semibold text-[#959595] uppercase tracking-wider">
                        이미지 ({displayImages.length})
                     </h3>
                  </div>
                  {displayImages.length > 1 && (
                     <div className="flex items-center gap-2 text-[#959595]">
                        <button
                           onClick={goToPrev}
                           className="hover:text-[#3d3d3d] transition-colors p-1"
                           aria-label="Previous image"
                        >
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                           </svg>
                        </button>
                        <span className="text-xs min-w-[40px] text-center">
                           {currentIndex + 1} / {displayImages.length}
                        </span>
                        <button
                           onClick={goToNext}
                           className="hover:text-[#3d3d3d] transition-colors p-1"
                           aria-label="Next image"
                        >
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                           </svg>
                        </button>
                     </div>
                  )}
               </div>

               {/* Carousel Container with drag support */}
               <div className="relative">
                  <div
                     ref={containerRef}
                     className="relative w-full bg-[#f0f0f0] dark:bg-[#252525] rounded-xl overflow-hidden select-none"
                     style={{ cursor: displayImages.length > 1 ? 'grab' : 'default' }}
                     onMouseDown={displayImages.length > 1 ? handleMouseDown : undefined}
                     onMouseMove={displayImages.length > 1 ? handleMouseMove : undefined}
                     onMouseUp={displayImages.length > 1 ? handleMouseUp : undefined}
                     onMouseLeave={displayImages.length > 1 ? handleMouseLeave : undefined}
                     onTouchStart={displayImages.length > 1 ? handleTouchStart : undefined}
                     onTouchMove={displayImages.length > 1 ? handleTouchMove : undefined}
                     onTouchEnd={displayImages.length > 1 ? handleTouchEnd : undefined}
                  >
                     <div
                        className="transition-transform duration-200 ease-out"
                        style={{
                           transform: isDragging ? `translateX(${translateX}px)` : 'translateX(0)',
                        }}
                     >
                        <img
                           src={displayImages[currentIndex]}
                           alt={`Thread image ${currentIndex + 1}`}
                           className="w-full h-auto pointer-events-none"
                           loading="lazy"
                           draggable={false}
                           onError={(e) => {
                              console.error(`[ThreadsImages] Failed to load:`, displayImages[currentIndex]?.substring(0, 80));
                              e.currentTarget.src = '/assets/platforms/threads.png';
                              e.currentTarget.className = 'w-full h-auto p-16 pointer-events-none';
                           }}
                        />
                     </div>
                  </div>
               </div>

               {/* Bar Pagination (if multiple images) */}
               {displayImages.length > 1 && (
                  <div className="mt-3">
                     {/* Segmented bar pagination */}
                     <div className="flex gap-1">
                        {displayImages.map((_: any, idx: number) => (
                           <button
                              key={idx}
                              onClick={() => goToIndex(idx)}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentIndex
                                 ? 'bg-[#21dba4]'
                                 : 'bg-[#e0e0e0] dark:bg-[#333333] hover:bg-[#c0c0c0] dark:hover:bg-[#444444]'
                                 }`}
                              aria-label={`Go to image ${idx + 1}`}
                           />
                        ))}
                     </div>
                  </div>
               )}
            </motion.div>
         )}
      </div>
   );
};

export default ThreadsLayout;

