import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  WifiOff,
  ShieldAlert,
  Globe,
  CheckCircle2,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { NetworkDiagnosticsState, WindowId } from '../../types/system';

interface EdgeBrowserAppProps {
  diagnostics: NetworkDiagnosticsState;
  onOpenApp: (id: WindowId) => void;
  onRebootToUefi: () => void;
}

type SiteId = 'portal' | 'asus' | 'speedtest' | 'news';

export const EdgeBrowserApp: React.FC<EdgeBrowserAppProps> = ({
  diagnostics,
  onOpenApp,
  onRebootToUefi,
}) => {
  const [activeSite, setActiveSite] = useState<SiteId>('portal');
  const [urlInput, setUrlInput] = useState('https://www.msftconnecttest.com/portal');
  const [refreshTick, setRefreshTick] = useState(0);
  const [speedRunning, setSpeedRunning] = useState(false);
  const [speedDown, setSpeedDown] = useState<number | null>(null);
  const [speedUp, setSpeedUp] = useState<number | null>(null);

  const siteUrls: Record<SiteId, string> = {
    portal: 'https://www.msftconnecttest.com/portal',
    asus: 'https://rog.asus.com/support/z790-e',
    speedtest: 'https://speedtest.local/2500mbps',
    news: 'https://techbrief.example.com/networking',
  };

  const navigate = (site: SiteId) => {
    setActiveSite(site);
    setUrlInput(siteUrls[site]);
    setRefreshTick((t) => t + 1);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = urlInput.toLowerCase();
    if (val.includes('asus') || val.includes('rog')) {
      navigate('asus');
    } else if (val.includes('speed')) {
      navigate('speedtest');
    } else if (val.includes('tech') || val.includes('news')) {
      navigate('news');
    } else {
      navigate('portal');
    }
  };

  const runSpeedTest = () => {
    setSpeedRunning(true);
    setSpeedDown(null);
    setSpeedUp(null);
    setTimeout(() => {
      setSpeedDown(2384.6);
      setSpeedUp(2140.2);
      setSpeedRunning(false);
    }, 900);
  };

  return (
    <div className="h-full flex flex-col bg-[#1f2024] text-slate-100 select-text">
      {/* Browser Tab Strip */}
      <div className="bg-[#141518] px-2 pt-2 flex items-center gap-1 border-b border-neutral-800">
        {(
          [
            { id: 'portal', label: 'Connectivity Portal' },
            { id: 'asus', label: 'ASUS ROG Support' },
            { id: 'speedtest', label: '2.5GbE SpeedTest' },
            { id: 'news', label: 'TechBrief Daily' },
          ] as { id: SiteId; label: string }[]
        ).map((tab) => {
          const active = activeSite === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.id)}
              className={`px-3.5 py-1.5 rounded-t text-xs font-medium flex items-center gap-2 max-w-[170px] truncate transition-colors cursor-pointer ${
                active
                  ? 'bg-[#282a30] text-white'
                  : 'text-neutral-400 hover:bg-[#1e1f24] hover:text-neutral-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0 text-sky-400" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation & Omnibox Bar */}
      <div className="bg-[#282a30] px-3 py-2 flex items-center gap-2 border-b border-neutral-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('portal')}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate(activeSite)}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setRefreshTick((t) => t + 1)}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300 cursor-pointer"
            title="Refresh"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center">
          <div className="w-full flex items-center gap-2 bg-[#1a1b1f] border border-neutral-700 focus-within:border-sky-500 rounded-full px-3.5 py-1 text-xs">
            <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-transparent text-neutral-100 outline-none font-mono text-xs"
              aria-label="Address bar"
            />
          </div>
        </form>
      </div>

      {/* Viewport Content */}
      <div
        key={refreshTick}
        className="flex-1 overflow-y-auto bg-[#1b1c20] p-6 md:p-10"
      >
        {!diagnostics.hardwareEnabled ? (
          /* STATE 1: No Network Hardware (UEFI LAN Disabled) */
          <div className="max-w-lg mx-auto mt-8 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-neutral-300" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                You&apos;re not connected
              </h2>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                Windows could not find an active network interface. Your onboard
                network controller appears to be disabled in hardware or UEFI
                firmware.
              </p>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded p-4 text-xs space-y-1.5 text-neutral-400">
              <p className="text-neutral-200 font-medium">Try:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Rebooting into ASUS UEFI BIOS Setup and enabling the Onboard LAN
                  Controller
                </li>
                <li>Checking Device Manager under Network adapters</li>
                <li>Running Network &amp; Internet diagnostics in Settings</li>
              </ul>
              <p className="font-mono text-amber-400 pt-2">
                ERR_INTERNET_DISCONNECTED · NO_ADAPTER_PRESENT
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onOpenApp('settings')}
                className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer"
              >
                Open Network Settings
              </button>
              <button
                type="button"
                onClick={onRebootToUefi}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-medium cursor-pointer"
              >
                Restart to UEFI BIOS
              </button>
            </div>
          </div>
        ) : diagnostics.browserFirewallBlocked ? (
          /* STATE 2: Hardware Active, Blocked by Firewall Outbound Rule */
          <div className="max-w-lg mx-auto mt-8 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-700/60 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                Hmm... can&apos;t reach this page
              </h2>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                Your Ethernet adapter (<span className="font-mono text-neutral-100">Intel I225-V</span>) is connected to the local network, but outbound web traffic from Microsoft Edge is blocked by Windows Defender Firewall.
              </p>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 rounded p-4 text-xs space-y-1.5 text-neutral-400">
              <p className="text-neutral-200 font-medium">Diagnostics:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ethernet Adapter: Connected (192.168.1.142)</li>
                <li>
                  Outbound Policy: Blocked for <span className="font-mono text-neutral-200">msedge.exe</span> (Ports 80, 443, 8443)
                </li>
              </ul>
              <p className="font-mono text-amber-400 pt-2">
                ERR_NETWORK_ACCESS_DENIED · FIREWALL_OUTBOUND_BLOCK
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onOpenApp('firewall')}
                className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer"
              >
                Open Windows Defender Firewall
              </button>
              <button
                type="button"
                onClick={() => setRefreshTick((t) => t + 1)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-medium cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          /* STATE 3: Full Internet Access Restored */
          <div className="max-w-3xl mx-auto">
            {activeSite === 'portal' && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-emerald-950/30 border border-emerald-700/50 flex items-start gap-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-display text-xl font-semibold text-white">
                      Internet Access Restored
                    </h2>
                    <p className="text-sm text-neutral-300 mt-1">
                      Your ASUS ROG STRIX Z790-E onboard Intel(R) I225-V 2.5Gb
                      Ethernet controller is active and outbound browser traffic
                      is permitted through Windows Defender Firewall.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400">Assigned IPv4</div>
                    <div className="font-mono text-sm text-white mt-1">
                      192.168.1.142
                    </div>
                  </div>
                  <div className="p-4 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400">Link Speed</div>
                    <div className="font-mono text-sm text-emerald-400 mt-1">
                      2.5 Gbps Full Duplex
                    </div>
                  </div>
                  <div className="p-4 rounded bg-neutral-900 border border-neutral-800">
                    <div className="text-neutral-400">DNS Resolver</div>
                    <div className="font-mono text-sm text-white mt-1">
                      1.1.1.1 · 8.8.8.8
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('asus')}
                    className="p-4 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-sm font-medium text-white">
                      <span>ASUS ROG Support</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      BIOS 2402 release notes &amp; Intel I225-V drivers
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('speedtest')}
                    className="p-4 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-sm font-medium text-white">
                      <span>2.5GbE SpeedTest</span>
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Verify live throughput on your wired interface
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('news')}
                    className="p-4 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-sm font-medium text-white">
                      <span>TechBrief Daily</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Read today&apos;s hardware and networking digest
                    </p>
                  </button>
                </div>
              </div>
            )}

            {activeSite === 'asus' && (
              <div className="space-y-5">
                <div className="border-b border-neutral-800 pb-4">
                  <span className="font-mono text-xs text-red-400">
                    ROG SUPPORT · MOTHERBOARD
                  </span>
                  <h2 className="font-display text-2xl font-bold text-white mt-1">
                    ROG STRIX Z790-E GAMING WIFI
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Drivers, UEFI Firmware Updates, and Network Diagnostics
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-4 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">
                        BIOS 2402 — System Stability &amp; Intel Microcode
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Installed on your system · Release 2026/10/14
                      </div>
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      Up to date
                    </span>
                  </div>
                  <div className="p-4 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">
                        Intel(R) Ethernet Controller I225-V Driver v2.1.4.3
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Windows 11 64-bit WHQL Certified
                      </div>
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSite === 'speedtest' && (
              <div className="space-y-6 text-center max-w-md mx-auto py-4">
                <h2 className="font-display text-2xl font-bold text-white">
                  2.5GbE Line Speed Verification
                </h2>
                <p className="text-sm text-neutral-400">
                  Test sustained throughput over your Intel(R) I225-V Ethernet link
                </p>
                <button
                  type="button"
                  onClick={runSpeedTest}
                  disabled={speedRunning}
                  className="px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {speedRunning ? 'Measuring Throughput...' : 'Run Speed Test'}
                </button>
                {speedDown !== null && speedUp !== null && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-xs text-neutral-400">Download</div>
                      <div className="font-mono text-2xl text-emerald-400 mt-1 tabular-nums">
                        {speedDown}
                      </div>
                      <div className="text-xs text-neutral-500">Mbps</div>
                    </div>
                    <div className="p-4 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-xs text-neutral-400">Upload</div>
                      <div className="font-mono text-2xl text-sky-400 mt-1 tabular-nums">
                        {speedUp}
                      </div>
                      <div className="text-xs text-neutral-500">Mbps</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSite === 'news' && (
              <article className="space-y-4">
                <div className="text-xs text-neutral-400">
                  Infrastructure · Hardware Engineering · Nov 18, 2026
                </div>
                <h2 className="font-display text-2xl font-bold text-white text-balance">
                  Layered Network Troubleshooting: From UEFI PCIe Enumeration to
                  Host Firewall Policy
                </h2>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  When a workstation reports zero connectivity, isolating the fault
                  across firmware and OS layers saves hours of guesswork. A
                  disabled onboard LAN controller prevents the operating system
                  kernel from ever discovering the NIC on the PCIe bus.
                </p>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Once firmware enables the controller and DHCP issues a valid IPv4
                  lease, application-level failures such as{' '}
                  <span className="font-mono text-neutral-100">
                    ERR_NETWORK_ACCESS_DENIED
                  </span>{' '}
                  point directly to an outbound Windows Defender Firewall rule
                  targeting the browser executable.
                </p>
              </article>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
