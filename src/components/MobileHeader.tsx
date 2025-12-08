import React, { useState } from 'react';
import { Menu, Search, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet";
import MobileSidebar from './MobileSidebar';
import svgPathsOpen from "../imports/svg-necy6hi9g3";

interface MobileHeaderProps {
   onCategorySelect?: (category: string | null) => void;
   onNavigate?: (view: 'clips' | 'collections') => void;
   onCreateCollection?: () => void;
   onCollectionSelect?: (collection: any) => void;
   onSourceSelect?: (source: string | null) => void;
   onSearch?: (query: string) => void;
   onLogout?: () => void;
   onSettingsClick?: () => void;
   onProfileClick?: () => void;
   currentView: string;
   language?: 'KR' | 'EN';
   menuState?: {
      isMyClipOpen: boolean;
      isSourceOpen: boolean;
      isCollectionsOpen: boolean;
   };
   onMenuToggle?: (key: 'isMyClipOpen' | 'isSourceOpen' | 'isCollectionsOpen') => void;
   user?: any;
}

const MobileHeader = (props: MobileHeaderProps) => {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <div className="sticky top-0 z-30 w-full bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.9)] backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 h-[90px] flex items-center justify-between md:hidden transition-colors duration-300">

         <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
               <SheetTrigger asChild>
                  <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition-colors text-[#3d3d3d] dark:text-white">
                     <Menu className="w-6 h-6" />
                  </button>
               </SheetTrigger>
               <SheetContent side="left" className="w-[300px] p-0 border-r border-gray-200 dark:border-gray-800">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigation Menu</SheetDescription>
                  <MobileSidebar
                     {...props}
                     onClose={() => setIsOpen(false)}
                  />
               </SheetContent>
            </Sheet>

            <span
               className="text-[#21dba4] text-xl font-bold tracking-tight cursor-pointer"
               onClick={() => props.onNavigate && props.onNavigate('clips')}
            >
               Linkbrain
            </span>
         </div>

         <div className="flex items-center gap-2">
            {/* Search Button Removed */}
            <button
               onClick={props.onProfileClick}
               className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center ml-1"
            >
               {props.user?.photoURL ? (
                  <img src={props.user.photoURL} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full bg-[#959595] flex items-center justify-center text-white">
                     <svg className="w-full h-full" viewBox="0 0 50 50" fill="none">
                        <circle cx="25" cy="25" r="25" fill="currentColor" />
                     </svg>
                  </div>
               )}
            </button>
         </div>
      </div>
   );
};

export default MobileHeader;
