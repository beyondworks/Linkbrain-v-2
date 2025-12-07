// Instagram Layout Component - Caption and images clearly separated
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "motion/react";
import { Heart, MoreHorizontal, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const InstagramLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   // Get author information
   const authorHandle = clip.authorHandle || clip.author || 'Instagram User';
   const authorAvatar = clip.authorAvatar || null;

   // Get caption/text content
   const caption = clip.contentMarkdown || clip.summary || '';

   // Get valid images (exclude videos)
   const allImages = clip.images && clip.images.length > 0
      ? clip.images
      : (clip.image ? [clip.image] : []);

   // Filter out obvious video URLs (be less strict)
   const imageUrls = useMemo(() => {
      return allImages.filter((url: string) => {
         if (!url) return false;
         const lower = url.toLowerCase();
         // Only filter out definite video file extensions
         return !lower.match(/\.(mp4|mov|avi|webm|m3u8)$/i);
      });
   }, [allImages]);

   // Carousel state
   const [currentIndex, setCurrentIndex] = useState(0);
   const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

   // Reset index if images change
   useEffect(() => {
      setCurrentIndex(0);
   }, [imageUrls]);

   // Navigation
   const goToPrev = () => {
      setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
   };

   const goToNext = () => {
      setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
   };

   const goToIndex = (idx: number) => {
      setCurrentIndex(idx);
   };

   return (
      <div className="flex flex-col gap-4 overflow-hidden">
         {/* CAPTION SECTION */}
         <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm overflow-hidden">
            <div className="flex items-start gap-4 mb-4">
               {/* Author Avatar */}
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {authorAvatar ? (
                     <img
                        src={authorAvatar}
                        alt={authorHandle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                           e.currentTarget.style.display = 'none';
                        }}
                     />
                  ) : (
                     <User className="w-5 h-5 text-white" />
                  )}
               </div>

               {/* Author Info */}
               <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <div>
                        <span className="text-[15px] font-semibold text-[#000000] dark:text-white block">
                           {authorHandle}
                        </span>
                        <span className="text-[#999999] text-sm">{clip.date}</span>
                     </div>
                     <MoreHorizontal className="w-5 h-5 text-[#000000] dark:text-white" />
                  </div>
               </div>
            </div>

            {/* Caption Text */}
            <div className="pl-14">
               <p
                  className="text-[15px] text-[#000000] dark:text-gray-300 whitespace-pre-wrap"
                  style={{ lineHeight: 1.8, overflowWrap: 'break-word', wordBreak: 'break-word' }}
               >
                  {caption}
               </p>
            </div>
         </div>

         {/* IMAGE CAROUSEL SECTION */}
         {imageUrls.length > 0 && (
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
                        이미지 ({imageUrls.length})
                     </h3>
                  </div>
                  {imageUrls.length > 1 && (
                     <span className="text-xs text-[#959595]">
                        {currentIndex + 1} / {imageUrls.length}
                     </span>
                  )}
               </div>

               {/* Carousel Container */}
               <div className="relative">
                  {/* Main Image Display - tap to view fullscreen */}
                  <div
                     className="relative w-full bg-[#f0f0f0] dark:bg-[#252525] rounded-xl overflow-hidden cursor-pointer"
                     onClick={() => setFullscreenImage(imageUrls[currentIndex])}
                  >
                     <img
                        src={imageUrls[currentIndex]}
                        alt={`Instagram image ${currentIndex + 1}`}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '60vh' }}
                        loading="lazy"
                        onError={(e) => {
                           console.error('Image load error:', imageUrls[currentIndex]);
                           e.currentTarget.src = '/assets/platforms/instagram.png';
                           e.currentTarget.className = 'w-full h-auto object-contain p-16';
                        }}
                     />
                  </div>

                  {/* Progress Bar Pagination (if multiple images) */}
                  {imageUrls.length > 1 && (
                     <div className="mt-3">
                        {/* Progress bar background */}
                        <div className="w-full h-1 bg-[#e0e0e0] dark:bg-[#333333] rounded-full overflow-hidden">
                           {/* Progress bar fill */}
                           <div
                              className="h-full bg-[#21dba4] rounded-full transition-all duration-300"
                              style={{ width: `${((currentIndex + 1) / imageUrls.length) * 100}%` }}
                           />
                        </div>
                        {/* Clickable segments for direct navigation */}
                        <div className="flex mt-1">
                           {imageUrls.length <= 10 ? (
                              // Show dots for 10 or fewer images
                              <div className="flex items-center justify-center w-full gap-1.5">
                                 {imageUrls.map((_: any, idx: number) => (
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
                                 <span>{currentIndex + 1} / {imageUrls.length}</span>
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

         {/* Fullscreen Image Modal */}
         {fullscreenImage && (
            <div
               className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
               onClick={() => setFullscreenImage(null)}
            >
               <button
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  onClick={() => setFullscreenImage(null)}
               >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
               <img
                  src={fullscreenImage}
                  alt="Fullscreen view"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
               />
               {/* Navigation arrows for multiple images */}
               {imageUrls.length > 1 && (
                  <>
                     <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        onClick={(e) => {
                           e.stopPropagation();
                           const prevIndex = currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1;
                           setCurrentIndex(prevIndex);
                           setFullscreenImage(imageUrls[prevIndex]);
                        }}
                     >
                        <ChevronLeft className="w-6 h-6" />
                     </button>
                     <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        onClick={(e) => {
                           e.stopPropagation();
                           const nextIndex = currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1;
                           setCurrentIndex(nextIndex);
                           setFullscreenImage(imageUrls[nextIndex]);
                        }}
                     >
                        <ChevronRight className="w-6 h-6" />
                     </button>
                  </>
               )}
               {/* Image counter */}
               {imageUrls.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                     {currentIndex + 1} / {imageUrls.length}
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default InstagramLayout;
