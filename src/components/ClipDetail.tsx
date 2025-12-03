import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Smile, ThumbsUp, ThumbsDown, MoreVertical, User, Globe, AtSign, Instagram, Youtube, Link as LinkIcon, Calendar, Trash2 } from 'lucide-react';
import { motion } from "motion/react";
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { parseThreadContent } from '../../api/lib/content-processor';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';


interface Clip {
   id: string;
   category: string;
   categoryColor: string;
   collection?: string;
   title: string;
   summary: string;
   url: string;
   date: string;
   keywords?: string[];
   source: string;
   thumbnailText?: string;
   htmlContent?: string;
   contentMarkdown?: string;
   image?: string;
   images?: string[];  // NEW: Multiple images
   type?: string;
}

interface ClipDetailProps {
   clip: Clip;
   onBack: () => void;
   language?: 'KR' | 'EN';
}

const ClipDetail = ({ clip, onBack, language = 'KR' }: ClipDetailProps) => {
   // Mock data for engagement
   const [isLiked, setIsLiked] = useState(false);
   const [isSaved, setIsSaved] = useState(false);
   const [collections, setCollections] = useState<any[]>([]);
   const [selectedCollection, setSelectedCollection] = useState(clip.collection || '');
   const [user, setUser] = useState<any>(null);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   React.useEffect(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
         setUser(currentUser);
      });
      return () => unsubscribeAuth();
   }, []);

   React.useEffect(() => {
      if (!user) return;
      const q = query(collection(db, 'collections'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
         setCollections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
   }, [user]);

   const handleDeleteClip = async () => {
      setIsDeleting(true);
      try {
         await deleteDoc(doc(db, 'clips', clip.id));
         toast.success(language === 'KR' ? "클립이 삭제되었습니다" : "Clip deleted successfully", {
            description: language === 'KR'
               ? "클립이 영구적으로 삭제되었습니다"
               : "The clip has been permanently deleted",
         });
         setTimeout(() => {
            onBack();
         }, 500);
      } catch (error) {
         console.error("Error deleting clip:", error);
         toast.error(language === 'KR' ? "클립 삭제 실패" : "Failed to delete clip", {
            description: language === 'KR'
               ? "다시 시도해주세요"
               : "Please try again",
         });
      } finally {
         setIsDeleting(false);
         setIsDeleteDialogOpen(false);
      }
   };

   const renderSourceContent = () => {
      switch (clip.source.toLowerCase()) {
         case 'youtube':
            return <YoutubeLayout clip={clip} isLiked={isLiked} setIsLiked={setIsLiked} isSaved={isSaved} setIsSaved={setIsSaved} />;
         case 'instagram':
            return <InstagramLayout clip={clip} isLiked={isLiked} setIsLiked={setIsLiked} isSaved={isSaved} setIsSaved={setIsSaved} />;
         case 'threads':
            return <ThreadsLayout clip={clip} isLiked={isLiked} setIsLiked={setIsLiked} isSaved={isSaved} setIsSaved={setIsSaved} />;
         default:
            return <WebLayout clip={clip} isLiked={isLiked} setIsLiked={setIsLiked} isSaved={isSaved} setIsSaved={setIsSaved} />;
      }
   };

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: 20 }}
         className="w-full max-w-[1000px] mx-auto px-6 pb-20"
      >
         {/* Header */}
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 flex-1 min-w-0">
               <button
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-[#5a5a5a] dark:text-gray-400 hover:border-[#21dba4] hover:text-[#21dba4] dark:hover:text-[#21dba4] transition-all shadow-sm"
               >
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[#959595] text-sm mb-1">
                     <span className="capitalize">{clip.source}</span>
                     <span>•</span>
                     <span>{clip.date}</span>
                  </div>
                  <h1 className="text-[24px] font-bold text-[#3d3d3d] dark:text-white line-clamp-2 break-words leading-tight">
                     {clip.title}
                  </h1>
               </div>
            </div>

            {/* Actions & Archived Badge */}
            <div className="hidden md:flex items-center gap-3">
               <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-[#959595] dark:text-gray-400 hover:border-red-200 hover:text-red-500 dark:hover:border-red-900/30 dark:hover:text-red-400 transition-all shadow-sm"
                  title={language === 'KR' ? '클립 삭제' : 'Delete clip'}
               >
                  <Trash2 className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#21DBA4] animate-pulse"></div>
                  <span className="text-xs font-medium text-[#21DBA4]">
                     {language === 'KR' ? '영구 아카이브됨' : 'Permanently Archived'}
                  </span>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="flex flex-col lg:flex-row gap-8">
            {/* Source Specific Layout */}
            <div className="flex-1 min-w-0">
               {renderSourceContent()}
            </div>

            {/* Linkbrain Sidebar (AI Analysis & Notes) - Sticky */}
            <div className="w-full lg:w-[320px] flex-shrink-0 h-fit sticky top-8 flex flex-col gap-6">

               {/* AI Summary Card */}
               <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-6 shadow-sm border border-[#f0f0f0] dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-[#e0fcf5] dark:bg-[#21dba4]/20 flex items-center justify-center text-[#21dba4]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </div>
                     <h3 className="text-lg font-bold text-[#3d3d3d] dark:text-white">
                        {language === 'KR' ? 'AI 인사이트' : 'AI Insight'}
                     </h3>
                  </div>
                  <div className="space-y-3">
                     <p className="text-[#5a5a5a] dark:text-gray-400 text-sm leading-relaxed">
                        {clip.summary}
                     </p>
                     <div className="pt-3 flex flex-wrap gap-2">
                        {clip.keywords?.map((keyword, i) => (
                           <span key={i} className="px-3 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#252525] text-[#959595] text-xs font-medium">
                              #{keyword}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Metadata Card */}
               <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-6 shadow-sm border border-[#f0f0f0] dark:border-gray-800">
                  <div className="space-y-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#959595] font-medium uppercase tracking-wider">
                           {language === 'KR' ? '카테고리' : 'Category'}
                        </span>
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${clip.categoryColor}`}></div>
                           <span className="text-[#3d3d3d] dark:text-white font-medium">{clip.category}</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#959595] font-medium uppercase tracking-wider">
                           {language === 'KR' ? '컬렉션' : 'Collection'}
                        </span>
                        <div className="relative">
                           <select
                              className="w-full px-3 py-2 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg text-[#3d3d3d] dark:text-white text-sm focus:outline-none focus:border-[#21dba4] cursor-pointer"
                              value={selectedCollection}
                              onChange={async (e) => {
                                 const newCollection = e.target.value;
                                 setSelectedCollection(newCollection);
                                 try {
                                    await updateDoc(doc(db, 'clips', clip.id), {
                                       collection: newCollection
                                    });
                                    toast.success(
                                       language === 'KR'
                                          ? '컬렉션이 변경되었습니다'
                                          : "Clip has been moved to collection",
                                       { description: newCollection }
                                    );
                                 } catch (error) {
                                    console.error("Error updating collection:", error);
                                    toast.error(language === 'KR' ? "컬렉션 변경 실패" : "Failed to update collection", {
                                       description: language === 'KR' ? "다시 시도해주세요" : "Please try again"
                                    });
                                    // Revert on error
                                    setSelectedCollection(clip.collection || '');
                                 }
                              }}
                           >
                              <option value="">{language === 'KR' ? '선택 안함' : 'Unsorted'}</option>
                              {collections.map((col: any) => (
                                 <option key={col.id} value={col.name}>
                                    {col.name}
                                 </option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#959595] font-medium uppercase tracking-wider">Original URL</span>
                        <a href={clip.url.startsWith('http') ? clip.url : `https://${clip.url}`} target="_blank" rel="noreferrer" className="text-[#21dba4] text-sm truncate hover:underline">
                           {clip.url}
                        </a>
                        <span className="text-[10px] text-[#959595]">
                           {language === 'KR'
                              ? '* 원본 링크가 만료되어도 콘텐츠는 영구적으로 보존됩니다.'
                              : '* Content is archived and available even if the original link expires.'}
                        </span>
                     </div>

                     {/* View Original Post Button */}
                     <a
                        href={clip.url.startsWith('http') ? clip.url : `https://${clip.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#f9f9f9] dark:bg-[#252525] hover:bg-[#21dba4]/10 dark:hover:bg-[#21dba4]/20 border border-gray-200 dark:border-gray-700 hover:border-[#21dba4] rounded-lg px-4 py-2.5 text-sm font-medium text-[#3d3d3d] dark:text-white hover:text-[#21dba4] dark:hover:text-[#21dba4] transition-all"
                     >
                        <Globe className="w-4 h-4" />
                        {language === 'KR' ? '원본 게시물 보기' : 'View Original Post'}
                     </a>
                  </div>
               </div>

            </div>
         </div>

         {/* Delete Confirmation Dialog */}
         <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteClip}
            title={language === 'KR' ? "클립 삭제" : "Delete Clip"}
            descriptionLines={language === 'KR'
               ? [`"${clip.title}" 클립을 삭제하시겠습니까?`, "이 작업은 되돌릴 수 없습니다."]
               : [`Are you sure you want to delete "${clip.title}"?`, "This action cannot be undone."]}
            isLoading={isDeleting}
            language={language}
         />
      </motion.div>
   );
};

/* --- Layout Components --- */

const getYoutubeId = (url: string) => {
   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
   const match = url.match(regExp);
   return (match && match[2].length === 11) ? match[2] : null;
};

const YoutubeLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   const videoId = getYoutubeId(clip.url);

   return (
      <div className="flex flex-col gap-4">
         {/* Video Player */}
         <div className="w-full aspect-video bg-black rounded-[20px] overflow-hidden relative group shadow-lg">
            {videoId ? (
               <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={clip.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
               ></iframe>
            ) : (
               <div className="absolute inset-0 flex items-center justify-center">
                  <Youtube className="w-20 h-20 text-white opacity-80" />
                  <span className="text-white mt-4">Invalid Video URL</span>
               </div>
            )}
         </div>

         {/* Video Info */}
         <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-6 shadow-sm border border-[#f0f0f0] dark:border-gray-800">
            <h2 className="text-[22px] font-bold text-[#3d3d3d] dark:text-white leading-tight mb-3 max-h-[3.5rem] overflow-hidden break-words">{clip.title}</h2>

            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0f0f0] dark:bg-[#252525] flex items-center justify-center">
                     <User className="w-5 h-5 text-[#959595]" />
                  </div>
                  <div className="flex flex-col">
                     <span className="font-medium text-[#3d3d3d] dark:text-white text-sm">Channel</span>
                     <span className="text-[#959595] text-xs">Subscriber count hidden</span>
                  </div>
               </div>
            </div>

            {/* Description */}
            <div className="bg-[#f9f9f9] dark:bg-[#252525] rounded-[12px] p-4">
               <div className="flex gap-2 text-sm font-medium text-[#3d3d3d] dark:text-white mb-2">
                  <span>{clip.date}</span>
               </div>
               <p className="text-sm text-[#5a5a5a] dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {clip.summary}
               </p>
            </div>
         </div>
      </div>
   );
};

const InstagramLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => (
   <div className="w-full max-w-[600px] mx-auto bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#dbdbdb] dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#efefef] dark:border-gray-800">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
               <div className="w-full h-full rounded-full bg-white dark:bg-[#1e1e1e] border-2 border-transparent overflow-hidden flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
               </div>
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-semibold text-[#262626] dark:text-white">Instagram User</span>
               <span className="text-xs text-[#5a5a5a] dark:text-gray-400">Original Audio</span>
            </div>
         </div>
         <MoreHorizontal className="w-5 h-5 text-[#262626] dark:text-white" />
      </div>

      {/* Image/Content */}
      <div className="w-full aspect-square bg-[#f0f0f0] dark:bg-[#252525] flex items-center justify-center relative group overflow-hidden">
         {clip.image ? (
            <img src={clip.image} alt={clip.title} className="w-full h-full object-cover" />
         ) : (
            <div className="text-[#959595] font-medium text-lg tracking-widest">NO IMAGE</div>
         )}
         {/* Like Animation Placeholder */}
         {isLiked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.8 }}>
                  <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
               </motion.div>
            </div>
         )}
      </div>

      {/* Actions (Removed) */}
      <div className="p-4 pb-2">
         <div className="text-sm font-semibold text-[#262626] dark:text-white mb-2">Liked by others</div>
         <div className="space-y-1">
            <p className="text-sm text-[#262626] dark:text-white">
               <span className="font-semibold mr-2">Instagram User</span>
               {clip.summary}
            </p>
            <div className="text-[#959595] text-xs uppercase mt-2">{clip.date}</div>
         </div>
      </div>
   </div>
);

const ThreadsLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   // Try to parse contentMarkdown if available
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
                           {section.type === 'comment' ? '댓글' : '본문'}
                        </span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                     </div>
                  )}

                  {/* Threads Card */}
                  <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm relative">
                     <div className="absolute left-[42px] top-[64px] bottom-[30px] w-[2px] bg-[#e5e5e5] dark:bg-[#333]"></div>

                     <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2 z-10">
                           <div className="w-9 h-9 rounded-full bg-[#f0f0f0] dark:bg-[#252525] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                              <User className="w-5 h-5 text-[#959595]" />
                           </div>
                        </div>
                        <div className="flex-1">
                           {/* Header */}
                           <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                 <span className="text-[15px] font-semibold text-[#000000] dark:text-white">Threads User</span>
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
                                       <div className="rounded-xl overflow-hidden bg-[#f0f0f0] dark:bg-[#252525]">
                                          <img
                                             src={block.content}
                                             alt="Thread image"
                                             className="w-full h-auto"
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

   // FALLBACK: Use summary and images if no contentMarkdown
   return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#f0f0f0] dark:border-gray-800 p-6 shadow-sm relative">
         {/* Thread Line */}
         <div className="absolute left-[42px] top-[64px] bottom-[30px] w-[2px] bg-[#e5e5e5] dark:bg-[#333]"></div>

         <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2 z-10">
               <div className="w-9 h-9 rounded-full bg-[#f0f0f0] dark:bg-[#252525] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <User className="w-5 h-5 text-[#959595]" />
               </div>
            </div>
            <div className="flex-1">
               {/* Header */}
               <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[15px] font-semibold text-[#000000] dark:text-white">Threads User</span>
                     <span className="text-[#999999] text-sm">{clip.date}</span>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-[#000000] dark:text-white" />
               </div>

               {/* Content */}
               <div className="mb-3">
                  <h2 className="text-[15px] text-[#000000] dark:text-white leading-relaxed font-medium mb-2 max-h-[2rem] overflow-hidden break-words">{clip.title}</h2>
                  <p className="text-[15px] text-[#000000] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                     {clip.summary}
                  </p>

                  {/* Image Gallery */}
                  {displayImages.length > 0 && (
                     <div className={`mt-3 gap-2 ${displayImages.length === 1 ? 'block' :
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

               {/* Actions (Removed) */}
            </div>
         </div>
      </div>
   );
};

const WebLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => (
   <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] overflow-hidden border border-[#f0f0f0] dark:border-gray-800 shadow-sm">
      {/* Browser Header */}
      <div className="bg-[#f8f8f8] dark:bg-[#252525] px-4 py-3 border-b border-[#f0f0f0] dark:border-gray-800 flex items-center gap-4">
         <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
         </div>
         <div className="flex-1 flex items-center justify-center">
            <div className="bg-white dark:bg-[#1e1e1e] px-4 py-1.5 rounded-md flex items-center gap-2 w-full max-w-[400px] text-xs text-[#5a5a5a] dark:text-gray-400 shadow-sm border border-[#e0e0e0] dark:border-gray-700">
               <Globe className="w-3 h-3" />
               <span className="truncate">{clip.url}</span>
            </div>
         </div>
         <div className="w-[60px]"></div>
      </div>

      {/* Content */}
      <div className="p-8 md:p-10">
         {/* Article Header */}
         <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
               <span className={`px-2 py-1 rounded-md ${clip.categoryColor.bg} ${clip.categoryColor.text} text-xs font-medium`}>{clip.category}</span>
               <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-[#252525] text-xs font-medium text-[#5a5a5a] dark:text-gray-400">{clip.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3d3d3d] dark:text-white mb-6 leading-tight max-h-[5rem] overflow-hidden break-words">{clip.title}</h1>

            {/* Hero Image */}
            {clip.image && (
               <div className="w-full aspect-[21/9] bg-[#f0f0f0] dark:bg-[#252525] rounded-xl mb-8 flex items-center justify-center overflow-hidden">
                  <img src={clip.image} alt={clip.title} className="w-full h-full object-cover" />
               </div>
            )}
         </div>

         {/* Archived Content */}
         {clip.htmlContent ? (
            <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
               <iframe
                  srcDoc={clip.htmlContent}
                  title="Archived Content"
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin"
               />
            </div>
         ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
               <p className="text-lg text-[#5a5a5a] dark:text-gray-300 leading-relaxed mb-6 font-medium">
                  {clip.summary}
               </p>
               <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center text-gray-500">
                  No archived content available.
               </div>
            </div>
         )}
      </div>
   </div>
);

export default ClipDetail;
