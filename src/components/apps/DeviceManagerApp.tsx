import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, HardDrive, Network, AlertTriangle } from 'lucide-react';
import { BiosSettings } from '../../types/system';

interface DeviceManagerAppProps {
  biosSettings: BiosSettings;
}

export const DeviceManagerApp: React.FC<DeviceManagerAppProps> = ({
  biosSettings,
}) => {
  const [showHidden, setShowHidden] = useState(false);
  const [expandedNet, setExpandedNet] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#1b1d22] text-slate-100 text-xs select-none">
      {/* Menu Bar */}
      <div className="bg-[#23262d] border-b border-neutral-700/80 px-3 py-1.5 flex items-center justify-between">
        <span className="text-neutral-300 font-medium">ASUS-Z790E</span>
        <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="accent-sky-500"
          />
          <span>View &gt; Show hidden devices</span>
        </label>
      </div>

      {/* Device Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="flex items-center gap-2 px-2 py-1 text-neutral-300">
          <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
          <span>Disk drives (Samsung SSD 990 PRO 2TB)</span>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 text-neutral-300">
          <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          <Cpu className="w-3.5 h-3.5 text-neutral-400" />
          <span>Processors (Intel Core i9-14900K · 32 threads)</span>
        </div>

        {/* Network Adapters */}
        <div>
          <button
            type="button"
            onClick={() => setExpandedNet((e) => !e)}
            className="flex items-center gap-2 px-2 py-1 text-neutral-100 font-medium hover:bg-neutral-800/60 rounded w-full text-left cursor-pointer"
          >
            {expandedNet ? (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <Network className="w-3.5 h-3.5 text-sky-400" />
            <span>Network adapters</span>
          </button>

          {expandedNet && (
            <div className="pl-8 space-y-1 mt-1">
              {biosSettings.onboardLanEnabled ? (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-emerald-950/25 border border-emerald-800/50">
                  <span className="text-emerald-200 font-medium">
                    Intel(R) Ethernet Controller (3) I225-V
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400">
                    Working properly
                  </span>
                </div>
              ) : showHidden ? (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-amber-950/20 border border-amber-800/40 text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Intel(R) Ethernet Controller (3) I225-V
                  </span>
                  <span className="font-mono text-[11px] text-amber-400">
                    Code 45 · Disabled in UEFI
                  </span>
                </div>
              ) : (
                <div className="px-2.5 py-1.5 rounded bg-amber-950/20 border border-amber-800/40 text-amber-300">
                  No physical Ethernet hardware enumerated (Check UEFI Onboard
                  Devices)
                </div>
              )}

              {biosSettings.wifiControllerEnabled && (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-200">
                    Intel(R) Wi-Fi 6E AX211 160MHz
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400">
                    Working properly
                  </span>
                </div>
              )}

              <div className="px-2.5 py-1 text-neutral-400">
                WAN Miniport (IP)
              </div>
              <div className="px-2.5 py-1 text-neutral-400">
                WAN Miniport (IPv6)
              </div>
              <div className="px-2.5 py-1 text-neutral-400">
                WAN Miniport (Network Monitor)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
