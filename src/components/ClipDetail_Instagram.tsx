// Instagram Layout Component - Caption and images clearly separated
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from "motion/react";
import { Heart, MoreHorizontal, User } from 'lucide-react';

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

   // Drag/swipe state
   const containerRef = useRef<HTMLDivElement>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [startX, setStartX] = useState(0);
   const [translateX, setTranslateX] = useState(0);

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
      if (translateX > threshold && imageUrls.length > 1) {
         goToPrev();
      } else if (translateX < -threshold && imageUrls.length > 1) {
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
                           {currentIndex + 1} / {imageUrls.length}
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
                     style={{ cursor: imageUrls.length > 1 ? 'grab' : 'default' }}
                     onMouseDown={imageUrls.length > 1 ? handleMouseDown : undefined}
                     onMouseMove={imageUrls.length > 1 ? handleMouseMove : undefined}
                     onMouseUp={imageUrls.length > 1 ? handleMouseUp : undefined}
                     onMouseLeave={imageUrls.length > 1 ? handleMouseLeave : undefined}
                     onTouchStart={imageUrls.length > 1 ? handleTouchStart : undefined}
                     onTouchMove={imageUrls.length > 1 ? handleTouchMove : undefined}
                     onTouchEnd={imageUrls.length > 1 ? handleTouchEnd : undefined}
                  >
                     <div
                        className="transition-transform duration-200 ease-out"
                        style={{
                           transform: isDragging ? `translateX(${translateX}px)` : 'translateX(0)',
                        }}
                     >
                        <img
                           src={imageUrls[currentIndex]}
                           alt={`Instagram image ${currentIndex + 1}`}
                           className="w-full h-auto pointer-events-none"
                           loading="lazy"
                           draggable={false}
                           onError={(e) => {
                              console.error('Image load error:', imageUrls[currentIndex]);
                              e.currentTarget.src = '/assets/platforms/instagram.png';
                              e.currentTarget.className = 'w-full h-auto p-16 pointer-events-none';
                           }}
                        />
                     </div>
                  </div>
               </div>

               {/* Bar Pagination (if multiple images) */}
               {imageUrls.length > 1 && (
                  <div className="mt-3">
                     <div className="flex gap-1">
                        {imageUrls.map((_: any, idx: number) => (
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

export default InstagramLayout;


