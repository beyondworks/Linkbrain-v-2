import React, { useState } from 'react';
import { ArrowLeft, Shield, Key, Smartphone, AlertTriangle, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { auth } from '../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

interface SecurityPageProps {
  onBack: () => void;
  language?: 'KR' | 'EN';
  user?: any;
}

const SecurityPage = ({ onBack, language = 'KR', user }: SecurityPageProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full px-6 md:px-10 pb-20 max-w-3xl mx-auto pt-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#959595] hover:bg-[#21DBA4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-[#3d3d3d] dark:text-white text-[28px] font-bold">
            {language === 'KR' ? "비밀번호 및 보안" : "Password & Security"}
          </h2>
          <p className="text-[#959595]">
            {language === 'KR' ? "보안 환경설정을 관리하세요" : "Manage your security preferences"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] shadow-sm border border-[#E0E0E0] dark:border-gray-800 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#e0f7fa] dark:bg-[#21DBA4]/20 flex items-center justify-center text-[#21DBA4]">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#3d3d3d] dark:text-white">
              {language === 'KR' ? "비밀번호 변경" : "Change Password"}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d3d3d] dark:text-gray-300 ml-1">
                {language === 'KR' ? "현재 비밀번호" : "Current Password"}
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  className="h-[50px] pr-10 rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus-visible:ring-[#21dba4]"
                  placeholder={language === 'KR' ? "현재 비밀번호 입력" : "Enter current password"}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#959595] hover:text-[#3d3d3d] dark:hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#3d3d3d] dark:text-gray-300 ml-1">
                  {language === 'KR' ? "새 비밀번호" : "New Password"}
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    className="h-[50px] pr-10 rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus-visible:ring-[#21dba4]"
                    placeholder={language === 'KR' ? "새 비밀번호 입력" : "Enter new password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#959595] hover:text-[#3d3d3d] dark:hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#3d3d3d] dark:text-gray-300 ml-1">
                  {language === 'KR' ? "비밀번호 확인" : "Confirm Password"}
                </label>
                <Input
                  type="password"
                  className="h-[50px] rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus-visible:ring-[#21dba4]"
                  placeholder={language === 'KR' ? "새 비밀번호 확인" : "Confirm new password"}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                className="h-[50px] px-8 rounded-2xl bg-[#21DBA4] hover:bg-[#1cc492] text-white font-bold shadow-lg shadow-[#21dba4]/20 flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (language === 'KR' ? "업데이트 중..." : "Updating...") : (language === 'KR' ? "비밀번호 업데이트" : "Update Password")}
              </Button>
            </div>
          </div>
        </div>

        {/* 2FA Section */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] shadow-sm border border-[#E0E0E0] dark:border-gray-800 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3d3d3d] dark:text-white">
                {language === 'KR' ? "2단계 인증" : "Two-Factor Authentication"}
              </h3>
              <p className="text-sm text-[#959595]">
                {language === 'KR' ? "계정에 추가 보안 계층을 추가하세요." : "Add an extra layer of security to your account."}
              </p>
            </div>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-[32px] border border-red-100 dark:border-red-900/20 p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                {language === 'KR' ? "계정 삭제" : "Delete Account"}
              </h3>
              <p className="text-sm text-red-400 dark:text-red-300/70 mt-1 mb-4">
                {language === 'KR' ? "계정을 삭제하면 되돌릴 수 없습니다. 신중하게 결정해주세요." : "Once you delete your account, there is no going back. Please be certain."}
              </p>
              <Button variant="destructive" className="rounded-xl bg-red-500 hover:bg-red-600 text-white">
                {language === 'KR' ? "계정 삭제" : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
