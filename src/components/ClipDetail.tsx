import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Smile, ThumbsUp, ThumbsDown, MoreVertical, User, Globe, AtSign, Instagram, Youtube, Link as LinkIcon, Calendar, Trash2 } from 'lucide-react';
import { motion } from "motion/react";
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import CategoryChangeDialog from './CategoryChangeDialog';
import { InstagramLayout } from './ClipDetail_Instagram';
import { ThreadsLayout } from './ClipDetail_Threads';


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
   author?: string;                 // NEW: Author name/handle
   authorHandle?: string;           // NEW: Platform handle (@username)
   authorAvatar?: string;           // NEW: Profile image URL
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
   const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

   // Local category state for real-time updates
   const [currentCategory, setCurrentCategory] = useState(clip.category);
   const [currentCategoryColor, setCurrentCategoryColor] = useState(clip.categoryColor);

   // Handle category change from dialog
   const handleCategoryChange = (newCategory: string, newColor: { bg: string; text: string }) => {
      setCurrentCategory(newCategory);
      setCurrentCategoryColor(newColor as any);
   };

   // Scroll to top on mount
   useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
   }, [clip.id]);

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
      <>
         {/* Fixed Header - Outside motion for instant render */}
         <div className="fixed top-0 left-0 md:left-[100px] right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm py-3 px-4 md:px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-4">
               <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                     onClick={onBack}
                     className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border border-[#E0E0E0] dark:border-gray-700 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:border-[#21DBA4] transition-colors flex-shrink-0"
                  >
                     <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="min-w-0 flex-1">
                     <div className="flex items-center gap-2 text-[#959595] text-sm mb-0.5">
                        <span className="capitalize">{clip.source}</span>
                        <span>•</span>
                        <span>{clip.date}</span>
                     </div>
                     <h1 className="text-[18px] md:text-[22px] font-bold text-[#3d3d3d] dark:text-white line-clamp-1 break-words leading-tight">
                        {clip.title}
                     </h1>
                  </div>
               </div>

               {/* Actions & Archived Badge */}
               <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-full">
                     <div className="w-2 h-2 rounded-full bg-[#21DBA4] animate-pulse"></div>
                     <span className="text-xs font-medium text-[#21DBA4]">
                        {language === 'KR' ? '아카이브됨' : 'Archived'}
                     </span>
                  </div>
                  <button
                     onClick={() => setIsDeleteDialogOpen(true)}
                     className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border border-[#E0E0E0] dark:border-gray-700 flex items-center justify-center text-[#959595] hover:border-red-300 hover:text-red-500 dark:hover:border-red-900/50 dark:hover:text-red-400 transition-colors"
                     title={language === 'KR' ? '클립 삭제' : 'Delete clip'}
                  >
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>

         {/* Spacer for fixed header */}
         <div className="h-16 md:h-20"></div>

         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-[1000px] mx-auto px-4 md:px-6 pb-20 overflow-hidden"
         >

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-8">
               {/* Source Specific Layout */}
               <div className="flex-1 min-w-0">
                  {renderSourceContent()}
               </div>

               {/* Linkbrain Sidebar (AI Analysis & Notes) - Sticky */}
               <div className="w-full lg:w-[320px] flex-shrink-0 h-fit sticky top-8 flex flex-col gap-6 overflow-hidden">

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
                        <div className="flex flex-col gap-2">
                           <span className="text-xs text-[#959595] font-medium uppercase tracking-wider">
                              {language === 'KR' ? '카테고리' : 'Category'}
                           </span>
                           {(() => {
                              const color = currentCategoryColor as any;
                              const bgClass = typeof color === 'object' && color?.bg ? color.bg : 'bg-gray-100 dark:bg-gray-800';
                              const textClass = typeof color === 'object' && color?.text ? color.text : 'text-gray-700 dark:text-gray-300';
                              return (
                                 <button
                                    onClick={() => setIsCategoryDialogOpen(true)}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium w-fit ${bgClass} ${textClass} hover:ring-2 hover:ring-[#21DBA4] hover:ring-offset-1 transition-all cursor-pointer`}
                                 >
                                    {currentCategory}
                                 </button>
                              );
                           })()}
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
                           <a href={clip.url.startsWith('http') ? clip.url : `https://${clip.url}`} target="_blank" rel="noreferrer" className="text-[#21dba4] text-sm hover:underline" style={{ wordBreak: 'break-all' }}>
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

            {/* Category Change Dialog */}
            <CategoryChangeDialog
               isOpen={isCategoryDialogOpen}
               onClose={() => setIsCategoryDialogOpen(false)}
               clipId={clip.id}
               currentCategory={currentCategory}
               language={language}
               onCategoryChange={handleCategoryChange}
            />
         </motion.div>
      </>
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



const WebLayout = ({ clip, isLiked, setIsLiked, isSaved, setIsSaved }: any) => {
   // Get images excluding hero image
   const heroImage = clip.image || clip.images?.[0] || '/fallback-thumbnails/fallback-1.png';
   const additionalImages = clip.images && clip.images.length > 1
      ? clip.images.slice(1)
      : [];

   return (
      <div className="space-y-6">
         {/* Main Article Card */}
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
                  <div className="w-full aspect-[21/9] bg-[#f0f0f0] dark:bg-[#252525] rounded-xl mb-8 flex items-center justify-center overflow-hidden">
                     <img src={heroImage} alt={clip.title} className="w-full h-full object-cover" />
                  </div>
               </div>

               {/* TEXT CONTENT SECTION */}
               {clip.htmlContent ? (
                  <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden mb-8">
                     <iframe
                        srcDoc={clip.htmlContent}
                        title="Archived Content"
                        className="w-full h-full"
                        sandbox="allow-scripts allow-same-origin"
                     />
                  </div>
               ) : clip.contentMarkdown ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                     <div
                        className="text-lg text-[#3d3d3d] dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
                        style={{ wordBreak: 'break-word' }}
                     >
                        {clip.contentMarkdown}
                     </div>
                  </div>
               ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                     <p className="text-lg text-[#5a5a5a] dark:text-gray-300 leading-relaxed mb-6 font-medium">
                        {clip.summary}
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* ADDITIONAL IMAGE GALLERY SECTION */}
         {additionalImages.length > 0 && (
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
                     추가 이미지 ({additionalImages.length})
                  </h3>
               </div>

               <div className={`gap-3 ${additionalImages.length === 1 ? 'block' :
                  additionalImages.length === 2 ? 'grid grid-cols-2' :
                     'grid grid-cols-2 md:grid-cols-3'
                  }`}>
                  {additionalImages.map((imgUrl: string, idx: number) => (
                     <div
                        key={idx}
                        className="rounded-xl overflow-hidden bg-[#f0f0f0] dark:bg-[#252525]"
                     >
                        <img
                           src={imgUrl}
                           alt={`Additional image ${idx + 1}`}
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

export default ClipDetail;
