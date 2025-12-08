import React from 'react';
import svgPaths from "../imports/svg-necy6hi9g3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"; // Reusing sidebar icons

interface CollectionCardProps {
  name: string;
  count: number;
  color?: string;
  updatedAt: string;
  onDelete?: () => void;
  onEdit?: () => void;
  language?: 'KR' | 'EN';
}

const CollectionCard = ({ name, count, color = "bg-[#21DBA4]", updatedAt, onDelete, onEdit, language = 'KR' }: CollectionCardProps) => {
  return (
    <div className="w-full bg-white dark:bg-[#1e1e1e] rounded-[24px] p-6 border border-[#E0E0E0] dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[180px]">

      {/* Top Section: Icon & Options */}
      <div className="flex items-start justify-between">
        <div className={`w-[48px] h-[48px] rounded-[14px] ${color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
          <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
            <path d={svgPaths.p18756800} fill="currentColor" />
          </svg>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-[#959595] hover:text-[#21DBA4] transition-colors focus:outline-none flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="19" cy="12" r="2" fill="currentColor" />
                <circle cx="5" cy="12" r="2" fill="currentColor" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1 z-50">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2 outline-none transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                {language === 'KR' ? '컬렉션 수정' : 'Edit Collection'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-red-50 text-sm text-red-500 px-3 py-2 outline-none transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                {language === 'KR' ? '컬렉션 삭제' : 'Delete Collection'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Middle: Info */}
      <div className="flex flex-col gap-1 mt-2">
        <h3 className="text-[#3d3d3d] dark:text-white text-[20px] font-semibold group-hover:text-[#21DBA4] transition-colors truncate">
          {name}
        </h3>
        <p className="text-[#959595] text-[14px] font-medium">
          {count} {language === 'KR' ? '개의 클립' : 'clips'}
        </p>
      </div>

      {/* Bottom: Footer */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <span className="text-[#959595] text-[12px]">{language === 'KR' ? '마지막 업데이트' : 'Last updated'} {updatedAt}</span>
      </div>
    </div>
  );
};

export default CollectionCard;
