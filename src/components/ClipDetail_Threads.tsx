// Threads Layout Component - Enhanced with structured content blocks
import React from 'react';
import { motion } from "motion/react";
import { Heart, MoreHorizontal, User } from 'lucide-react';
import { parseThreadContent } from '../../api/lib/content-processor';

export const ThreadsLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   // Parse contentMarkdown into structured sections
   const parsed = React.useMemo(() => {
      if (clip.contentMarkdown) {
         try {
            return parseThreadContent(clip.contentMarkdown);
         } catch (e) {
            console.error('Failed to parse thread content:', e);
            return null;
         }
      }
      return null;
   }, [clip.contentMarkdown]);

   const displayImages = clip.images && clip.images.length > 0
      ? clip.images
      : (clip.image ? [clip.image] : []);

   // Get author information (with fallbacks)
   const authorHandle = clip.authorHandle || 'Thread User';
   const authorName = clip.author || `@${authorHandle}`;
   const authorAvatar = clip.authorAvatar || null;

   // If we have parsed content with blocks, render them
   if (parsed && parsed.sections.length > 0 && parsed.sections[0].blocks.length > 0) {
      return (
         <div className="space-y-6">
            {parsed.sections.map((section: any, sectionIdx: number) => (
               <div key={sectionIdx}>
                  {/* Section Header for comments */}
                  {sectionIdx > 0 && (
                     <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                        <span className="text-sm font-semibold text-[#959595] uppercase tracking-wider">
                           {section.type === 'comment' ? '작성자 댓글' : '본문'}
                        </span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                     </div>
                  )}

                  {/* Threads Card */}
                  <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm relative">
                     <div className="absolute left-[42px] top-[64px] bottom-[30px] w-[2px] bg-[#e5e5e5] dark:bg-[#333]"></div>

                     <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2 z-10">
                           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-2 border-white dark:border-[#1e1e1e] overflow-hidden flex-shrink-0">
                              {authorAvatar ? (
                                 <img 
                                    src={authorAvatar}
                                    alt={authorName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                       e.currentTarget.style.display = 'none';
                                    }}
                                 />
                              ) : (
                                 <User className="w-5 h-5 text-white" />
                              )}
                           </div>
                        </div>
                        <div className="flex-1">
                           {/* Header */}
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                 <span className="text-[15px] font-semibold text-[#000000] dark:text-white">{authorHandle}</span>
                                 <span className="text-[#999999] text-sm">{clip.date}</span>
                              </div>
                              <MoreHorizontal className="w-5 h-5 text-[#000000] dark:text-white" />
                           </div>

                           {/* Blocks */}
                           <div className="space-y-3">
                              {section.blocks.map((block: any, blockIdx: number) => (
                                 <div key={blockIdx}>
                                    {block.type === 'text' ? (
                                       <p className="text-[15px] text-[#000000] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                          {block.content}
                                       </p>
                                    ) : (
                                       <div className="rounded-xl overflow-hidden bg-[#f0f0f0] dark:bg-[#252525] inline-block max-w-full">
                                          <img
                                             src={block.content}
                                             alt="Thread image"
                                             className="max-w-full h-auto max-h-96"
                                             loading="lazy"
                                             onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                             }}
                                          />
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>

                           {/* Remaining Images (not in blocks) */}
                           {sectionIdx === parsed.sections.length - 1 && (() => {
                              // Collect all images used in blocks
                              const usedImages = new Set<string>();
                              parsed.sections.forEach((s: any) => {
                                 s.blocks.forEach((b: any) => {
                                    if (b.type === 'image') usedImages.add(b.content);
                                 });
                              });

                              // Filter clip.images
                              const remainingImages = (clip.images || []).filter((img: string) => !usedImages.has(img));

                              if (remainingImages.length > 0) {
                                 return (
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                       {remainingImages.map((img: string, idx: number) => (
                                          <div key={`extra-img-${idx}`} className="rounded-xl overflow-hidden bg-[#f0f0f0] dark:bg-[#252525]">
                                             <img
                                                src={img}
                                                alt={`Thread image ${idx + 1}`}
                                                className="w-full h-auto"
                                                loading="lazy"
                                                onError={(e) => {
                                                   e.currentTarget.style.display = 'none';
                                                }}
                                             />
                                          </div>
                                       ))}
                                    </div>
                                 );
                              }
                              return null;
                           })()}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      );
   }

   // FALLBACK: Use summary and images if no contentMarkdown or parsing failed
   return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm relative">
         {/* Thread Line */}
         <div className="absolute left-[42px] top-[64px] bottom-[30px] w-[2px] bg-[#e5e5e5] dark:bg-[#333]"></div>

         <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2 z-10">
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-2 border-white dark:border-[#1e1e1e] overflow-hidden flex-shrink-0">
                  {authorAvatar ? (
                     <img 
                        src={authorAvatar}
                        alt={authorName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                           e.currentTarget.style.display = 'none';
                        }}
                     />
                  ) : (
                     <User className="w-5 h-5 text-white" />
                  )}
               </div>
            </div>
            <div className="flex-1">
               {/* Header */}
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <span className="text-[15px] font-semibold text-[#000000] dark:text-white">{authorHandle}</span>
                     <span className="text-[#999999] text-sm">{clip.date}</span>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-[#000000] dark:text-white" />
               </div>

               {/* Content */}
               <div className="mb-3">
                  <p className="text-[15px] text-[#000000] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                     {clip.contentMarkdown || clip.summary}
                  </p>

                  {/* Image Gallery */}
                  {displayImages.length > 0 && (
                     <div className={`mt-4 gap-2 ${displayImages.length === 1 ? 'block' :
                        displayImages.length === 2 ? 'grid grid-cols-2' :
                           displayImages.length === 3 ? 'grid grid-cols-3' :
                              'grid grid-cols-2'
                        }`}>
                        {displayImages.slice(0, 6).map((imgUrl: string, idx: number) => (
                           <div
                              key={idx}
                              className={`rounded-xl overflow-hidden bg-[#f0f0f0] dark:bg-[#252525] ${displayImages.length === 1 ? 'w-full' :
                                 displayImages.length >= 4 && idx >= 4 ? 'col-span-2' : ''
                                 }`}
                           >
                              <img
                                 src={imgUrl}
                                 alt={`Thread image ${idx + 1}`}
                                 className="w-full h-full object-cover"
                                 loading="lazy"
                                 onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                 }}
                              />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ThreadsLayout;
