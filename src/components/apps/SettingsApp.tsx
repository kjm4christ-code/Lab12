import React, { useState } from 'react';
import {
  WifiOff,
  MonitorCheck,
  Shield,
  Cpu,
  RotateCw,
  HardDrive,
  ChevronRight,
} from 'lucide-react';
import { NetworkDiagnosticsState, WindowId } from '../../types/system';

interface SettingsAppProps {
  diagnostics: NetworkDiagnosticsState;
  onOpenApp: (id: WindowId) => void;
  onRebootToUefi: () => void;
}

type SettingsTab = 'network' | 'system' | 'recovery';

export const SettingsApp: React.FC<SettingsAppProps> = ({
  diagnostics,
  onOpenApp,
  onRebootToUefi,
}) => {
  const [tab, setTab] = useState<SettingsTab>('network');

  return (
    <div className="h-full grid grid-cols-12 bg-[#1c1d21] text-slate-100 select-none">
      {/* Fluent Dark Left Navigation */}
      <aside className="col-span-4 bg-[#18191d] border-r border-neutral-800 p-3 space-y-1">
        <div className="px-3 py-2 mb-2">
          <div className="text-xs font-semibold text-white">Administrator</div>
          <div className="text-[11px] text-neutral-400">ASUS-Z790E Local</div>
        </div>

        <button
          type="button"
          onClick={() => setTab('network')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-left cursor-pointer ${
            tab === 'network'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-300 hover:bg-neutral-800/50'
          }`}
        >
          {diagnostics.hardwareEnabled ? (
            <MonitorCheck className="w-4 h-4 text-sky-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-400" />
          )}
          <span>Network &amp; internet</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('system')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-left cursor-pointer ${
            tab === 'system'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-300 hover:bg-neutral-800/50'
          }`}
        >
          <Cpu className="w-4 h-4 text-neutral-400" />
          <span>System &gt; About</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('recovery')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-left cursor-pointer ${
            tab === 'recovery'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-300 hover:bg-neutral-800/50'
          }`}
        >
          <RotateCw className="w-4 h-4 text-neutral-400" />
          <span>System &gt; Recovery</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="col-span-8 p-6 overflow-y-auto space-y-5">
        {tab === 'network' && (
          <>
            <h2 className="font-display text-xl font-semibold text-white">
              Network &amp; internet
            </h2>

            {/* Connection Status Card */}
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {!diagnostics.hardwareEnabled ? (
                  <WifiOff className="w-8 h-8 text-amber-400 shrink-0" />
                ) : (
                  <MonitorCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="text-sm font-semibold text-white">
                    {!diagnostics.hardwareEnabled
                      ? 'Not connected'
                      : diagnostics.browserFirewallBlocked
                      ? 'Ethernet — Local Network Active (Browser Restricted)'
                      : 'Ethernet — Connected'}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {!diagnostics.hardwareEnabled
                      ? 'No Ethernet or Wi-Fi network adapters detected in Windows.'
                      : diagnostics.browserFirewallBlocked
                      ? 'Intel(R) Ethernet Controller I225-V · IPv4: 192.168.1.142 · Outbound Firewall Block detected'
                      : 'Intel(R) Ethernet Controller I225-V · Internet access active'}
                  </div>
                </div>
              </div>
            </div>

            {/* Adapter & Firewall Diagnostic Actions */}
            <div className="space-y-2">
              {!diagnostics.hardwareEnabled && (
                <div className="p-4 rounded-lg bg-amber-950/25 border border-amber-800/60 space-y-2">
                  <div className="text-xs font-semibold text-amber-300">
                    Hardware Troubleshooting Note
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    No PCIe network controller was enumerated during boot. Check
                    ASUS UEFI BIOS &gt; Advanced &gt; Onboard Devices
                    Configuration to verify the Onboard LAN Controller is enabled.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onRebootToUefi}
                      className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium cursor-pointer"
                    >
                      Restart to UEFI Firmware
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenApp('devicemanager')}
                      className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs cursor-pointer"
                    >
                      Open Device Manager
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => onOpenApp('firewall')}
                className="w-full p-3.5 rounded-lg bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-xs font-medium text-white">
                      Windows Defender Firewall with Advanced Security
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {diagnostics.browserFirewallBlocked
                        ? 'An active outbound rule is blocking Microsoft Edge'
                        : 'Inspect inbound and outbound connection rules'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                type="button"
                onClick={() => onOpenApp('devicemanager')}
                className="w-full p-3.5 rounded-lg bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-neutral-400" />
                  <div>
                    <div className="text-xs font-medium text-white">
                      Advanced network settings &amp; Device Manager
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      View enumerated network adapters and hardware status
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </>
        )}

        {tab === 'system' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">
              About
            </h2>
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Device name</span>
                <span className="font-mono text-neutral-200">ASUS-Z790E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Processor</span>
                <span className="font-mono text-neutral-200">
                  Intel(R) Core(TM) i9-14900K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Installed RAM</span>
                <span className="font-mono text-neutral-200">32.0 GB DDR5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Edition</span>
                <span className="font-mono text-neutral-200">
                  Windows 11 Pro 24H2
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">BIOS Mode</span>
                <span className="font-mono text-neutral-200">
                  UEFI (ASUS BIOS 2402)
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === 'recovery' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-white">
              Recovery
            </h2>
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">
                  Advanced startup — UEFI Firmware Settings
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  Restart the workstation directly into ASUS UEFI BIOS Setup
                </div>
              </div>
              <button
                type="button"
                onClick={onRebootToUefi}
                className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium whitespace-nowrap cursor-pointer"
              >
                Restart now
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
