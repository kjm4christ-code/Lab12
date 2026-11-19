import React, { useEffect, useState } from 'react';
import { Globe, MonitorCheck, ArrowRight, RotateCw, User } from 'lucide-react';
import { LOCKSCREEN_URL } from '../data/initialSystem';

interface Win11LockScreenProps {
  hasLocalNetwork: boolean;
  hasInternetAccess: boolean;
  onLogin: () => void;
  onRestartToUefi: () => void;
}

export const Win11LockScreen: React.FC<Win11LockScreenProps> = ({
  hasLocalNetwork,
  hasInternetAccess,
  onLogin,
  onRestartToUefi,
}) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [imageError, setImageError] = useState(false);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!showSignIn && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setShowSignIn(true);
      } else if (showSignIn && e.key === 'Enter') {
        e.preventDefault();
        triggerSignIn();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSignIn]);

  const triggerSignIn = () => {
    setSigningIn(true);
    setTimeout(() => {
      onLogin();
    }, 450);
  };

  return (
    <div
      onClick={() => {
        if (!showSignIn) setShowSignIn(true);
      }}
      className="flex-1 relative overflow-hidden flex flex-col justify-between bg-slate-950 select-none"
    >
      {/* Background image with fallback */}
      {!imageError ? (
        <img
          src={LOCKSCREEN_URL}
          alt="Windows 11 alpine twilight lock screen"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            showSignIn ? 'scale-105 blur-xl brightness-50' : 'scale-100 brightness-90'
          }`}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 transition-all duration-500 ${
            showSignIn ? 'brightness-50' : 'brightness-90'
          }`}
        />
      )}

      {/* Scrim for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/35 pointer-events-none" />

      {!showSignIn ? (
        /* Lock Screen Clock View */
        <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-16 px-6 cursor-pointer">
          <div className="text-center mt-4">
            <div className="font-display text-7xl md:text-8xl font-semibold text-white tracking-tight tabular-nums drop-shadow">
              {timeStr.replace(/\s?(AM|PM)/i, '')}
            </div>
            <div className="text-xl md:text-2xl text-white/90 font-medium mt-2 drop-shadow">
              {dateStr}
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-white/80 font-medium">
              Click anywhere or press Enter to sign in
            </p>
          </div>
        </div>
      ) : (
        /* Sign-In Prompt View */
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-xs flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-5 shadow-xl">
              <User className="w-14 h-14 text-white/90" />
            </div>

            <h2 className="font-display text-2xl font-semibold text-white">
              Administrator
            </h2>
            <p className="text-sm text-white/70 mt-1 mb-6">
              Local Workstation · ASUS-Z790E
            </p>

            <button
              type="button"
              onClick={triggerSignIn}
              disabled={signingIn}
              className="w-full py-2.5 px-5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-70"
            >
              <span>{signingIn ? 'Welcome...' : 'Sign in'}</span>
              {!signingIn && <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowSignIn(false)}
              className="mt-4 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Back to lock screen
            </button>
          </div>
        </div>
      )}

      {/* Bottom Right Network & Power Tray (Authentic Windows 11 Lock Screen Icons) */}
      <div
        className="relative z-10 flex items-center justify-between px-6 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-white/75 font-medium">
          Windows 11 Pro · Build 26100
        </div>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white"
            title={
              !hasLocalNetwork
                ? 'No internet access (No network adapters found)'
                : !hasInternetAccess
                ? 'Ethernet connected (Local access)'
                : 'Ethernet connected (Internet access)'
            }
          >
            {hasLocalNetwork ? (
              <>
                <MonitorCheck className="w-4 h-4 text-white" />
                <span>{hasInternetAccess ? 'Internet access' : 'Ethernet'}</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-neutral-300" />
                <span>No internet</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onRestartToUefi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white transition-colors cursor-pointer"
            title="Restart into ASUS UEFI Firmware Settings"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Restart to UEFI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
