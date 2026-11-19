import React, { useEffect, useState } from 'react';
import { BiosSettings } from '../types/system';

interface PostBootScreenProps {
  biosSettings: BiosSettings;
  onEnterUefi: () => void;
  onBootOs: () => void;
}

export const PostBootScreen: React.FC<PostBootScreenProps> = ({
  biosSettings,
  onEnterUefi,
  onBootOs,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'F2') {
        e.preventDefault();
        onEnterUefi();
      } else if (e.key === 'Enter' || e.key === 'F8') {
        e.preventDefault();
        onBootOs();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnterUefi, onBootOs]);

  useEffect(() => {
    if (paused) return;
    if (countdown <= 0) {
      onBootOs();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, paused, onBootOs]);

  return (
    <div className="flex-1 bg-black text-neutral-200 flex flex-col justify-between p-6 md:p-10 select-none relative overflow-hidden">
      {/* Top AMI / ASUS POST Diagnostics Header */}
      <div className="flex items-start justify-between gap-6 font-mono text-xs text-neutral-400">
        <div className="space-y-1">
          <p className="text-neutral-200 font-semibold">
            ASUS ROG STRIX Z790-E GAMING WIFI ACPI BIOS Revision 2402
          </p>
          <p>CPU: Intel(R) Core(TM) i9-14900K @ 3.20GHz (24 Cores / 32 Threads)</p>
          <p>Speed: 3200 MHz · Total Memory: 32768 MB (DDR5-6000 Dual Channel)</p>
          <p>NVMe M.2_1: Samsung SSD 990 PRO 2TB (GPT / Windows Boot Manager)</p>
          <p className={biosSettings.onboardLanEnabled ? 'text-emerald-400' : 'text-amber-400'}>
            Onboard Intel(R) I225-V 2.5Gb LAN:{' '}
            {biosSettings.onboardLanEnabled ? 'Enabled (MAC: 04-7C-16-9A-4B-2E)' : 'Disabled in UEFI'}
          </p>
        </div>

        <div className="text-right hidden sm:block space-y-1">
          <p className="text-neutral-300">AMI Native UEFI</p>
          <p>Secure Boot: {biosSettings.secureBoot}</p>
          <p>TPM 2.0 Device: {biosSettings.tpmDevice}</p>
        </div>
      </div>

      {/* Center ASUS ROG Geometric Splash Mark */}
      <div className="flex flex-col items-center justify-center my-auto py-8">
        <svg
          viewBox="0 0 280 64"
          className="w-64 md:w-80 h-auto mb-5 text-white"
          fill="none"
          aria-label="ASUS ROG Emblem"
        >
          <path
            d="M28 50L52 14H86L78 24H58L44 46H74L84 32H64L70 22H102L82 50H28Z"
            fill="currentColor"
          />
          <path
            d="M112 50L132 14H180C188 14 192 20 188 27L182 37C179 42 173 45 166 45H158L174 50H150L135 42V50H112ZM141 36H165L170 25H146L141 36Z"
            fill="#DC2626"
          />
          <path
            d="M196 50L216 14H258L252 24H224L219 33H246L240 43H213L209 50H196Z"
            fill="currentColor"
          />
        </svg>

        <h1 className="font-display text-lg md:text-2xl tracking-[0.22em] text-neutral-100 uppercase font-semibold text-center">
          Republic of Gamers
        </h1>
        <p className="text-sm text-neutral-400 mt-2 text-center">
          Press <span className="font-mono text-white font-semibold">DEL</span> or{' '}
          <span className="font-mono text-white font-semibold">F2</span> to enter UEFI BIOS setting
        </p>

        {/* Direct Interactive Boot Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onEnterUefi}
            className="px-5 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Enter UEFI BIOS Setup (DEL / F2)
          </button>
          <button
            type="button"
            onClick={onBootOs}
            className="px-5 py-2.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Continue to Windows 11 ({paused ? 'Paused' : `${countdown}s`})
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="px-3.5 py-2.5 rounded bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            {paused ? 'Resume Timer' : 'Pause Timer'}
          </button>
        </div>
      </div>

      {/* Bottom POST Prompt Footer */}
      <div className="space-y-2">
        <div className="w-full h-1 bg-neutral-900 overflow-hidden rounded">
          <div
            className="h-full bg-red-600 transition-all duration-1000 ease-linear"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>DEL / F2 : Setup Utility</span>
          <span>F8 : Boot Menu · ENTER : Boot Windows</span>
        </div>
      </div>
    </div>
  );
};
