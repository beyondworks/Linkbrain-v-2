// Instagram Layout Component - Perfect 1:1 display with video exclusion
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "motion/react";
import { Heart, MoreHorizontal, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const InstagramLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   // Get author information
   const authorHandle = clip.authorHandle || 'Instagram User';
   const authorName = clip.author || `@${authorHandle}`;
   const authorAvatar = clip.authorAvatar || null;
   const actualCaption = clip.contentMarkdown || clip.summary || '';

   // Get all images - filter OUT videos and UI elements
   const allImages = useMemo(() => {
      const images = [];
      if (clip.image) images.push(clip.image);
      if (clip.images && Array.isArray(clip.images)) {
         images.push(...clip.images);
      }
      return images;
   }, [clip.image, clip.images]);

   // Aggressively filter: ONLY static photos, NO videos
   const photoOnlyImages = useMemo(() => {
      return allImages.filter((img: string) => {
         if (!img || typeof img !== 'string' || img.length < 20) return false;
         
         const lower = img.toLowerCase();
         
         // EXCLUDE: Video-related patterns
         if (lower.includes('/video')) return false;
         if (lower.includes('/reel')) return false;
         if (lower.includes('_v/') || lower.includes('_video_')) return false;
         if (lower.includes('video_id')) return false;
         if (lower.includes('mp4') || lower.includes('webm') || lower.includes('mov')) return false;
         if (lower.includes('vp9') || lower.includes('av1') || lower.includes('h264') || lower.includes('hevc')) return false;
         if (lower.includes('video_thumbnail')) return false;
         
         // EXCLUDE: Small UI elements
         if (lower.includes('16x16') || lower.includes('32x32') || lower.includes('64x64')) return false;
         if (lower.includes('icon') || lower.includes('emoji') || lower.includes('placeholder')) return false;
         if (lower.match(/[/_](\d{1,3})x(\d{1,3})[/_]/) && img.length < 100) return false; // Tiny images
         
         // ONLY accept Instagram/Facebook CDN photos
         if (!lower.includes('instagram') && !lower.includes('fbcdn')) return false;
         
         // Sanity check: image file must be reasonably sized in URL
         if (img.length < 50) return false;
         
         return true;
      });
   }, [allImages]);

   // Carousel state
   const [currentIndex, setCurrentIndex] = useState(0);

   // Get safe current index
   const safeIndex = useMemo(() => {
      if (photoOnlyImages.length === 0) return -1;
      return Math.min(currentIndex, photoOnlyImages.length - 1);
   }, [currentIndex, photoOnlyImages.length]);

   const currentImage = safeIndex >= 0 ? photoOnlyImages[safeIndex] : null;

   // Navigation
   const goToPrev = () => {
      if (photoOnlyImages.length <= 1) return;
      setCurrentIndex(prev => prev === 0 ? photoOnlyImages.length - 1 : prev - 1);
   };

   const goToNext = () => {
      if (photoOnlyImages.length <= 1) return;
      setCurrentIndex(prev => prev === photoOnlyImages.length - 1 ? 0 : prev + 1);
   };

   const goToIndex = (idx: number) => {
      setCurrentIndex(idx);
   };

   return (
      <div className="w-full max-w-[600px] mx-auto bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#dbdbdb] dark:border-gray-800 shadow-sm overflow-hidden">
         {/* Header */}
         <div className="p-4 flex items-center justify-between border-b border-[#efefef] dark:border-gray-800">
            <div className="flex items-center gap-3 flex-1 min-w-0">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px] flex-shrink-0 overflow-hidden">
                  {authorAvatar ? (
                     <img 
                        src={authorAvatar} 
                        alt={authorName}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                     />
                  ) : (
                     <div className="w-full h-full rounded-full bg-white dark:bg-[#1e1e1e] flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                     </div>
                  )}
               </div>
               <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-[#262626] dark:text-white truncate">
                     {authorHandle}
                  </span>
                  {authorHandle !== 'Instagram User' && (
                     <span className="text-xs text-[#5a5a5a] dark:text-gray-400">Instagram</span>
                  )}
               </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-[#262626] dark:text-white flex-shrink-0" />
         </div>

         {/* Image Container - Perfect 1:1 aspect ratio */}
         {photoOnlyImages.length > 0 && currentImage ? (
            <div className="w-full relative group overflow-hidden" style={{ aspectRatio: '1 / 1', backgroundColor: '#000000' }}>
               {/* Image with perfect crop - NO distortion */}
               <img
                  src={currentImage}
                  alt={`Image ${safeIndex + 1}`}
                  className="w-full h-full object-cover"
                  style={{
                     display: 'block',
                     width: '100%',
                     height: '100%'
                  }}
               />

               {/* Left arrow */}
               {photoOnlyImages.length > 1 && (
                  <button
                     onClick={goToPrev}
                     className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                     <ChevronLeft className="w-6 h-6" />
                  </button>
               )}

               {/* Right arrow */}
               {photoOnlyImages.length > 1 && (
                  <button
                     onClick={goToNext}
                     className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                     <ChevronRight className="w-6 h-6" />
                  </button>
               )}

               {/* Counter badge */}
               {photoOnlyImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full z-20">
                     <span className="text-white text-xs font-semibold">
                        {safeIndex + 1}/{photoOnlyImages.length}
                     </span>
                  </div>
               )}

               {/* Dot indicators */}
               {photoOnlyImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                     {photoOnlyImages.map((_, idx) => (
                        <button
                           key={idx}
                           onClick={() => goToIndex(idx)}
                           className={`rounded-full transition-all ${
                              idx === safeIndex
                                 ? 'bg-white w-6 h-1.5'
                                 : 'bg-white/50 hover:bg-white/75 w-1.5 h-1.5'
                           }`}
                        />
                     ))}
                  </div>
               )}

               {/* Like animation */}
               {isLiked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1.2, opacity: 0 }} 
                        transition={{ duration: 0.8 }}
                     >
                        <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
                     </motion.div>
                  </div>
               )}
            </div>
         ) : (
            <div className="w-full bg-[#f0f0f0] dark:bg-[#252525] flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
               <div className="text-[#959595] font-medium text-lg">NO PHOTOS</div>
            </div>
         )}

         {/* Caption */}
         <div className="p-4">
            <div className="text-sm font-semibold text-[#262626] dark:text-white mb-3">
               {photoOnlyImages.length > 1 ? `${photoOnlyImages.length} photos` : 'Liked by others'}
            </div>

            {actualCaption ? (
               <div className="space-y-2">
                  <div className="text-sm text-[#262626] dark:text-white leading-relaxed">
                     <span className="font-semibold">{authorHandle}</span>
                     {' '}
                     <span className="text-[#262626] dark:text-gray-300 whitespace-pre-wrap">
                        {actualCaption}
                     </span>
                  </div>
                  <div className="text-[#959595] text-xs uppercase tracking-wide pt-2">
                     {clip.date}
                  </div>
               </div>
            ) : (
               <div className="text-sm text-[#959595]">{clip.title}</div>
            )}

            {photoOnlyImages.length > 1 && (
               <div className="mt-3 pt-3 border-t border-[#efefef] dark:border-gray-800 text-xs text-[#959595]">
                  {photoOnlyImages.length} photos in carousel
               </div>
            )}
         </div>
      </div>
   );
};

export default InstagramLayout;
