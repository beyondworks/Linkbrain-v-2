import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Hero from './components/Hero';
import ClipGrid from './components/ClipGrid';
import CollectionsPage from './components/CollectionsPage';
import CollectionDetail from './components/CollectionDetail';
import CreateCollectionDialog from './components/CreateCollectionDialog';
import ClipDetail from './components/ClipDetail';
import FloatingSearchButton from './components/FloatingSearchButton';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import SecurityPage from './components/SecurityPage';
import NotificationsPage from './components/NotificationsPage';
import InsightsPage from './components/InsightsPage';
import ArticlePage from './components/ArticlePage';
import BrowserZoomGuide from './components/BrowserZoomGuide';

import { Settings } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast, Toaster } from 'sonner';
import { isAdmin } from './utils/adminAuth';

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // Initialize currentView from localStorage (session persistence)
  const [currentView, setCurrentViewState] = useState<'clips' | 'collections' | 'collection-detail' | 'clip-detail' | 'login' | 'signup' | 'settings' | 'profile' | 'settings-security' | 'settings-notifications' | 'insights' | 'articles'>(() => {
    try {
      const saved = localStorage.getItem('linkbrain_currentView');
      console.log('[Session] Restoring view from localStorage:', saved);
      // Don't restore detail pages (they need context) or auth pages
      if (saved && !saved.includes('detail') && saved !== 'login' && saved !== 'signup') {
        return saved as any;
      }
    } catch (e) {
      console.log('[Session] localStorage not available');
    }
    return 'clips';
  });

  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom setCurrentView that also updates localStorage and browser history
  const setCurrentView = (view: typeof currentView, pushHistory = true) => {
    setCurrentViewState(view);

    // Save to localStorage (session persistence)
    try {
      // Don't persist detail pages or auth pages
      if (!view.includes('detail') && view !== 'login' && view !== 'signup') {
        localStorage.setItem('linkbrain_currentView', view);
        console.log('[Session] Saved view to localStorage:', view);
      }
    } catch (e) {
      console.log('[Session] Failed to save to localStorage');
    }

    // Push to browser history (enable back button)
    if (pushHistory) {
      const url = view === 'clips' ? '/' : `/${view}`;
      window.history.pushState({ view }, '', url);
    }
  };

  // Browser back button handler
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view) {
        setCurrentViewState(event.state.view);
      } else {
        // Default to clips if no state
        setCurrentViewState('clips');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial history state
    window.history.replaceState({ view: currentView }, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Mobile Sidebar State (Persists during session, resets on reload)
  const [mobileMenuState, setMobileMenuState] = useState({
    isMyClipOpen: false,
    isSourceOpen: false,
    isCollectionsOpen: false
  });

  const handleMobileMenuToggle = (key: 'isMyClipOpen' | 'isSourceOpen' | 'isCollectionsOpen') => {
    setMobileMenuState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dark Mode Logic
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Language Logic
  const [language, setLanguage] = useState<'KR' | 'EN'>('KR');
  // Thumbnail Toggle Logic
  const [showThumbnails, setShowThumbnails] = useState(() => {
    const saved = localStorage.getItem('showThumbnails');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleThumbnails = () => {
    setShowThumbnails(prev => {
      const newValue = !prev;
      localStorage.setItem('showThumbnails', String(newValue));
      return newValue;
    });
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleLanguage = () => setLanguage(prev => prev === 'KR' ? 'EN' : 'KR');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Thumbnails/View Mode: Cmd/Ctrl + '
      if ((e.metaKey || e.ctrlKey) && e.key === "'") {
        e.preventDefault();
        toggleThumbnails();
      }
      // Toggle Language: Cmd/Ctrl + /
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        toggleLanguage();
      }
      // Toggle Dark Mode: Cmd/Ctrl + .
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        toggleDarkMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleThumbnails, toggleLanguage, toggleDarkMode]); // Dependencies needed if functions use closure state, but they use setState actions which is fine. Added for safety or better standard.

  useEffect(() => {
    // Update HTML class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update PWA theme color dynamically
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDarkMode ? "#121212" : "#ffffff");
    }
  }, [isDarkMode]);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auth protection: show toast when trying to access protected views without login
  const requireAuth = (targetView: typeof currentView): boolean => {
    if (!user) {
      toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
        description: language === 'KR'
          ? '이 기능을 사용하려면 먼저 로그인해주세요'
          : 'Sign in to access this feature',
      });
      setCurrentView('login');
      return false;
    }
    return true;
  };

  // Admin route protection: redirect non-admins trying to access insights/articles
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if ((currentView === 'insights' || currentView === 'articles') && !isAdmin(user)) {
      setCurrentView('clips');
      toast.error(language === 'KR' ? '준비중인 기능입니다' : 'Coming Soon');
    }
  }, [currentView, user, authLoading, language]);

  // toggleDarkMode and toggleLanguage moved up

  // Store previous view to return to it
  const [previousView, setPreviousView] = useState<'clips' | 'collections' | 'collection-detail'>('clips');

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentView('clips');
  };

  const handleSourceSelect = (source: string | null) => {
    setSelectedSource(source);
    if (currentView !== 'clips') {
      setCurrentView('clips');
    }
  };

  const handleNavigate = (view: 'clips' | 'collections' | 'insights' | 'articles') => {
    // Protected views require authentication
    if (view === 'collections' && !user) {
      toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
        description: language === 'KR'
          ? '컬렉션을 보려면 먼저 로그인해주세요'
          : 'Sign in to view collections',
      });
      setCurrentView('login');
      return;
    }

    setCurrentView(view);
    if (view === 'collections') {
      setSelectedCategory(null);
      setSelectedCollection(null);
    }
  };

  const handleLogout = () => {
    if (user) {
      if (window.confirm(language === 'KR' ? '로그아웃 하시겠습니까?' : 'Are you sure you want to log out?')) {
        auth.signOut();
        toast.success(language === 'KR' ? '로그아웃되었습니다' : 'Logged out successfully');
        // Stay on current view or go to home, usually stay is fine as content updates
      }
    } else {
      setCurrentView('login');
    }
  };

  const handleCollectionClick = (collection: any) => {
    setSelectedCollection(collection);
    setCurrentView('collection-detail');
  };

  const handleClipClick = (clip: any) => {
    setSelectedClip(clip);
    if (currentView !== 'clip-detail') {
      setPreviousView(currentView as any);
    }
    setCurrentView('clip-detail');
  };

  const handleBackFromDetail = () => {
    setCurrentView(previousView);
    setSelectedClip(null);
  };

  const handleCreateCollection = async (data: { name: string; color: string }) => {
    if (!user) {
      toast.error(language === 'KR' ? "로그인이 필요합니다" : "Please login first", {
        description: language === 'KR'
          ? "서비스를 이용하려면 로그인해주세요"
          : "Sign in to use this feature",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'collections'), {
        name: data.name,
        color: data.color,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // Success feedback already handled in CreateCollectionDialog
      setIsCreateCollectionOpen(false);
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error(language === 'KR' ? "오류가 발생했습니다" : "An error occurred", {
        description: language === 'KR'
          ? "폴더 생성에 실패했습니다. 다시 시도해주세요."
          : "Failed to create folder. Please try again.",
      });
    }
  };

  // Full screen pages
  if (currentView === 'login') {
    return (
      <LoginPage
        onNavigate={(view: any) => setCurrentView(view)}
        onLoginSuccess={() => setCurrentView('clips')}
        language={language}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupPage
        onNavigate={(view: any) => setCurrentView(view)}
        onSignupSuccess={() => setCurrentView('clips')}
        language={language}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#121212] font-sans text-[#3d3d3d] dark:text-white transition-colors duration-300">
      {/* Left Sidebar (Desktop Only) - Fixed position for viewport-centered content */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-40">
        <Sidebar
          onCategorySelect={handleCategorySelect}
          onNavigate={handleNavigate}
          onCreateCollection={() => {
            if (!user) {
              toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
                description: language === 'KR' ? '컬렉션을 만들려면 먼저 로그인해주세요' : 'Sign in to create collections',
              });
              setCurrentView('login');
              return;
            }
            setIsCreateCollectionOpen(true);
          }}
          onCollectionSelect={handleCollectionClick}
          onSourceSelect={handleSourceSelect}
          onSearch={setSearchQuery}
          onLogout={handleLogout}
          onSettingsClick={() => {
            if (!user) {
              toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
                description: language === 'KR' ? '설정을 보려면 먼저 로그인해주세요' : 'Sign in to access settings',
              });
              setCurrentView('login');
              return;
            }
            setCurrentView('settings');
          }}
          onProfileClick={() => {
            if (!user) {
              toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
                description: language === 'KR' ? '프로필을 보려면 먼저 로그인해주세요' : 'Sign in to view profile',
              });
              setCurrentView('login');
              return;
            }
            setCurrentView('profile');
          }}
          currentView={
            currentView.startsWith('settings') ? 'settings' :
              currentView === 'clip-detail' ? 'clips' :
                currentView as any
          }
          language={language}
          user={user}
          toggleDarkMode={toggleDarkMode}
          toggleLanguage={toggleLanguage}
          toggleThumbnails={toggleThumbnails}
          showThumbnails={showThumbnails}
        />
      </div>

      {/* Main Content Area - Centered based on full viewport */}
      <main className="flex-1 relative flex flex-col h-screen">

        {/* Mobile Header with Sidebar (Mobile Only) */}
        <MobileHeader
          onCategorySelect={handleCategorySelect}
          onNavigate={handleNavigate}
          onCreateCollection={() => {
            if (!user) {
              toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
                description: language === 'KR' ? '컬렉션을 만들려면 먼저 로그인해주세요' : 'Sign in to create collections',
              });
              setCurrentView('login');
              return;
            }
            setIsCreateCollectionOpen(true);
          }}
          onCollectionSelect={handleCollectionClick}
          onSourceSelect={handleSourceSelect}
          onSearch={setSearchQuery}
          onLogout={handleLogout}
          onSettingsClick={() => {
            if (!user) {
              toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
                description: language === 'KR' ? '설정을 보려면 먼저 로그인해주세요' : 'Sign in to access settings',
              });
              setCurrentView('login');
              return;
            }
            setCurrentView('settings');
          }}
          onProfileClick={() => {
            if (!user) {
              toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
                description: language === 'KR' ? '프로필을 보려면 먼저 로그인해주세요' : 'Sign in to view profile',
              });
              setCurrentView('login');
              return;
            }
            setCurrentView('profile');
          }}
          currentView={currentView}
          language={language}
          menuState={mobileMenuState}
          onMenuToggle={handleMobileMenuToggle}
          user={user}
        />

        {/* Top Right Controls (Only visible on clips view, Desktop only) */}
        {currentView === 'clips' && (
          <div className="absolute top-8 right-8 z-20 hidden md:flex items-center gap-3">
            {/* Browser Zoom Guide */}
            <BrowserZoomGuide language={language} />

            {/* Settings Button */}
            <button
              onClick={() => {
                if (!user) {
                  toast.error(language === 'KR' ? '로그인이 필요합니다' : 'Please login first', {
                    description: language === 'KR' ? '설정을 보려면 먼저 로그인해주세요' : 'Sign in to access settings',
                  });
                  setCurrentView('login');
                  return;
                }
                setCurrentView('settings');
              }}
              className="w-12 h-12 bg-white dark:bg-[#1e1e1e] rounded-full shadow-md flex items-center justify-center text-[#959595] hover:text-[#21DBA4] hover:shadow-lg transition-all duration-300"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        )}

        <FloatingSearchButton currentView={currentView} language={language} />

        <div className="flex-1 w-full max-w-[1600px] mx-auto overflow-y-auto">

          {currentView === 'clips' && (
            <>
              <Hero language={language} onViewInsight={() => setCurrentView('insights')} />
              <ClipGrid
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategorySelect}
                selectedSource={selectedSource}
                onSourceChange={handleSourceSelect}
                onClipClick={handleClipClick}
                language={language}
                showThumbnails={showThumbnails}
                searchQuery={searchQuery}
              />
            </>
          )}

          {currentView === 'collections' && (
            <CollectionsPage
              onCollectionClick={handleCollectionClick}
              onCreateClick={() => setIsCreateCollectionOpen(true)}
              onBack={() => handleNavigate('clips')}
              language={language}
              user={user}
            />
          )}

          {currentView === 'collection-detail' && selectedCollection && (
            <CollectionDetail
              collection={selectedCollection}
              onBack={() => handleNavigate('collections')}
              onClipClick={handleClipClick}
              language={language}
            />
          )}

          {currentView === 'clip-detail' && selectedClip && (
            <ClipDetail
              clip={selectedClip}
              onBack={handleBackFromDetail}
              language={language}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              onLogout={handleLogout}
              onNavigate={(view: any) => setCurrentView(view)}
              onBack={() => handleNavigate('clips')}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              language={language}
              toggleLanguage={toggleLanguage}
              showThumbnails={showThumbnails}
              toggleThumbnails={toggleThumbnails}
              user={user}
            />
          )}

          {currentView === 'profile' && (
            <ProfilePage
              onBack={() => setCurrentView('settings')}
              language={language}
              user={user}
            />
          )}

          {currentView === 'settings-security' && (
            <SecurityPage
              onBack={() => setCurrentView('settings')}
              language={language}
              user={user}
            />
          )}

          {currentView === 'settings-notifications' && (
            <NotificationsPage
              onBack={() => setCurrentView('settings')}
              language={language}
              user={user}
            />
          )}

          {currentView === 'insights' && (
            <InsightsPage
              onBack={() => handleNavigate('clips')}
              language={language}
              user={user}
            />
          )}

          {currentView === 'articles' && (
            <ArticlePage
              onBack={() => handleNavigate('clips')}
              language={language}
              user={user}
            />
          )}

        </div>

        {/* Bottom Gradient Fade */}
        <div className="hidden md:block w-full h-24 bg-gradient-to-t from-white dark:from-[#121212] to-transparent fixed bottom-0 left-0 pointer-events-none z-10 transition-colors duration-300" />

      </main>

      <CreateCollectionDialog
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
        onCreate={handleCreateCollection}
        language={language}
      />
      <Toaster position="bottom-right" offset={100} />
    </div>
  );
};

export default App;
