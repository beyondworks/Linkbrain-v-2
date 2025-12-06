import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertTriangle, Loader2, KeyRound } from 'lucide-react';
import { auth } from '../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { toast } from 'sonner';

interface ReauthDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    language: 'KR' | 'EN';
    isDestructive?: boolean;
}

const ReauthDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    language,
    isDestructive = true
}: ReauthDialogProps) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No user logged in');
            }

            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // Re-authentication successful
            setPassword('');
            onConfirm();
        } catch (err: any) {
            console.error('Re-authentication failed:', err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError(language === 'KR' ? '비밀번호가 올바르지 않습니다' : 'Incorrect password');
            } else if (err.code === 'auth/too-many-requests') {
                setError(language === 'KR' ? '너무 많이 시도했습니다. 잠시 후 다시 시도하세요' : 'Too many attempts. Try again later');
            } else {
                setError(language === 'KR' ? '인증에 실패했습니다' : 'Authentication failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px] rounded-[24px] p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-100 dark:bg-red-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
                                <KeyRound className={`w-5 h-5 ${isDestructive ? 'text-red-500' : 'text-amber-600'}`} />
                            </div>
                            <DialogTitle className="text-xl font-bold text-[#3d3d3d] dark:text-white">
                                {title}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-[#959595] text-sm">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 pb-4">
                        <label className="block text-sm font-medium text-[#5a5a5a] dark:text-gray-300 mb-2">
                            {language === 'KR' ? '비밀번호 확인' : 'Confirm Password'}
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={language === 'KR' ? '비밀번호를 입력하세요' : 'Enter your password'}
                            className="w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#21DBA4] focus:border-transparent"
                            autoFocus
                        />
                        {error && (
                            <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="px-6 pb-6 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 rounded-xl h-11"
                            disabled={isLoading}
                        >
                            {language === 'KR' ? '취소' : 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            className={`flex-1 rounded-xl h-11 ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#21DBA4] hover:bg-[#1bc894]'}`}
                            disabled={isLoading || !password}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                confirmText || (language === 'KR' ? '확인' : 'Confirm')
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReauthDialog;
