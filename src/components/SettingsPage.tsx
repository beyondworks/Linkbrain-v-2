import React, { useState } from 'react';
import { User, Bell, Moon, Shield, ChevronRight, LogOut, Globe, Image, ChevronLeft } from 'lucide-react';
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

interface SettingsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onBack?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: 'KR' | 'EN';
  toggleLanguage: () => void;
  showThumbnails: boolean;
  toggleThumbnails: () => void;
  user?: any;
}

const SettingsPage = ({ onLogout, onNavigate, onBack, isDarkMode, toggleDarkMode, language, toggleLanguage, showThumbnails, toggleThumbnails, user }: SettingsPageProps) => {
  const [emailNotifications, setEmailNotifications] = useState(true);

  const sections = [
    {
      title: language === 'KR' ? "계정" : "Account",
      items: [
        {
          icon: User,
          label: language === 'KR' ? "프로필 정보" : "Profile Information",
          type: "link",
          action: () => onNavigate('profile')
        },
        {
          icon: Shield,
          label: language === 'KR' ? "비밀번호 및 보안" : "Password & Security",
          type: "link",
          action: () => onNavigate('settings-security')
        },
      ]
    },
    {
      title: language === 'KR' ? "환경설정" : "Preferences",
      items: [
        {
          icon: Bell,
          label: language === 'KR' ? "알림 설정" : "Notifications",
          type: "link",
          action: () => onNavigate('settings-notifications')
        },
        {
          icon: Moon,
          label: language === 'KR' ? "다크 모드" : "Dark Mode",
          type: "toggle",
          value: isDarkMode,
          onChange: toggleDarkMode
        },
        {
          icon: Globe,
          label: language === 'KR' ? "언어 (한국어)" : "Language (English)",
          type: "toggle",
          value: language === 'KR',
          onChange: toggleLanguage
        },
        {
          icon: Image,
          label: language === 'KR' ? "썸네일 표시" : "Show Thumbnails",
          type: "toggle",
          value: showThumbnails,
          onChange: toggleThumbnails
        },
      ]
    }
  ];

  return (
    <div className="w-full px-6 md:px-10 pb-20 max-w-4xl mx-auto pt-8">
      {/* Header with Back Button */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1e1e] border border-[#E0E0E0] dark:border-gray-700 flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:border-[#21DBA4] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-[#3d3d3d] dark:text-white text-[28px] font-bold">{language === 'KR' ? '설정' : 'Settings'}</h2>
        </div>
        <p className="text-[#959595] mt-1">
          {language === 'KR' ? "계정 설정 및 환경설정을 관리하세요." : "Manage your account settings and preferences."}
        </p>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#E0E0E0] dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F5F5] dark:border-gray-800 bg-[#FAFAFA] dark:bg-[#252525]">
              <h3 className="text-sm font-semibold text-[#959595] uppercase tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-[#F5F5F5] dark:divide-gray-800">
              {section.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className={`px-6 py-4 flex items-center justify-between transition-colors group ${item.type === 'link' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525]' : ''}`}
                  onClick={item.type === 'link' ? item.action : undefined}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] dark:bg-gray-800 flex items-center justify-center text-[#959595] group-hover:bg-[#21DBA4] group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[#3d3d3d] dark:text-white font-medium">{item.label}</span>
                  </div>

                  {item.type === 'toggle' ? (
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.onChange}
                    />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#E0E0E0] group-hover:text-[#21DBA4] transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#E0E0E0] dark:border-gray-800 overflow-hidden mt-8">
          <div
            onClick={onLogout}
            className="px-6 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF0F0] dark:bg-red-900/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-red-500 font-medium">Log Out</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-[#959595]">
        <p>Linkbrain v1.0.0</p>
      </div>
    </div>
  );
};

export default SettingsPage;
