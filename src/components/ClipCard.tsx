import React, { useState } from 'react';
import svgPaths from "../imports/svg-7yby5ysznz";
import { Instagram, Youtube, Globe, Link as LinkIcon, AtSign } from 'lucide-react';
import SelectCollectionDialog from './SelectCollectionDialog';

interface ClipCardProps {
   category: string;
   categoryColor: { bg: string, text: string };
   collection?: string;
   title: string;
   summary: string;
   url: string;
   date: string;
   thumbnailText?: string;
   keywords?: string[];
   variant?: 'grid' | 'list';
   source?: 'instagram' | 'youtube' | 'threads' | 'web' | string;
   onClick?: () => void;
   onSelectCollection?: (collectionName: string) => void;
   onCreateCollection?: (data: { name: string; color: string }) => void;
   collections?: { id: string; name: string; color: string }[];
   language?: 'KR' | 'EN';
}

const ClipCard = ({
   category,
   categoryColor,
   collection,
   title,
   summary,
   url,
   date,
   thumbnailText = "THUMBNAIL",
   keywords = [],
   variant = 'grid',
   source = 'web',
   onClick,
   onSelectCollection,
   onCreateCollection,
   collections = [],
   language = 'KR'
}: ClipCardProps) => {
   const isList = variant === 'list';
   const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

   const handleAddToCollection = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsCollectionDialogOpen(true);
   };

   const handleCardClick = () => {
      // Don't navigate if dialog is open
      if (isCollectionDialogOpen) return;
      if (onClick) onClick();
   };

   const getSourceIcon = (src: string) => {
      switch (src.toLowerCase()) {
         case 'instagram':
            return <Instagram className="w-3 h-3" />;
         case 'youtube':
            return <Youtube className="w-3 h-3" />;
         case 'threads':
            return <AtSign className="w-3 h-3" />;
         default:
            return <Globe className="w-3 h-3" />;
      }
   };

   const getSourceLabel = (src: string) => {
      return src.charAt(0).toUpperCase() + src.slice(1);
   };

   if (isList) {
      return (
         <>
            <div
               onClick={handleCardClick}
               className="w-full bg-white rounded-[24px] overflow-hidden border border-[#b5b5b5]/30 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row group relative cursor-pointer"
            >
               {/* Thumbnail Section */}
               <div className="relative w-full md:w-[320px] aspect-[380/214] md:aspect-auto bg-[#d9d9d9] flex-shrink-0 flex items-center justify-center group-hover:bg-[#d0d0d0] transition-colors">
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                     <div className={`px-2 py-[2px] rounded-[6px] ${categoryColor.bg}`}>
                        <span className={`${categoryColor.text} font-medium text-[10px] md:text-xs`}>{category}</span>
                     </div>
                     <div className="px-2 py-[2px] rounded-[6px] bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center gap-1">
                        {getSourceIcon(source)}
                        <span className="text-[#5a5a5a] font-medium text-[10px] md:text-xs">{getSourceLabel(source)}</span>
                     </div>
                  </div>
                  <span className="text-[#959595] text-xl font-medium opacity-50 tracking-widest">{thumbnailText}</span>
               </div>

               {/* Content Section */}
               <div className="p-5 flex flex-col flex-grow gap-2 md:gap-3 min-w-0 relative">
                  <div className="flex items-center gap-1.5 text-[#959595] text-[11px]">
                     <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d={svgPaths.p3c99fc00} />
                     </svg>
                     <span className="truncate">{url}</span>
                  </div>

                  <h3 className="text-[#3d3d3d] text-lg font-medium truncate group-hover:text-[#21dba4] transition-colors">{title}</h3>

                  <p className="text-[#959595] text-xs leading-relaxed line-clamp-2 md:line-clamp-3 break-words min-h-[2.5rem] md:min-h-[3.75rem]">
                     {summary}
                  </p>

                  <div className="mt-auto flex flex-col md:flex-row md:items-end justify-between gap-3 pt-2">
                     <div className="flex flex-col gap-2 w-full">
                        {keywords.length > 0 && (
                           <div className="flex gap-1.5 overflow-hidden h-[28px]">
                              {keywords.slice(0, 3).map((kw, i) => (
                                 <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#959595] border-opacity-50 flex-shrink-0">
                                    <span className="text-[#959595] text-[10px] whitespace-nowrap">{kw}</span>
                                 </div>
                              ))}
                              {keywords.length > 3 && (
                                 <span className="text-[#959595] text-[10px] flex items-center flex-shrink-0">+{keywords.length - 3}</span>
                              )}
                           </div>
                        )}

                        <div className="flex items-center justify-between w-full pt-1">
                           <div className="flex items-center gap-1.5 text-[#959595] text-[10px] whitespace-nowrap">
                              <svg className="w-3 h-3" viewBox="0 0 15 15" fill="none">
                                 <path d={svgPaths.p114c4500} fill="currentColor" />
                                 <path clipRule="evenodd" d={svgPaths.p3eb64280} fill="currentColor" fillRule="evenodd" />
                              </svg>
                              <span>{date}</span>
                           </div>

                           {collection && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-gray-100 text-[#959595] text-[10px]">
                                 <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                 </svg>
                                 <span className="font-medium">{collection}</span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {onSelectCollection && onCreateCollection && (
               <SelectCollectionDialog
                  isOpen={isCollectionDialogOpen}
                  onClose={() => setIsCollectionDialogOpen(false)}
                  onSelect={onSelectCollection}
                  onCreate={onCreateCollection}
                  collections={collections}
                  language={language}
               />
            )}
         </>
      );
   }

   return (
      <>
         <div
            onClick={handleCardClick}
            className="w-full bg-white rounded-[24px] overflow-hidden border border-[#b5b5b5]/30 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative cursor-pointer"
         >
            <div className="relative w-full aspect-[380/214] bg-[#d9d9d9] flex items-center justify-center">
               <div className="absolute top-4 left-4 flex gap-2 z-10">
                  <div className={`px-2 py-[2px] rounded-[6px] ${categoryColor.bg}`}>
                     <span className={`${categoryColor.text} font-medium text-[10px] md:text-xs`}>{category}</span>
                  </div>
                  <div className="px-2 py-[2px] rounded-[6px] bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center gap-1">
                     {getSourceIcon(source)}
                     <span className="text-[#5a5a5a] font-medium text-[10px] md:text-xs">{getSourceLabel(source)}</span>
                  </div>
               </div>
               <span className="text-[#959595] text-xl md:text-[32px] font-medium opacity-50 tracking-widest">{thumbnailText}</span>
            </div>

            <div className="p-5 flex flex-col flex-grow gap-3">
               <div className="flex items-center gap-1.5 text-[#959595] text-[11px]">
                  <svg className="w-3 h-3" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                     <path d={svgPaths.p3c99fc00} />
                  </svg>
                  <span className="truncate">{url}</span>
               </div>

               <h3 className="text-[#3d3d3d] text-lg font-medium truncate group-hover:text-[#21dba4] transition-colors">{title}</h3>

               <p className="text-[#959595] text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {summary}
               </p>

               {keywords.length > 0 && (
                  <div className="flex gap-1.5 mt-1 overflow-hidden h-[28px]">
                     {keywords.slice(0, 4).map((kw, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#959595] border-opacity-50 flex-shrink-0">
                           <span className="text-[#959595] text-[10px] md:text-[11px] whitespace-nowrap">{kw}</span>
                           <svg className="w-2 h-2 text-[#959595]" viewBox="0 0 10 10" fill="none">
                              <path d={svgPaths.p1dcfb600} fill="currentColor" />
                              <path d={svgPaths.p3d3cf9f0} fill="currentColor" />
                           </svg>
                        </div>
                     ))}
                     {keywords.length > 4 && (
                        <span className="text-[#959595] text-[10px] md:text-[11px] flex items-center flex-shrink-0">+{keywords.length - 4}</span>
                     )}
                  </div>
               )}

               <div className="mt-auto pt-3 flex items-center justify-between text-[#959595] text-[10px] border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                     <svg className="w-3 h-3" viewBox="0 0 15 15" fill="none">
                        <path d={svgPaths.p114c4500} fill="currentColor" />
                        <path clipRule="evenodd" d={svgPaths.p3eb64280} fill="currentColor" fillRule="evenodd" />
                     </svg>
                     <span>{date}</span>
                  </div>

                  {collection && collection !== 'Unsorted' ? (
                     <div className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-gray-100 text-[#959595] text-[10px]">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="font-medium">{collection}</span>
                     </div>
                  ) : (
                     <button
                        onClick={handleAddToCollection}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] border border-dashed border-[#959595] text-[#959595] hover:text-[#21dba4] hover:border-[#21dba4] transition-colors text-[10px] group/btn"
                     >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span className="font-medium">{language === 'KR' ? '컬렉션에 추가' : 'Add to Collection'}</span>
                     </button>
                  )}
               </div>
            </div>
         </div>

         {onSelectCollection && onCreateCollection && (
            <SelectCollectionDialog
               isOpen={isCollectionDialogOpen}
               onClose={() => setIsCollectionDialogOpen(false)}
               onSelect={onSelectCollection}
               onCreate={onCreateCollection}
               collections={collections}
               language={language}
            />
         )}
      </>
   );
};

export default ClipCard;
