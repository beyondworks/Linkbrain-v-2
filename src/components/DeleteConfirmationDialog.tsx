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
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
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

  const handleConfirm = () => {
    if (!password) {
      setError(language === 'KR' ? "비밀번호를 입력해주세요" : "Password is required");
      return;
    }
    // Mock validation could happen here or in parent
    setError("");
    onConfirm(password);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white sm:max-w-[425px] rounded-2xl border-gray-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#3d3d3d] text-xl font-bold">
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
              description || defaultDescription
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[#3d3d3d] block mb-4">
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
              className={`rounded-xl border-gray-200 focus-visible:ring-[#21dba4] ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-gray-200 hover:bg-gray-50 text-[#3d3d3d]"
            disabled={isLoading}
          >
            {language === 'KR' ? '취소' : 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white border-none"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === 'KR' ? '삭제' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
