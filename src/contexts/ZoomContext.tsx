"use client";

import * as React from "react";

interface ZoomContextType {
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    portalContainer: HTMLElement | null;
}

const ZoomContext = React.createContext<ZoomContextType | undefined>(undefined);

export function useZoom() {
    const context = React.useContext(ZoomContext);
    if (!context) {
        throw new Error("useZoom must be used within a ZoomProvider");
    }
    return context;
}

// Safe version that doesn't throw - for Portal components that may be outside provider
export function useZoomSafe() {
    return React.useContext(ZoomContext);
}

interface ZoomProviderProps {
    children: React.ReactNode;
    defaultZoom?: number;
}

export function ZoomProvider({ children, defaultZoom = 100 }: ZoomProviderProps) {
    const [zoomLevel, setZoomLevelState] = React.useState(() => {
        if (typeof window === "undefined") return defaultZoom;
        const saved = localStorage.getItem("zoomLevel");
        return saved !== null ? parseInt(saved, 10) : defaultZoom;
    });

    const containerRef = React.useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        if (containerRef.current) {
            setPortalContainer(containerRef.current);
        }
    }, []);

    const setZoomLevel = React.useCallback((level: number) => {
        const clamped = Math.min(Math.max(level, 70), 130);
        setZoomLevelState(clamped);
        localStorage.setItem("zoomLevel", String(clamped));
    }, []);

    const handleZoomIn = React.useCallback(() => {
        setZoomLevel(zoomLevel + 10);
    }, [zoomLevel, setZoomLevel]);

    const handleZoomOut = React.useCallback(() => {
        setZoomLevel(zoomLevel - 10);
    }, [zoomLevel, setZoomLevel]);

    const value = React.useMemo(
        () => ({
            zoomLevel,
            setZoomLevel,
            handleZoomIn,
            handleZoomOut,
            portalContainer,
        }),
        [zoomLevel, setZoomLevel, handleZoomIn, handleZoomOut, portalContainer]
    );

    return (
        <ZoomContext.Provider value={value}>
            <div
                ref={containerRef}
                id="zoom-container"
                style={{
                    zoom: zoomLevel / 100,
                    width: "100%",
                    minHeight: "100vh",
                    position: "relative",
                }}
            >
                {children}
            </div>
        </ZoomContext.Provider>
    );
}

export { ZoomContext };
