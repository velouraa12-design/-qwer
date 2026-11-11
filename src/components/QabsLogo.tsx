import React, { useState } from 'react';

interface QabsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const QabsLogo: React.FC<QabsLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const heightClasses = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16 sm:h-20',
    xl: 'h-20 sm:h-28'
  };

  if (!imgError) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/qabas-logo.png"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('qabas-logo_884164c8.png')) {
              target.src = '/assets/aistudio/qabas-logo_884164c8.png';
            } else {
              setImgError(true);
            }
          }}
          alt="QABS | قبس — متاجر إلكترونية | خدمات رقمية | E-commerce Stores | Digital Services"
          className={`${heightClasses[size]} w-auto object-contain rounded-lg bg-white px-2.5 py-1 shadow-xs`}
        />
      </div>
    );
  }

  return (
    <div dir="ltr" className={`inline-flex items-center gap-3 select-none bg-white px-3.5 py-1.5 rounded-xl ${className}`}>
      {/* Shopping Bag with Q Icon */}
      <svg
        viewBox="0 0 120 120"
        className={size === 'xl' ? 'w-20 h-20' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="qabsTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00B8A9" />
            <stop offset="55%" stopColor="#007F8B" />
            <stop offset="100%" stopColor="#004457" />
          </linearGradient>
        </defs>
        {/* Bag Handle */}
        <path
          d="M42 36V28C42 18.0589 50.0589 10 60 10C69.9411 10 78 18.0589 78 28V36"
          stroke="url(#qabsTealGrad)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Bag Outline */}
        <path
          d="M96 102H88L96 34H24L16 96C15.2 102.5 20.3 108 26.8 108H62"
          stroke="url(#qabsTealGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Q Circle */}
        <circle
          cx="60"
          cy="69"
          r="25"
          stroke="url(#qabsTealGrad)"
          strokeWidth="9"
        />
        {/* Q Tail */}
        <path
          d="M58 82C69 83 78 92 86 103C91 109 98 109 102 103"
          stroke="url(#qabsTealGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#004457]">
            قبس
          </span>
          <span className="h-7 w-[3px] bg-gradient-to-b from-[#00B8A9] to-[#007F8B] rounded-full" />
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#004457]">
            QABS
          </span>
        </div>
        {showTagline && (
          <div className="text-[10px] sm:text-xs font-semibold text-[#004E64] tracking-tight whitespace-nowrap">
            متاجر إلكترونية | خدمات رقمية | E-commerce Stores | Digital Services
          </div>
        )}
      </div>
    </div>
  );
};
