// Threads Layout Component - Clean parsing with carousel gallery
import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { MoreHorizontal, User, ChevronLeft, ChevronRight } from 'lucide-react';

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
      <div className="space-y-6">
         {/* MAIN CONTENT CARD */}
         <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm">
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

            {/* 본문 텍스트 */}
            <p className="text-[15px] text-[#000000] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
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

         {/* IMAGE CAROUSEL SECTION - Slide format like Instagram */}
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
                     <span className="text-xs text-[#959595]">
                        {currentIndex + 1} / {displayImages.length}
                     </span>
                  )}
               </div>

               {/* Carousel Container */}
               <div className="relative">
                  {/* Main Image Display - click to navigate */}
                  <div
                     className="relative w-full aspect-square bg-[#f0f0f0] dark:bg-[#252525] rounded-xl overflow-hidden cursor-pointer"
                     onClick={() => displayImages.length > 1 && goToNext()}
                  >
                     <img
                        src={displayImages[currentIndex]}
                        alt={`Thread image ${currentIndex + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                        onError={(e) => {
                           console.error(`[ThreadsImages] Failed to load:`, displayImages[currentIndex]?.substring(0, 80));
                           e.currentTarget.src = '/assets/platforms/threads.png';
                           e.currentTarget.className = 'absolute inset-0 w-full h-full object-contain p-16';
                        }}
                     />
                  </div>

                  {/* Progress Bar Pagination (if multiple images) */}
                  {displayImages.length > 1 && (
                     <div className="mt-3">
                        {/* Progress bar background */}
                        <div className="w-full h-1 bg-[#e0e0e0] dark:bg-[#333333] rounded-full overflow-hidden">
                           {/* Progress bar fill */}
                           <div
                              className="h-full bg-[#21dba4] rounded-full transition-all duration-300"
                              style={{ width: `${((currentIndex + 1) / displayImages.length) * 100}%` }}
                           />
                        </div>
                        {/* Clickable segments for direct navigation */}
                        <div className="flex mt-1">
                           {displayImages.length <= 10 ? (
                              // Show dots for 10 or fewer images
                              <div className="flex items-center justify-center w-full gap-1.5">
                                 {displayImages.map((_: any, idx: number) => (
                                    <button
                                       key={idx}
                                       onClick={(e) => { e.stopPropagation(); goToIndex(idx); }}
                                       className={`rounded-full transition-all ${idx === currentIndex
                                          ? 'w-2 h-2 bg-[#21dba4]'
                                          : 'w-1.5 h-1.5 bg-[#d0d0d0] dark:bg-[#404040] hover:bg-[#959595]'
                                          }`}
                                       aria-label={`Go to image ${idx + 1}`}
                                    />
                                 ))}
                              </div>
                           ) : (
                              // Show prev/next text for many images
                              <div className="flex items-center justify-between w-full text-xs text-[#959595]">
                                 <button
                                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                                    className="hover:text-[#21dba4] transition-colors"
                                 >
                                    ← 이전
                                 </button>
                                 <span>{currentIndex + 1} / {displayImages.length}</span>
                                 <button
                                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                    className="hover:text-[#21dba4] transition-colors"
                                 >
                                    다음 →
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </motion.div>
         )}
      </div>
   );
};

export default ThreadsLayout;
