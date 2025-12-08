import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Mail, MessageSquare, Star, Zap } from 'lucide-react';
import { Switch } from "./ui/switch";
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface NotificationsPageProps {
  onBack: () => void;
  language?: 'KR' | 'EN';
  user?: any;
}

const NotificationsPage = ({ onBack, language = 'KR', user }: NotificationsPageProps) => {
  const [settings, setSettings] = useState({
    marketing: false,
    security: true,
    comments: true,
    mentions: true,
    updates: true,
    newsletter: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = [
    {
      title: language === 'KR' ? "이메일 알림" : "Email Notifications",
      items: [
        {
          key: 'security',
          icon: Shield,
          label: language === 'KR' ? "보안 알림" : "Security Alerts",
          desc: language === 'KR' ? "중요한 보안 알림을 받습니다." : "Get notified about important security alerts."
        },
        {
          key: 'marketing',
          icon: Zap,
          label: language === 'KR' ? "마케팅 이메일" : "Marketing Emails",
          desc: language === 'KR' ? "새로운 제품, 기능 등에 대한 이메일을 받습니다." : "Receive emails about new products, features, and more."
        },
        {
          key: 'newsletter',
          icon: Mail,
          label: language === 'KR' ? "주간 뉴스레터" : "Weekly Newsletter",
          desc: language === 'KR' ? "인기 링크와 컬렉션 요약을 받습니다." : "Get a summary of top links and collections."
        },
      ]
    },
    {
      title: language === 'KR' ? "활동" : "Activity",
      items: [
        {
          key: 'comments',
          icon: MessageSquare,
          label: language === 'KR' ? "댓글" : "Comments",
          desc: language === 'KR' ? "내 클립에 댓글이 달리면 알림을 받습니다." : "Notify me when someone comments on my clips."
        },
        {
          key: 'mentions',
          icon: Star,
          label: language === 'KR' ? "멘션" : "Mentions",
          desc: language === 'KR' ? "컬렉션에서 내가 언급되면 알림을 받습니다." : "Notify me when I'm mentioned in a collection."
        },
        {
          key: 'updates',
          icon: Bell,
          label: language === 'KR' ? "제품 업데이트" : "Product Updates",
          desc: language === 'KR' ? "Linkbrain의 새로운 기능 출시 알림을 받습니다." : "Get notified when Linkbrain releases new features."
        },
      ]
    }
  ];

  // Import Shield locally to avoid icon conflict or missing import above
  function Shield(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    )
  }

  return (
    <div className="w-full px-6 md:px-10 pb-20 max-w-3xl mx-auto pt-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border border-[#E0E0E0] dark:border-gray-700 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:border-[#21DBA4] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-[#3d3d3d] dark:text-white text-[28px] font-bold">
            {language === 'KR' ? "알림 설정" : "Notifications"}
          </h2>
          <p className="text-[#959595]">
            {language === 'KR' ? "알림을 받을 항목을 선택하세요" : "Choose what you want to be notified about"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e1e1e] rounded-[32px] shadow-sm border border-[#E0E0E0] dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-4 border-b border-[#F5F5F5] dark:border-gray-800 bg-[#FAFAFA] dark:bg-[#252525]">
              <h3 className="text-sm font-semibold text-[#959595] uppercase tracking-wider">{group.title}</h3>
            </div>
            <div className="divide-y divide-[#F5F5F5] dark:divide-gray-800">
              {group.items.map((item) => (
                <div key={item.key} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                  <div className="flex items-start gap-4 pr-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#3d3d3d] dark:text-white flex-shrink-0 mt-1">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[#3d3d3d] dark:text-white font-bold text-lg">{item.label}</h4>
                      <p className="text-[#959595] text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof typeof settings]}
                    onCheckedChange={() => toggleSetting(item.key as keyof typeof settings)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
