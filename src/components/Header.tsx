import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import type { Language, Theme } from '../types';
import { translations } from '../data/translations';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Layers, 
  TrendingUp, 
  Settings, 
  Plus, 
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  Clock,
  Store
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onOpenNewOrder: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  pendingCount: number;
  readyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  theme,
  setTheme,
  onOpenNewOrder,
  searchQuery,
  setSearchQuery,
  soundEnabled,
  setSoundEnabled,
  pendingCount,
  readyCount,
}) => {
  const t = translations[language] || translations.en;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : null, badgeColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300' },
    { id: 'active_orders', label: t.navActiveOrders, icon: ClipboardList, badge: readyCount > 0 ? readyCount : null, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'inventory', label: t.navInventory, icon: Layers },
    { id: 'analytics', label: t.navAnalytics, icon: TrendingUp },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent body scrolling when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleNewOrderClick = () => {
    onOpenNewOrder();
    setIsMobileMenuOpen(false);
  };

  // Find active tab item for mobile header label
  const activeNavItem = navItems.find((item) => item.id === currentTab) || navItems[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Left Section: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
              {/* Hamburger Button (Mobile / Tablet < lg) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Logo size="md" language={language} />
              
              {/* Shift Indicator Pill (Desktop) */}
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.shiftInfo}: <strong className="text-slate-900 dark:text-white">08:00 AM - 08:00 PM</strong></span>
              </div>
            </div>

            {/* Quick Search (Medium and Up) */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? t.lightMode : t.darkMode}
                aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
                ) : (
                  <Moon className="w-4 h-4 text-purple-700 animate-in spin-in-180 duration-200" />
                )}
              </button>

              {/* Sound Effects Toggle (Hidden on very small screens, accessible in drawer) */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
                className="hidden sm:flex p-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer items-center justify-center"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
              </button>

              {/* Language Switcher Pill */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('mr')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'mr'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* New Order Primary CTA */}
              <button
                onClick={onOpenNewOrder}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{t.newOrderBtn.replace(/^\+\s*/, '')}</span>
                <span className="sm:hidden">{language === 'mr' ? 'नवीन' : 'New'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Sub-Header (Visible on lg and larger screens) */}
        <div className="hidden lg:block border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 py-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span
                        className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          isActive
                            ? 'bg-purple-700 text-white'
                            : item.badgeColor || 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Active Tab Mini-Bar (< lg) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 truncate">
            <activeNavItem.icon className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
            <span className="truncate">{activeNavItem.label}</span>
            {activeNavItem.badge !== null && (
              <span className="px-1.5 py-0.2 bg-purple-900 text-white text-[10px] rounded-full font-bold">
                {activeNavItem.badge}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-purple-700 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
          >
            <span>{language === 'mr' ? 'सर्व विभाग' : 'Change View'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile & Tablet Side Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Side Drawer Panel */}
          <div className="relative w-[300px] sm:w-[340px] max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-250">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-300" />
                <div>
                  <h2 className="font-bold text-sm leading-tight">{t.storeName}</h2>
                  <p className="text-[11px] text-purple-200/80">{language === 'mr' ? 'ऑर्डर व्यवस्थापन' : 'Hub Navigation'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close Navigation Menu"
                className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-purple-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shift & Status Pill in Drawer */}
            <div className="px-4 py-2.5 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/40 flex items-center gap-2 text-xs text-purple-900 dark:text-purple-200">
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-medium truncate">{t.shiftInfo}: 08:00 AM - 08:00 PM</span>
            </div>

            {/* Mobile Search Box inside Drawer */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 md:hidden">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-lg outline-hidden focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Navigation Menu List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'mr' ? 'विभाग निवडा' : 'Sections'}
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold text-sm transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-purple-900 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        isActive ? 'bg-purple-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge !== null && (
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            isActive
                              ? 'bg-purple-700 text-white'
                              : item.badgeColor || 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-purple-200' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}

              {/* Action: + New Order Button in Drawer */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleNewOrderClick}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.newOrderBtn.replace(/^\+\s*/, '')}</span>
                </button>
              </div>
            </div>

            {/* Quick Settings Bar in Drawer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold px-1">
                <span>{language === 'mr' ? 'द्रुत पर्याय' : 'Quick Preferences'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.lightMode}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-purple-700" />
                      <span>{t.darkMode}</span>
                    </>
                  )}
                </button>

                {/* Sound chime toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{language === 'mr' ? 'आवाज सुरू' : 'Sound On'}</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'mr' ? 'आवाज बंद' : 'Muted'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Language switcher inside drawer */}
              <div className="flex items-center justify-between p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('mr')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                    language === 'mr'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};


