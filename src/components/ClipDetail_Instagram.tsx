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

   // Filter out video URLs
   const imageUrls = useMemo(() => {
      return allImages.filter((url: string) => {
         const lower = url.toLowerCase();
         return !lower.includes('/v/') &&
            !lower.includes('video') &&
            !lower.match(/\\.(mp4|mov|avi|webm)$/);
      });
   }, [allImages]);

   // Carousel state
   const [currentIndex, setCurrentIndex] = useState(0);

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
      <div className="space-y-6">
         {/* CAPTION SECTION */}
         <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm">
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
               <p className="text-[15px] text-[#000000] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
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
                  {/* Main Image Display - 1:1 Aspect Ratio */}
                  <div className="relative w-full aspect-square bg-[#f0f0f0] dark:bg-[#252525] rounded-xl overflow-hidden">
                     <img
                        src={imageUrls[currentIndex]}
                        alt={`Instagram image ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                           console.error('Image load error:', imageUrls[currentIndex]);
                           e.currentTarget.style.display = 'none';
                        }}
                     />

                     {/* Navigation Arrows (only if multiple images) */}
                     {imageUrls.length > 1 && (
                        <>
                           <button
                              onClick={goToPrev}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-black transition-all"
                              aria-label="Previous image"
                           >
                              <ChevronLeft className="w-5 h-5 text-[#000000] dark:text-white" />
                           </button>
                           <button
                              onClick={goToNext}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-black transition-all"
                              aria-label="Next image"
                           >
                              <ChevronRight className="w-5 h-5 text-[#000000] dark:text-white" />
                           </button>
                        </>
                     )}
                  </div>

                  {/* Thumbnail Dots/Indicators (if multiple images) */}
                  {imageUrls.length > 1 && (
                     <div className="flex items-center justify-center gap-2 mt-4">
                        {imageUrls.map((_: any, idx: number) => (
                           <button
                              key={idx}
                              onClick={() => goToIndex(idx)}
                              className={`h-1.5 rounded-full transition-all ${idx === currentIndex
                                    ? 'w-6 bg-[#21dba4]'
                                    : 'w-1.5 bg-[#d0d0d0] dark:bg-[#404040] hover:bg-[#959595]'
                                 }`}
                              aria-label={`Go to image ${idx + 1}`}
                           />
                        ))}
                     </div>
                  )}
               </div>
            </motion.div>
         )}
      </div>
   );
};

export default InstagramLayout;
