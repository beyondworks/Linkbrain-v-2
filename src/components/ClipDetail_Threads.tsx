// Threads Layout Component - Text and images separated for clarity
import React from 'react';
import { motion } from "motion/react";
import { MoreHorizontal, User } from 'lucide-react';

/**
 * Renders Threads-specific content
 * Displays main content and comments with proper formatting
 */
const renderThreadsContent = (text: string) => {
   if (!text) return null;

   // Check if we have comments section
   const hasComments = text.includes('**COMMENTS_SECTION**');

   if (hasComments) {
      const [mainContent, commentsSection] = text.split('**COMMENTS_SECTION**');
      const comments = commentsSection
         ?.split('**COMMENT_DIVIDER**')
         .map(c => c.trim())
         .filter(c => c.length > 0) || [];

      return (
         <div className="space-y-4">
            {/* Main Content */}
            {mainContent?.trim() && (
               <p className="text-[15px] text-[#000000] dark:text-gray-300 leading-relaxed">
                  {mainContent.trim()}
               </p>
            )}

            {/* Comments Section */}
            {comments.length > 0 && (
               <div className="mt-6">
                  {/* Comments Header */}
                  <div className="pb-2 mb-4 border-b border-[#e5e5e5] dark:border-gray-700">
                     <span className="text-base font-bold text-[#000000] dark:text-white">
                        Comments ({comments.length})
                     </span>
                  </div>
                  {/* Comments List with Dividers */}
                  <div className="space-y-0">
                     {comments.map((comment, idx) => (
                        <div key={idx}>
                           <p className="text-[14px] text-[#333333] dark:text-gray-400 leading-relaxed py-3">
                              {comment}
                           </p>
                           {idx < comments.length - 1 && (
                              <div className="border-b border-[#e5e5e5] dark:border-gray-700" />
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      );
   }

   // No comments - just display content as paragraphs
   const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

   return (
      <div className="space-y-4">
         {paragraphs.map((paragraph, idx) => (
            <p
               key={idx}
               className="text-[15px] text-[#000000] dark:text-gray-300 leading-relaxed"
            >
               {paragraph.trim()}
            </p>
         ))}
      </div>
   );
};

export const ThreadsLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   // Get author information (with fallbacks)
   const authorHandle = clip.authorHandle || 'Thread User';
   const authorName = clip.author || `@${authorHandle}`;
   const authorAvatar = clip.authorAvatar || null;

   // Get text content
   const textContent = clip.contentMarkdown || clip.summary || '';

   // Get images
   const displayImages = clip.images && clip.images.length > 0
      ? clip.images
      : (clip.image ? [clip.image] : []);

   return (
      <div className="space-y-6">
         {/* TEXT SECTION */}
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

                  {/* Text Content - Rendered with proper formatting */}
                  <div className="space-y-3">
                     {renderThreadsContent(textContent)}
                  </div>
               </div>
            </div>
         </div>

         {/* IMAGE GALLERY SECTION */}
         {displayImages.length > 0 && (
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm"
            >
               <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-[#959595]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-[#959595] uppercase tracking-wider">
                     이미지 ({displayImages.length})
                  </h3>
               </div>

               <div className={`gap-3 ${displayImages.length === 1 ? 'block' :
                  displayImages.length === 2 ? 'grid grid-cols-2' :
                     'grid grid-cols-2'
                  }`}>
                  {displayImages.map((imgUrl: string, idx: number) => (
                     <div
                        key={idx}
                        className={`rounded-xl overflow-hidden bg-[#f0f0f0] dark:bg-[#252525] ${displayImages.length === 1 ? 'w-full' : ''
                           }`}
                     >
                        <img
                           src={imgUrl}
                           alt={`Thread image ${idx + 1}`}
                           className="w-full h-auto object-cover"
                           loading="lazy"
                           onError={(e) => {
                              e.currentTarget.style.display = 'none';
                           }}
                        />
                     </div>
                  ))}
               </div>
            </motion.div>
         )}
      </div>
   );
};

export default ThreadsLayout;
