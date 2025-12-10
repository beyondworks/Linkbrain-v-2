import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useZoom } from '../contexts/ZoomContext';

const ZoomControls: React.FC = () => {
    const { zoomLevel, handleZoomIn, handleZoomOut } = useZoom();

    return (
        <div className="flex items-center gap-1 bg-white dark:bg-[#1e1e1e] rounded-full shadow-md px-2 py-1.5">
            <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 70}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors disabled:opacity-30 disabled:hover:text-[#959595] disabled:hover:bg-transparent"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="text-[12px] font-medium text-[#3d3d3d] dark:text-gray-300 min-w-[40px] text-center">
                {zoomLevel}%
            </span>
            <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 130}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors disabled:opacity-30 disabled:hover:text-[#959595] disabled:hover:bg-transparent"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ZoomControls;
