import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import svgPathsOpen from "../imports/svg-necy6hi9g3";
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface SignupPageProps {
  onNavigate: (view: 'login' | 'clips') => void;
  onSignupSuccess: () => void;
  language?: 'KR' | 'EN';
}

const SignupPage = ({ onNavigate, onSignupSuccess, language = 'KR' }: SignupPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      onSignupSuccess();
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("Failed to create account. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSignupSuccess();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError("Failed to login with Google.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col items-center justify-center p-4 relative">
      {/* Back Button (Optional) */}
      <button
        onClick={() => onNavigate('clips')}
        className="absolute top-8 left-8 text-[#959595] hover:text-[#3d3d3d] transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{language === 'KR' ? '홈으로 돌아가기' : 'Back to Home'}</span>
      </button>

      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-xl p-8 md:p-12">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-[60px] h-[60px] rounded-[16px] bg-[#21DBA4] flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" viewBox="0 0 40 40" fill="none">
              <path d={svgPathsOpen.p35b52a00} fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-[32px] font-bold text-[#3d3d3d]">
            {language === 'KR' ? '계정 생성' : 'Create an account'}
          </h1>
          <p className="text-[#959595] text-lg mt-2">
            {language === 'KR' ? 'Linkbrain과 함께 시작하세요' : 'Start your journey with Linkbrain'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3d3d3d] ml-1">
              {language === 'KR' ? '이름' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595]" />
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-[56px] pl-12 rounded-2xl border-gray-200 focus-visible:ring-[#21dba4] text-[16px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3d3d3d] ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595]" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[56px] pl-12 rounded-2xl border-gray-200 focus-visible:ring-[#21dba4] text-[16px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3d3d3d] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#959595]" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[56px] pl-12 pr-12 rounded-2xl border-gray-200 focus-visible:ring-[#21dba4] text-[16px]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#959595] hover:text-[#3d3d3d]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-[56px] rounded-2xl bg-[#21DBA4] hover:bg-[#1cc492] text-white text-lg font-bold shadow-lg shadow-[#21dba4]/20 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-[#959595]">Or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="h-[56px] rounded-2xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-[#3d3d3d] font-medium">Google</span>
          </button>
          <button className="h-[56px] rounded-2xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.06-1.42.78-2.92.5-4.23-1.02-1.78-2.08-2.59-4.89-1.18-7.69.93-1.85 2.55-3.29 4.55-3.38 1.04-.05 2.11.42 2.88.72.72.28 1.81.2 2.88-.24 1.25-.52 2.42-.34 3.38.87.13.16.25.33.37.5-2.49 1.32-2.73 4.55-.55 6.31-.38 1.16-1.05 2.62-1.94 3.52zm-3.16-14.9c.15-1.1.96-2.15 1.88-2.76 1.08 1.21.67 2.68.05 3.75-.89.95-2.02.94-1.93-1z" />
            </svg>
            <span className="text-[#3d3d3d] font-medium">Apple</span>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[#959595]">
          Already have an account?{" "}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#21dba4] font-bold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
