import React, { useState } from 'react';
import svgPaths from "../imports/svg-7yby5ysznz";
import { motion } from "motion/react";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import InsightBanner from './InsightBanner';

interface HeroProps {
  language: 'KR' | 'EN';
  onViewInsight?: () => void;
}

const Hero = ({ language, onViewInsight }: HeroProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async () => {
    if (isProcessing || !inputValue.trim()) return;

    if (!user) {
      toast.error(language === 'KR' ? "로그인이 필요합니다." : "Please login first.");
      return;
    }

    const urlToAnalyze = inputValue;
    setIsProcessing(true);
    const toastId = toast.loading(language === 'KR' ? "링크를 분석하여 클립을 생성중입니다" : "Analyzing link and creating clip...");

    // Start fade-out animation after 1.5 seconds, then clear after 2 seconds
    setTimeout(() => {
      setIsFading(true);
    }, 1500);

    setTimeout(() => {
      setInputValue("");
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

      await response.json();

      toast.success(language === 'KR' ? "클립이 생성되었습니다" : "Clip created successfully", {
        id: toastId,
      });

    } catch (error) {
      console.error("Error saving clip:", error);
      toast.error(language === 'KR' ? "오류가 발생했습니다." : "An error occurred.", {
        id: toastId,
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pt-32 md:pt-40 pb-20 px-6 text-center relative overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="font-extrabold text-[#21DBA4] mb-6 leading-[1.1] tracking-tight text-center flex flex-col items-center"
        style={{ fontSize: 'clamp(42px, 8vw, 72px)' }}
      >
        <div>Collect links</div>
        <div>Create a second brain</div>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-[#3d3d3d] dark:text-gray-300 max-w-4xl leading-relaxed text-center flex flex-col items-center"
        style={{ marginBottom: '48px', fontSize: '16px', fontWeight: 400 }}
      >
        {language === 'KR' ? (
          <>
            <div className="mb-1">링크가 쌓일수록 - 지식이 쌓이는 곳</div>
            <div>
              링크 하나면 충분해요 <span className="text-[#21DBA4] font-medium">정리·분석·요약</span>은 <span className="text-[#21DBA4] font-bold">링크브레인</span>이 할게요
            </div>
          </>
        ) : (
          <>
            <div className="mb-1">Where links become knowledge</div>
            <div>Just save the link,</div>
            <div>Linkbrain will handle organizing, analyzing, and summarizing.</div>
          </>
        )}
      </motion.div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          isProcessing
            ? {
              opacity: 1,
              scale: 1,
              boxShadow: [
                "1px 1px 10px 0px rgba(0,0,0,0.1)",
                "0px 0px 20px 2px rgba(33,219,164,0.4)",
                "1px 1px 10px 0px rgba(0,0,0,0.1)"
              ]
            }
            : { opacity: 1, scale: 1, boxShadow: "0px 10px 40px -10px rgba(0,0,0,0.08)" }
        }
        transition={
          isProcessing
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5, delay: 0.4, ease: "easeOut" }
        }
        className="w-full max-w-[800px] relative rounded-[40px] z-10 mx-6 select-none"
      >
        <div className="relative w-full h-[80px] bg-white dark:bg-[#1e1e1e] rounded-[40px] flex items-center px-6 overflow-visible border border-transparent dark:border-gray-800">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={language === 'KR' ? "URL을 여기에 붙여넣으세요" : "Paste any URL here"}
            className="w-full h-full bg-transparent border-none outline-none text-[17px] text-[#3d3d3d] dark:text-white placeholder-[#c5c5c5] transition-opacity duration-500 pr-16"
            style={{ opacity: isFading ? 0 : 1 }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isProcessing}
          />
          <motion.button
            onClick={handleSearch}
            whileHover={!isProcessing ? { scale: 1.05 } : {}}
            whileTap={!isProcessing ? { scale: 0.95 } : {}}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-[64px] h-[64px] flex items-center justify-center bg-[#21DBA4] rounded-full shadow-md"
            disabled={isProcessing}
          >
            <div className="relative w-full h-full group cursor-pointer flex items-center justify-center">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={isProcessing ? { rotate: 720 } : { rotate: 0 }}
                transition={isProcessing ? { duration: 2, ease: "linear" } : { duration: 0 }}
              >
                <svg className="w-[32px] h-[32px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </motion.div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Insight Banner positioned directly below input */}
      <div className="w-full max-w-[800px] mt-12 relative z-0">
        <InsightBanner language={language} onViewDetails={onViewInsight} />
      </div>
    </div>
  );
};

export default Hero;
