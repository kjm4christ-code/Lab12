import React, { useEffect } from 'react';

interface OsBootSpinnerProps {
  onComplete: () => void;
}

export const OsBootSpinner: React.FC<OsBootSpinnerProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1700);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-between py-16 px-6 select-none">
      <div />

      {/* Center ASUS / ROG emblem during Windows 11 UEFI boot */}
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-3xl md:text-4xl font-bold tracking-[0.28em] text-white">
            ASUS
          </span>
          <span className="text-xs tracking-[0.35em] text-neutral-500 uppercase">
            In Search of Incredible
          </span>
        </div>

        {/* Authentic Windows 11 smooth arc spinner */}
        <div className="relative w-9 h-9" aria-label="Loading Windows 11">
          <svg className="w-9 h-9 win11-spinner" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="36 60"
            />
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
      >
        Skip boot animation
      </button>
    </div>
  );
};
