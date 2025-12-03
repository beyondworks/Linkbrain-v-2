import React, { useState } from 'react';
import svgPaths from "../imports/svg-7yby5ysznz";
import { motion } from "motion/react";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

const Hero = ({ language }: { language: 'KR' | 'EN' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
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
      // In a real app, redirect to login
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(language === 'KR' ? "링크를 분석하여 클립을 생성중입니다" : "Analyzing link and creating clip...");

    try {
      // 1. Try calling Analysis API (works in Vercel/Production)
      let data;
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputValue, language })
        });

        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('API failed');
        }
      } catch (apiError) {
        console.warn("API endpoint failed, falling back to client-side analysis:", apiError);

        // Fallback: Client-side analysis for local dev
        // Note: This exposes the API key in the browser, which is not recommended for production but acceptable for local prototypes.
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) throw new Error("No OpenAI API Key found for fallback.");

        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an advanced content analyzer for a "Second Brain" application called Linkbrain. 
          Your goal is to extract structured data optimized for one of 4 templates: youtube | instagram | threads | web.
          
          Return a JSON object with these fields:
          - title: Clean, descriptive title in ${language === 'KR' ? 'Korean' : 'English'}.
          - summary: Concise summary (<=3 sentences) in ${language === 'KR' ? 'Korean' : 'English'}.
          - keywords: Array of 5 relevant keywords.
          - category: One of AI, Design, Marketing, Business, IT, Coding, Shopping, News, Other.
          - sentiment: 'positive' | 'neutral' | 'negative'.
          - type: 'article' | 'video' | 'image' | 'social_post' | 'website'.
          - author: Author/channel name.
          - template: Pick the best template among youtube | instagram | threads | web based on URL + content.
          - profile: { name, handle, avatar, verified, subscribers, followers }
          - media: {
              coverImage: string | null,
              images: string[],
              videoId: string | null,
              videoUrl: string | null,
              thumbnail: string | null,
              embedUrl: string | null
            }
          - mentions: array of { label, url } for key links mentioned (include the source URL as first item).
          - comments: array of up to 3 items { author, text, likes, postedAt } synthesized from context.
          - engagement: { likes, views, comments }
          
          Platform guidance:
          - youtube: prefer videoId/embedUrl/thumbnail, channel profile, views/likes.
          - instagram: carousel images, optional videoUrl, author handle + verified flag.
          - threads: text-first social_post, handle, likes/comments counts.
          - web: hero image, article author, keep links in mentions.
          
          IMPORTANT: If the URL is an image or if an image is provided, analyze it to determine the topic, category, and sentiment.
          
          Analyze the URL: ${inputValue}`
            },
          ],
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content received from OpenAI");
        const aiData = JSON.parse(content);

        const detectedPlatform = (() => {
          const lower = inputValue.toLowerCase();
          if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
          if (lower.includes('instagram.com')) return 'instagram';
          if (lower.includes('threads.net')) return 'threads';
          return 'web';
        })();

        // Normalize platform/template
        const aiTemplate = aiData.template && ['youtube', 'instagram', 'threads', 'web'].includes(aiData.template)
          ? aiData.template
          : detectedPlatform;

        const template = detectedPlatform !== 'web' ? detectedPlatform : aiTemplate;

        // Construct media items
        const mediaItems: any[] = [];
        if (aiData.media?.coverImage) mediaItems.push(aiData.media.coverImage);
        if (aiData.media?.images) mediaItems.push(...aiData.media.images);
        if (aiData.media?.videoId || aiData.media?.videoUrl) {
          mediaItems.push({
            type: 'video',
            videoId: aiData.media.videoId,
            url: aiData.media.videoUrl,
            embedUrl: aiData.media.embedUrl,
            thumbnail: aiData.media.thumbnail
          });
        }

        data = {
          url: inputValue,
          platform: template,
          template: template,
          title: aiData.title || inputValue || "Untitled",
          summary: aiData.summary || "No summary available.",
          keywords: aiData.keywords || [],
          category: aiData.category || 'Other',
          sentiment: aiData.sentiment || 'neutral',
          type: aiData.type || 'website',
          image: aiData.media?.coverImage || '',
          author: aiData.author || '',
          authorProfile: aiData.profile || {},
          mediaItems: mediaItems,
          engagement: aiData.engagement || {},
          mentions: aiData.mentions || [],
          comments: aiData.comments || [],
          publishDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
      }

      // 2. Save to Firestore
      if (user?.uid) {
        await addDoc(collection(db, 'clips'), {
          ...data,
          userId: user.uid,
          createdAt: serverTimestamp(),
          isArchived: false,
          isFavorite: false
        });
      } else {
        throw new Error("User not logged in");
      }

      setInputValue("");
      toast.success(language === 'KR' ? "클립이 생성되었습니다" : "Clip created successfully", {
        id: toastId,
      });

    } catch (error) {
      console.error("Error saving clip:", error);
      toast.error(language === 'KR' ? "오류가 발생했습니다." : "An error occurred.", {
        id: toastId,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center relative overflow-hidden">

      {/* Main Headings */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-4xl md:text-[64px] font-extrabold text-[#21DBA4] mb-8 leading-tight"
      >
        Collect. Connect. Create.
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-base md:text-[24px] text-[#3d3d3d] max-w-2xl leading-snug mb-16"
      >
        <p>{language === 'KR' ? "스크랩을 더 쉽게 - 정리는 더 똑똑하게" : "Your internet brain, reimaged."}</p>
        <p>{language === 'KR' ? "링크 하나면 충분해요 나머진 우리가 할게요" : "Save links with full context and let AI do the heavy lifting."}</p>
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
            : { opacity: 1, scale: 1, boxShadow: "1px 1px 10px 0px rgba(0,0,0,0.1)" }
        }
        transition={
          isProcessing
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5, delay: 0.4, ease: "easeOut" }
        }
        className="w-full max-w-[800px] relative rounded-full"
      >
        <div className="relative w-full h-[60px] md:h-[76px] bg-white dark:bg-[#1e1e1e] rounded-full flex items-center px-4 md:px-8 overflow-visible shadow-sm border border-gray-100 dark:border-gray-800">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={language === 'KR' ? "URL을 여기에 붙여넣으세요..." : "Paste any URL here..."}
            className="w-full h-full bg-transparent border-none outline-none text-lg md:text-xl text-[#3d3d3d] dark:text-white placeholder-[#c5c5c5]"
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
                animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
                transition={isProcessing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <svg className="w-full h-full text-[#21DBA4] group-hover:text-[#1ec795] transition-colors" viewBox="0 0 80 80" fill="none">
                  <g filter="url(#filter0_d_button)">
                    <rect x="5" y="5" width="70" height="70" rx="35" fill="currentColor" />
                    {/* Paper Plane Icon */}
                    <path d="M49.9601 22.8786C52.4415 21.5821 55.3402 23.7871 54.9674 26.8814V26.8815L52.0259 51.2934C52.0256 51.2958 52.0253 51.2982 52.025 51.3006C51.9539 51.8753 51.7667 52.4246 51.4778 52.9083C51.1891 53.3919 50.8061 53.7975 50.3577 54.0962C49.9093 54.3948 49.4065 54.5793 48.8861 54.6367C48.3665 54.694 47.8417 54.6234 47.3496 54.4297L39.8496 51.4843L37.4819 55.8291C37.4391 55.9076 37.3915 55.9828 37.3393 56.054C35.2841 58.8589 31.073 57.3325 31.073 53.6285V49.0367C31.073 47.9006 31.3968 46.8008 31.9885 45.8864C32.071 45.7324 32.1708 45.5939 32.2841 45.4731C32.317 45.4313 32.3506 45.3901 32.3848 45.3494L38.4636 38.1082C39.1377 37.3052 40.2733 37.2581 41 38.0029C41.7268 38.7477 41.7695 40.0024 41.0954 40.8054L36.7019 46.0389L39.5861 47.1716C39.6418 47.1901 39.697 47.2118 39.7516 47.2366L48.4804 50.6645L51.3898 26.519L23.7423 41.0081L27.3639 42.4227L29.4527 43.2279C30.3886 43.5887 30.8826 44.7195 30.5561 45.7536C30.2295 46.7877 29.2061 47.3336 28.2702 46.9728L26.1814 46.1675C26.1791 46.1666 26.1768 46.1657 26.1745 46.1648L22.3425 44.6682V44.6681C19.3936 43.5168 19.1708 39.014 22.0051 37.5288L49.9582 22.8796L49.9601 22.8786ZM34.6625 53.3139L36.3982 50.1289L34.6625 49.4473V53.3139Z" fill="white" />
                  </g>
                  <defs>
                    <filter id="filter0_d_button" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
    </div>
  );
};

export default Hero;
