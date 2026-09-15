import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  language?: 'en' | 'mr';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  language = 'en',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-xs' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Catchy Geometric Minimalist 'A' Emblem */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 shadow-md shadow-purple-950/20 border border-purple-700/40 group overflow-hidden`}>
        {/* Subtle background ambient sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/10 to-amber-300/20 pointer-events-none" />
        
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[78%] h-[78%] transform group-hover:scale-105 transition-transform duration-300"
        >
          {/* Outer Stylized 'A' Apex and Legs */}
          <path
            d="M24 6L8 40H16.5L24 23.5L31.5 40H40L24 6Z"
            fill="url(#anita-grad-primary)"
          />
          {/* Sleek Modern Crossbar with Sun/Spice golden accent */}
          <path
            d="M17.5 28.5H30.5L32 32H16L17.5 28.5Z"
            fill="url(#anita-grad-gold)"
          />
          {/* Precision Center Peak Diamond */}
          <path
            d="M24 13L26.8 19.5H21.2L24 13Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          {/* Subtle Artisan grain dot */}
          <circle cx="24" cy="36" r="2.2" fill="#FDE047" />

          <defs>
            <linearGradient id="anita-grad-primary" x1="8" y1="6" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A855F7" />
              <stop offset="0.5" stopColor="#818CF8" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="anita-grad-gold" x1="16" y1="28" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${currentSize.text} leading-none`}>
              {language === 'mr' ? 'अनिता स्टोअर्स' : 'Anita Stores'}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider">
              {language === 'mr' ? 'प्रो' : 'Pro'}
            </span>
          </div>
          <span className={`text-slate-500 dark:text-slate-400 font-medium ${currentSize.sub} leading-tight mt-0.5`}>
            {language === 'mr' ? 'वेफर्स, पापड व शेवया' : 'Wafers & Vermicelli Hub'}
          </span>
        </div>
      )}
    </div>
  );
};
