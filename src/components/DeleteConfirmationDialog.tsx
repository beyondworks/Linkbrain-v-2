import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { auth } from '../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  descriptionLines?: string[];
  isLoading?: boolean;
  language?: 'KR' | 'EN';
}

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  descriptionLines,
  isLoading = false,
  language = 'KR',
}: DeleteConfirmationDialogProps) => {
  const defaultTitle = language === 'KR' ? "삭제 확인" : "Delete Confirmation";
  const defaultDescription = language === 'KR'
    ? "이 작업은 되돌릴 수 없습니다. 삭제하려면 비밀번호를 입력하세요."
    : "This action cannot be undone. Please enter your password to confirm deletion.";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if user signed in with Google
  const isGoogleUser = auth.currentUser?.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );

  const handleConfirm = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError(language === 'KR' ? "로그인이 필요합니다" : "Please login first");
      return;
    }

    setIsAuthenticating(true);
    setError("");

    try {
      if (isGoogleUser) {
        // Re-authenticate with Google popup
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        // Re-authenticate with email/password
        if (!password) {
          setError(language === 'KR' ? "비밀번호를 입력해주세요" : "Password is required");
          setIsAuthenticating(false);
          return;
        }

        if (!user.email) {
          setError(language === 'KR' ? "이메일 정보가 없습니다" : "No email found");
          setIsAuthenticating(false);
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Re-authentication successful - proceed with deletion
      setPassword("");
      onConfirm();
    } catch (err: any) {
      console.error('Re-authentication failed:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(language === 'KR' ? '비밀번호가 올바르지 않습니다' : 'Incorrect password');
      } else if (err.code === 'auth/too-many-requests') {
        setError(language === 'KR' ? '너무 많이 시도했습니다. 잠시 후 다시 시도하세요' : 'Too many attempts. Try again later');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(language === 'KR' ? '인증이 취소되었습니다' : 'Authentication cancelled');
      } else {
        setError(language === 'KR' ? '인증에 실패했습니다' : 'Authentication failed');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white dark:bg-[#1e1e1e] sm:max-w-[425px] rounded-2xl border-gray-100 dark:border-gray-800 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#3d3d3d] dark:text-white text-xl font-bold">
            {title || defaultTitle}
          </DialogTitle>
          <DialogDescription className="text-[#959595]">
            {descriptionLines ? (
              <>
                {descriptionLines.map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < descriptionLines.length - 1 && <br />}
                  </span>
                ))}
              </>
            ) : (
              description || (isGoogleUser
                ? (language === 'KR'
                  ? "이 작업은 되돌릴 수 없습니다. Google 계정으로 다시 인증해주세요."
                  : "This action cannot be undone. Please re-authenticate with Google.")
                : defaultDescription)
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!isGoogleUser && (
            <div>
              <label htmlFor="password" className="text-sm font-medium text-[#3d3d3d] dark:text-gray-300 block mb-4">
                {language === 'KR' ? '비밀번호' : 'Password'}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder={language === 'KR' ? "비밀번호를 입력하세요" : "Enter your password"}
                className={`rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-[#3d3d3d] dark:text-white focus-visible:ring-[#21dba4] ${error ? "border-red-500" : ""}`}
              />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252525] text-[#3d3d3d] dark:text-gray-300"
            disabled={isLoading || isAuthenticating}
          >
            {language === 'KR' ? '취소' : 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isAuthenticating || (!isGoogleUser && !password)}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white border-none"
          >
            {(isLoading || isAuthenticating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGoogleUser
              ? (language === 'KR' ? 'Google로 인증' : 'Verify with Google')
              : (language === 'KR' ? '삭제' : 'Delete')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;

