import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save, ChevronLeft } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { auth } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { toast } from 'sonner';

interface ProfilePageProps {
  onBack: () => void;
  language?: 'KR' | 'EN';
  user?: any;
}

const ProfilePage = ({ onBack, language = 'KR', user }: ProfilePageProps) => {
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL
      });
      // Note: Email update requires more complex flow (re-auth), skipping for now or just showing it.
      // If we want to update email, we need updateEmail(user, newEmail).
      toast.success(language === 'KR' ? "프로필이 업데이트되었습니다." : "Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(language === 'KR' ? "오류가 발생했습니다." : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

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
            {language === 'KR' ? "프로필" : "My Profile"}
          </h2>
          <p className="text-[#959595]">
            {language === 'KR' ? "개인 정보를 관리하세요" : "Manage your personal information"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] shadow-sm border border-[#E0E0E0] dark:border-gray-800 overflow-hidden">
        {/* Profile Image Section */}
        <div className="relative h-32 bg-gradient-to-r from-[#e0f7fa] to-[#e0f2f1] dark:from-[#21dba4]/20 dark:to-[#21dba4]/10">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1e1e1e] p-1 shadow-md">
                <div className="w-full h-full rounded-full bg-[#959595] overflow-hidden flex items-center justify-center text-white">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full" viewBox="0 0 50 50" fill="none">
                      <circle cx="25" cy="25" r="25" fill="currentColor" />
                    </svg>
                  )}
                </div>
              </div>
              {isEditing && (
                <label
                  htmlFor="photoURL"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#21DBA4] text-white flex items-center justify-center shadow-lg hover:bg-[#1cc492] transition-colors cursor-pointer"
                  title={language === 'KR' ? "프로필 사진 변경" : "Change profile photo"}
                >
                  <Camera className="w-4 h-4" />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#3d3d3d] dark:text-gray-300 ml-1">
                  {language === 'KR' ? "이름" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595]" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-[50px] pl-12 rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus-visible:ring-[#21dba4]"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#3d3d3d] dark:text-gray-300 ml-1">
                  {language === 'KR' ? "이메일 주소" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595]" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[50px] pl-12 rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus-visible:ring-[#21dba4]"
                    disabled={true} // Email update is complex, disable for now
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d3d3d] dark:text-gray-300 ml-1">
                {language === 'KR' ? "프로필 사진 URL" : "Profile Photo URL"}
              </label>
              <div className="relative">
                <Input
                  id="photoURL"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder={language === 'KR' ? "이미지 URL을 입력하세요" : "Enter image URL"}
                  className="h-[50px] rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus-visible:ring-[#21dba4]"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d3d3d] dark:text-gray-300 ml-1">
                {language === 'KR' ? "역할" : "Role"}
              </label>
              <div className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[#959595] flex items-center justify-between">
                <span>{language === 'KR' ? '멤버' : 'Member'}</span>
                <span className="px-3 py-1 rounded-full bg-[#21DBA4]/10 text-[#21DBA4] text-xs font-bold uppercase">{language === 'KR' ? '활성' : 'Active'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-end gap-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="h-[50px] px-8 rounded-2xl bg-[#3d3d3d] dark:bg-white hover:bg-[#2d2d2d] dark:hover:bg-gray-200 text-white dark:text-[#3d3d3d] font-medium"
                >
                  {language === 'KR' ? "프로필 편집" : "Edit Profile"}
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="h-[50px] px-6 rounded-2xl text-[#959595] hover:text-[#3d3d3d] dark:hover:text-white"
                  >
                    {language === 'KR' ? "취소" : "Cancel"}
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="h-[50px] px-8 rounded-2xl bg-[#21DBA4] hover:bg-[#1cc492] text-white font-bold shadow-lg shadow-[#21dba4]/20 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (language === 'KR' ? "저장 중..." : "Saving...") : (
                      <>
                        <Save className="w-4 h-4" />
                        {language === 'KR' ? "변경사항 저장" : "Save Changes"}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
