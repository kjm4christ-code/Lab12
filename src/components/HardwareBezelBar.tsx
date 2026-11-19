import React from 'react';
import { Power, RotateCcw, Cpu, ShieldAlert, CheckCircle2, WifiOff } from 'lucide-react';
import { BootPhase, NetworkDiagnosticsState } from '../types/system';

interface HardwareBezelBarProps {
  bootPhase: BootPhase;
  diagnostics: NetworkDiagnosticsState;
  onRebootToUefi: () => void;
  onPowerReset: () => void;
  onFullResetSimulation: () => void;
}

export const HardwareBezelBar: React.FC<HardwareBezelBarProps> = ({
  bootPhase,
  diagnostics,
  onRebootToUefi,
  onPowerReset,
  onFullResetSimulation,
}) => {
  const phaseLabel: Record<BootPhase, string> = {
    post: 'ASUS POST',
    uefi: 'UEFI BIOS Utility',
    os_booting: 'Booting Windows 11',
    lockscreen: 'Windows 11 Lock Screen',
    desktop: 'Windows 11 Desktop',
  };

  return (
    <header className="h-9 bg-neutral-950 border-b border-neutral-800 px-4 flex items-center justify-between gap-6 text-xs text-neutral-300 shrink-0 z-50">
      <div className="flex items-center gap-3 min-w-0">
        <Cpu className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <span className="font-display font-semibold text-neutral-100 whitespace-nowrap shrink-0">
          ASUS ROG STRIX Z790-E
        </span>
        <span className="text-neutral-600 hidden sm:inline">·</span>
        <span className="text-neutral-400 truncate hidden sm:inline">
          {phaseLabel[bootPhase]}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-4 text-neutral-400">
        {!diagnostics.hardwareEnabled ? (
          <span className="flex items-center gap-1.5 text-amber-400 whitespace-nowrap">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>NIC: Disabled in UEFI</span>
          </span>
        ) : diagnostics.browserFirewallBlocked ? (
          <span className="flex items-center gap-1.5 text-amber-300 whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>NIC: Active · Browser Blocked by Firewall</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-400 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>NIC: Active · Internet Connected</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {bootPhase !== 'uefi' && (
          <button
            type="button"
            onClick={onRebootToUefi}
            className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Restart system and enter ASUS UEFI BIOS Setup (DEL)"
          >
            Enter UEFI (DEL)
          </button>
        )}
        <button
          type="button"
          onClick={onPowerReset}
          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          title="Cold reboot motherboard POST"
        >
          <Power className="w-3 h-3" />
          <span className="hidden sm:inline">Reboot</span>
        </button>
        <button
          type="button"
          onClick={onFullResetSimulation}
          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 hover:border-red-900/60 text-neutral-400 hover:text-red-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          title="Reset BIOS and Firewall to initial broken state"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset Lab</span>
        </button>
      </div>
    </header>
  );
};
