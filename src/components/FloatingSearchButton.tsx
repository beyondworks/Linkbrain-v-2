import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import svgPathsOpen from "../imports/svg-necy6hi9g3";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

interface FloatingSearchButtonProps {
  currentView: string;
  language?: 'KR' | 'EN';
}

const FloatingSearchButton = ({ currentView, language = 'KR' }: FloatingSearchButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle scroll visibility logic
  useEffect(() => {
    const handleScroll = () => {
      // If we are in 'clips' view (where Hero exists), show button only after scrolling down
      if (currentView === 'clips') {
        if (window.scrollY > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        // In other views (without Hero search), always show the button
        setIsVisible(true);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Close search on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async () => {
    if (isProcessing || !searchQuery.trim()) return;

    if (!user) {
      toast.error(language === 'KR' ? "로그인이 필요합니다" : "Please login first", {
        description: language === 'KR'
          ? "서비스를 이용하려면 로그인해주세요"
          : "Sign in to use this feature",
      });
      return;
    }

    const urlToAnalyze = searchQuery;
    setIsProcessing(true);
    const toastId = toast.loading(language === 'KR' ? "링크를 분석하여 클립을 생성중입니다" : "Analyzing link and creating clip...");

    // Start fade-out animation after 1.5 seconds, then clear after 2 seconds
    setTimeout(() => {
      setIsFading(true);
    }, 1500);

    setTimeout(() => {
      setSearchQuery("");
      setIsProcessing(false);
      setIsFading(false);
    }, 2000);

    try {
      // Get Firebase auth token
      const token = await user.getIdToken();

      // Call Analysis API in background (doesn't block input reset)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: urlToAnalyze, language, userId: user.uid })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const data = await response.json();

      // Success feedback with title
      const successMessage = language === 'KR'
        ? "클립이 생성되었습니다"
        : "Clip created successfully";

      toast.success(successMessage, {
        id: toastId,
        description: language === 'KR'
          ? `"${data.title}"`
          : `"${data.title}"`,
        duration: 3000,
      });

    } catch (error) {
      console.error("Error saving clip:", error);
      toast.error(language === 'KR' ? "오류가 발생했습니다" : "An error occurred", {
        id: toastId,
        description: language === 'KR'
          ? "클립 저장에 실패했습니다. 다시 시도해주세요."
          : "Failed to save clip. Please try again.",
      });
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {isVisible && !isSearchOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            className="fixed bottom-8 right-8 z-40 w-16 h-16 flex items-center justify-center rounded-full bg-[#21DBA4] text-white shadow-lg shadow-black/20"
            style={{
              filter: 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.2))',
              WebkitFilter: 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.2))'
            }}
          >
            <svg
              className="w-full h-full p-0"
              viewBox="0 0 80 80"
              fill="none"
              style={{ display: 'block' }}
            >
              {/* Removed rect background since button has bg */}
              <path d="M49.9601 22.8786C52.4415 21.5821 55.3402 23.7871 54.9674 26.8814V26.8815L52.0259 51.2934C52.0256 51.2958 52.0253 51.2982 52.025 51.3006C51.9539 51.8753 51.7667 52.4246 51.4778 52.9083C51.1891 53.3919 50.8061 53.7975 50.3577 54.0962C49.9093 54.3948 49.4065 54.5793 48.8861 54.6367C48.3665 54.694 47.8417 54.6234 47.3496 54.4297L39.8496 51.4843L37.4819 55.8291C37.4391 55.9076 37.3915 55.9828 37.3393 56.054C35.2841 58.8589 31.073 57.3325 31.073 53.6285V49.0367C31.073 47.9006 31.3968 46.8008 31.9885 45.8864C32.071 45.7324 32.1708 45.5939 32.2841 45.4731C32.317 45.4313 32.3506 45.3901 32.3848 45.3494L38.4636 38.1082C39.1377 37.3052 40.2733 37.2581 41 38.0029C41.7268 38.7477 41.7695 40.0024 41.0954 40.8054L36.7019 46.0389L39.5861 47.1716C39.6418 47.1901 39.697 47.2118 39.7516 47.2366L48.4804 50.6645L51.3898 26.519L23.7423 41.0081L27.3639 42.4227L29.4527 43.2279C30.3886 43.5887 30.8826 44.7195 30.5561 45.7536C30.2295 46.7877 29.2061 47.3336 28.2702 46.9728L26.1814 46.1675C26.1791 46.1666 26.1768 46.1657 26.1745 46.1648L22.3425 44.6682V44.6681C19.3936 43.5168 19.1708 39.014 22.0051 37.5288L49.9582 22.8796L49.9601 22.8786ZM34.6625 53.3139L36.3982 50.1289L34.6625 49.4473V53.3139Z" fill="white" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isProcessing) setIsSearchOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={
                isProcessing
                  ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-[800px] relative"
            >
              {/* Hero Search Input Style */}
              <motion.div
                animate={
                  isProcessing
                    ? {
                      boxShadow: [
                        "1px 1px 10px 0px rgba(0,0,0,0.1)",
                        "0px 0px 20px 2px rgba(33,219,164,0.4)",
                        "1px 1px 10px 0px rgba(0,0,0,0.1)"
                      ]
                    }
                    : { boxShadow: "1px 1px 10px 0px rgba(0,0,0,0.1)" }
                }
                transition={
                  isProcessing
                    ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.5 }
                }
                className="w-full relative rounded-full"
              >
                <div className="relative w-full h-[60px] md:h-[76px] bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-full flex items-center px-4 md:px-8 overflow-visible">
                  <input
                    type="text"
                    autoFocus
                    placeholder={language === 'KR' ? "URL을 입력하세요..." : "Paste any URL here..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none text-lg md:text-xl text-[#3d3d3d] dark:text-white placeholder-[#c5c5c5] transition-opacity duration-500"
                    style={{ opacity: isFading ? 0 : 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isProcessing}
                  />
                  <motion.button
                    onClick={handleSearch}
                    whileHover={!isProcessing ? { scale: 1.05 } : {}}
                    whileTap={!isProcessing ? { scale: 0.95 } : {}}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-[42px] h-[42px] md:w-[54px] md:h-[54px] flex items-center justify-center"
                    disabled={isProcessing}
                  >
                    <div className="relative w-full h-full group cursor-pointer">
                      <motion.div
                        className="absolute inset-[-15%] flex items-center justify-center"
                        animate={isProcessing ? { rotate: 720 } : { rotate: 0 }}
                        transition={isProcessing ? { duration: 2, ease: "linear" } : { duration: 0 }}
                      >
                        <svg className="w-full h-full text-[#21DBA4] group-hover:text-[#1ec795] transition-colors" viewBox="0 0 80 80" fill="none">
                          <g filter="url(#filter0_d_button_floating)">
                            <rect x="5" y="5" width="70" height="70" rx="35" fill="currentColor" />
                            {/* Paper Plane Icon */}
                            <path d="M49.9601 22.8786C52.4415 21.5821 55.3402 23.7871 54.9674 26.8814V26.8815L52.0259 51.2934C52.0256 51.2958 52.0253 51.2982 52.025 51.3006C51.9539 51.8753 51.7667 52.4246 51.4778 52.9083C51.1891 53.3919 50.8061 53.7975 50.3577 54.0962C49.9093 54.3948 49.4065 54.5793 48.8861 54.6367C48.3665 54.694 47.8417 54.6234 47.3496 54.4297L39.8496 51.4843L37.4819 55.8291C37.4391 55.9076 37.3915 55.9828 37.3393 56.054C35.2841 58.8589 31.073 57.3325 31.073 53.6285V49.0367C31.073 47.9006 31.3968 46.8008 31.9885 45.8864C32.071 45.7324 32.1708 45.5939 32.2841 45.4731C32.317 45.4313 32.3506 45.3901 32.3848 45.3494L38.4636 38.1082C39.1377 37.3052 40.2733 37.2581 41 38.0029C41.7268 38.7477 41.7695 40.0024 41.0954 40.8054L36.7019 46.0389L39.5861 47.1716C39.6418 47.1901 39.697 47.2118 39.7516 47.2366L48.4804 50.6645L51.3898 26.519L23.7423 41.0081L27.3639 42.4227L29.4527 43.2279C30.3886 43.5887 30.8826 44.7195 30.5561 45.7536C30.2295 46.7877 29.2061 47.3336 28.2702 46.9728L26.1814 46.1675C26.1791 46.1666 26.1768 46.1657 26.1745 46.1648L22.3425 44.6682V44.6681C19.3936 43.5168 19.1708 39.014 22.0051 37.5288L49.9582 22.8796L49.9601 22.8786ZM34.6625 53.3139L36.3982 50.1289L34.6625 49.4473V53.3139Z" fill="white" />
                          </g>
                          <defs>
                            <filter id="filter0_d_button_floating" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                              <feFlood floodOpacity="0" result="BackgroundImageFix" />
                              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                              <feOffset />
                              <feGaussianBlur stdDeviation="2.5" />
                              <feComposite in2="hardAlpha" operator="out" />
                              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                            </filter>
                          </defs>
                        </svg>
                      </motion.div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* Close Button */}
            {!isProcessing && (
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/80 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingSearchButton;
