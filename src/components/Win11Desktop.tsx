import React, { useRef, useState } from 'react';
import {
  Globe,
  Shield,
  Settings,
  Cpu,
  Terminal,
  MonitorCheck,
  Volume2,
  Power,
  RotateCw,
  Lock,
  Minus,
  Square,
  X,
  WifiOff,
  ShieldAlert,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react';
import {
  BiosSettings,
  FirewallRule,
  NetworkDiagnosticsState,
  WindowId,
  WindowState,
} from '../types/system';
import { INITIAL_WINDOWS, WALLPAPER_URL } from '../data/initialSystem';
import { EdgeBrowserApp } from './apps/EdgeBrowserApp';
import { FirewallApp } from './apps/FirewallApp';
import { SettingsApp } from './apps/SettingsApp';
import { DeviceManagerApp } from './apps/DeviceManagerApp';
import { CmdApp } from './apps/CmdApp';

interface Win11DesktopProps {
  biosSettings: BiosSettings;
  firewallRules: FirewallRule[];
  diagnostics: NetworkDiagnosticsState;
  onUpdateFirewallRule: (id: string, patch: Partial<FirewallRule>) => void;
  onRebootToUefi: () => void;
  onRestartOs: () => void;
  onLockScreen: () => void;
}

export const Win11Desktop: React.FC<Win11DesktopProps> = ({
  biosSettings,
  firewallRules,
  diagnostics,
  onUpdateFirewallRule,
  onRebootToUefi,
  onRestartOs,
  onLockScreen,
}) => {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(
    () => ({
      ...INITIAL_WINDOWS,
      edge: { ...INITIAL_WINDOWS.edge, isOpen: true, zIndex: 20 },
    })
  );
  const [topZ, setTopZ] = useState(25);
  const [startOpen, setStartOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);
  const [quickNetOpen, setQuickNetOpen] = useState(false);
  const [startSearch, setStartSearch] = useState('');
  const [wallpaperError, setWallpaperError] = useState(false);

  const dragRef = useRef<{
    id: WindowId;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const openOrFocusApp = (id: WindowId) => {
    setStartOpen(false);
    setPowerMenuOpen(false);
    setQuickNetOpen(false);
    setTopZ((z) => {
      const nextZ = z + 1;
      setWindows((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          isOpen: true,
          isMinimized: false,
          zIndex: nextZ,
        },
      }));
      return nextZ;
    });
  };

  const toggleTaskbarApp = (id: WindowId) => {
    const win = windows[id];
    if (!win.isOpen) {
      openOrFocusApp(id);
      return;
    }
    if (win.isMinimized) {
      openOrFocusApp(id);
      return;
    }
    const maxZ = Math.max(
      ...Object.values(windows)
        .filter((w) => w.isOpen && !w.isMinimized)
        .map((w) => w.zIndex),
      0
    );
    if (win.zIndex === maxZ) {
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], isMinimized: true },
      }));
    } else {
      openOrFocusApp(id);
    }
  };

  const closeWindow = (id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMaximized: false },
    }));
  };

  const minimizeWindow = (id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
  };

  const toggleMaximizeWindow = (id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized },
    }));
  };

  const handleTitleMouseDown = (
    e: React.MouseEvent,
    id: WindowId
  ) => {
    if ((e.target as HTMLElement).closest('button')) return;
    openOrFocusApp(id);
    const win = windows[id];
    if (win.isMaximized) return;
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
    };
  };

  const handleDesktopMouseMove = (e: React.MouseEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setWindows((prev) => ({
      ...prev,
      [drag.id]: {
        ...prev[drag.id],
        x: Math.max(0, drag.origX + dx),
        y: Math.max(0, drag.origY + dy),
      },
    }));
  };

  const handleDesktopMouseUp = () => {
    dragRef.current = null;
  };

  const desktopApps: {
    id: WindowId;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'edge',
      label: 'Microsoft Edge',
      shortLabel: 'Edge',
      icon: <Globe className="w-6 h-6 text-sky-400" />,
    },
    {
      id: 'firewall',
      label: 'Windows Defender Firewall',
      shortLabel: 'Firewall',
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      shortLabel: 'Settings',
      icon: <Settings className="w-6 h-6 text-slate-200" />,
    },
    {
      id: 'devicemanager',
      label: 'Device Manager',
      shortLabel: 'Device Mgr',
      icon: <Cpu className="w-6 h-6 text-amber-300" />,
    },
    {
      id: 'cmd',
      label: 'Command Prompt',
      shortLabel: 'Terminal',
      icon: <Terminal className="w-6 h-6 text-neutral-200" />,
    },
  ];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const renderWindowContent = (id: WindowId) => {
    switch (id) {
      case 'edge':
        return (
          <EdgeBrowserApp
            diagnostics={diagnostics}
            onOpenApp={openOrFocusApp}
            onRebootToUefi={onRebootToUefi}
          />
        );
      case 'firewall':
        return (
          <FirewallApp
            rules={firewallRules}
            onUpdateRule={onUpdateFirewallRule}
          />
        );
      case 'settings':
        return (
          <SettingsApp
            diagnostics={diagnostics}
            onOpenApp={openOrFocusApp}
            onRebootToUefi={onRebootToUefi}
          />
        );
      case 'devicemanager':
        return <DeviceManagerApp biosSettings={biosSettings} />;
      case 'cmd':
        return <CmdApp diagnostics={diagnostics} />;
    }
  };

  return (
    <div
      onMouseMove={handleDesktopMouseMove}
      onMouseUp={handleDesktopMouseUp}
      onClick={() => {
        if (startOpen) setStartOpen(false);
        if (quickNetOpen) setQuickNetOpen(false);
      }}
      className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col justify-between"
    >
      {/* Windows 11 Bloom Wallpaper */}
      {!wallpaperError ? (
        <img
          src={WALLPAPER_URL}
          alt="Windows 11 desktop wallpaper"
          referrerPolicy="no-referrer"
          onError={() => setWallpaperError(true)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 pointer-events-none" />
      )}

      {/* Desktop Canvas Area */}
      <div className="relative z-10 flex-1 overflow-hidden p-4">
        {/* Desktop Shortcut Icons Grid */}
        <div className="flex flex-col gap-3 w-24">
          {desktopApps.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openOrFocusApp(app.id);
              }}
              className="group flex flex-col items-center gap-1.5 p-2 rounded hover:bg-white/10 active:bg-white/15 transition-colors text-center cursor-pointer"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-900/75 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                {app.icon}
              </div>
              <span className="text-[11px] font-medium text-white drop-shadow leading-tight line-clamp-2">
                {app.label}
              </span>
            </button>
          ))}
        </div>

        {/* Open Application Windows */}
        {(Object.values(windows) as WindowState[]).map((win) => {
          if (!win.isOpen || win.isMinimized) return null;
          const appMeta = desktopApps.find((a) => a.id === win.id);

          return (
            <div
              key={win.id}
              onMouseDown={() => openOrFocusApp(win.id)}
              onClick={(e) => e.stopPropagation()}
              style={
                win.isMaximized
                  ? {
                      left: 0,
                      top: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: win.zIndex,
                    }
                  : {
                      left: win.x,
                      top: win.y,
                      width: win.width,
                      height: win.height,
                      maxWidth: 'calc(100vw - 24px)',
                      maxHeight: 'calc(100vh - 104px)',
                      zIndex: win.zIndex,
                    }
              }
              className={`absolute flex flex-col bg-[#1b1d22] border border-neutral-700/80 shadow-2xl overflow-hidden ${
                win.isMaximized ? 'rounded-none' : 'rounded-lg'
              }`}
            >
              {/* Window Titlebar */}
              <div
                onMouseDown={(e) => handleTitleMouseDown(e, win.id)}
                onDoubleClick={() => toggleMaximizeWindow(win.id)}
                className="h-9 bg-[#14161a] border-b border-neutral-800 px-3 flex items-center justify-between shrink-0 cursor-move"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="scale-75 shrink-0">{appMeta?.icon}</span>
                  <span className="text-xs font-medium text-neutral-200 truncate">
                    {win.title}
                  </span>
                </div>

                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => minimizeWindow(win.id)}
                    className="w-8 h-7 flex items-center justify-center hover:bg-white/10 text-neutral-300 rounded cursor-pointer"
                    aria-label={`Minimize ${win.title}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMaximizeWindow(win.id)}
                    className="w-8 h-7 flex items-center justify-center hover:bg-white/10 text-neutral-300 rounded cursor-pointer"
                    aria-label={`Maximize ${win.title}`}
                  >
                    <Square className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => closeWindow(win.id)}
                    className="w-8 h-7 flex items-center justify-center hover:bg-red-600 text-neutral-300 hover:text-white rounded cursor-pointer"
                    aria-label={`Close ${win.title}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Window Body */}
              <div className="flex-1 overflow-hidden">
                {renderWindowContent(win.id)}
              </div>
            </div>
          );
        })}

        {/* Start Menu Flyout */}
        {startOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92vw] max-w-[480px] bg-[#1b1e25]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-5 space-y-5">
              <input
                type="text"
                value={startSearch}
                onChange={(e) => setStartSearch(e.target.value)}
                placeholder="Type here to search apps..."
                className="w-full px-3.5 py-2 rounded-full bg-neutral-900/90 border border-neutral-700 text-xs text-white placeholder:text-neutral-400 outline-none focus:border-sky-500"
              />

              <div>
                <div className="text-xs font-semibold text-neutral-200 mb-3">
                  Pinned
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {desktopApps
                    .filter((a) =>
                      a.label.toLowerCase().includes(startSearch.toLowerCase())
                    )
                    .map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => openOrFocusApp(app.id)}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-white/10 transition-colors text-center cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-neutral-800/80 flex items-center justify-center">
                          {app.icon}
                        </div>
                        <span className="text-[11px] text-neutral-200 truncate w-full">
                          {app.shortLabel}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Start Menu Bottom User + Power Bar */}
            <div className="bg-black/35 border-t border-white/10 px-5 py-3 flex items-center justify-between relative">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-xs font-semibold text-sky-200">
                  A
                </div>
                <span className="text-xs font-medium text-neutral-200">
                  Administrator
                </span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPowerMenuOpen((o) => !o)}
                  className="p-2 rounded hover:bg-white/10 text-neutral-200 cursor-pointer"
                  title="Power options"
                >
                  <Power className="w-4 h-4" />
                </button>

                {powerMenuOpen && (
                  <div className="absolute bottom-11 right-0 w-52 bg-[#23262e] border border-white/15 rounded-lg shadow-2xl py-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStartOpen(false);
                        setPowerMenuOpen(false);
                        onLockScreen();
                      }}
                      className="w-full px-3.5 py-2 hover:bg-white/10 flex items-center gap-2.5 text-neutral-200 text-left cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStartOpen(false);
                        setPowerMenuOpen(false);
                        onRestartOs();
                      }}
                      className="w-full px-3.5 py-2 hover:bg-white/10 flex items-center gap-2.5 text-neutral-200 text-left cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Restart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStartOpen(false);
                        setPowerMenuOpen(false);
                        onRebootToUefi();
                      }}
                      className="w-full px-3.5 py-2 hover:bg-sky-600/25 flex items-center gap-2.5 text-sky-300 font-medium text-left cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Restart to UEFI Firmware</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Taskbar Quick Network Flyout */}
        {quickNetOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 right-3 w-80 bg-[#1c1f26]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl z-50 p-4 space-y-3 text-xs"
          >
            <div className="flex items-start gap-3">
              {!diagnostics.hardwareEnabled ? (
                <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : diagnostics.browserFirewallBlocked ? (
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-white text-sm">
                  {!diagnostics.hardwareEnabled
                    ? 'No internet access'
                    : diagnostics.browserFirewallBlocked
                    ? 'Ethernet · Browser Blocked'
                    : 'Ethernet · Connected'}
                </div>
                <p className="text-neutral-400 mt-1 leading-relaxed">
                  {!diagnostics.hardwareEnabled
                    ? 'No network adapter detected. Enable Intel I225-V LAN Controller in ASUS UEFI BIOS.'
                    : diagnostics.browserFirewallBlocked
                    ? 'Local IP 192.168.1.142 assigned, but Windows Firewall is blocking msedge.exe.'
                    : 'Intel(R) I225-V 2.5GbE connected with full internet access.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
              {!diagnostics.hardwareEnabled ? (
                <button
                  type="button"
                  onClick={onRebootToUefi}
                  className="w-full py-2 px-3 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium cursor-pointer"
                >
                  Restart to ASUS UEFI BIOS
                </button>
              ) : (
                diagnostics.browserFirewallBlocked && (
                  <button
                    type="button"
                    onClick={() => openOrFocusApp('firewall')}
                    className="w-full py-2 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium cursor-pointer"
                  >
                    Open Windows Defender Firewall
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => openOrFocusApp('settings')}
                className="w-full py-1.5 px-3 rounded bg-white/10 hover:bg-white/15 text-neutral-200 cursor-pointer"
              >
                Network &amp; Internet settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Windows 11 Centered Taskbar */}
      <footer
        onClick={(e) => e.stopPropagation()}
        className="relative z-40 h-12 bg-[#14161b]/90 backdrop-blur-xl border-t border-white/10 px-3 flex items-center justify-between shrink-0"
      >
        <div className="w-32 hidden md:block text-[11px] text-neutral-400 font-medium truncate">
          ASUS ROG Z790-E
        </div>

        {/* Center Pinned App Icons */}
        <div className="flex items-center gap-1.5 mx-auto">
          <button
            type="button"
            onClick={() => {
              setQuickNetOpen(false);
              setStartOpen((s) => !s);
            }}
            className={`w-9 h-9 rounded flex items-center justify-center transition-colors cursor-pointer ${
              startOpen ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            title="Start"
          >
            <LayoutGrid className="w-5 h-5 text-sky-400" />
          </button>

          {desktopApps.map((app) => {
            const win = windows[app.id];
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => toggleTaskbarApp(app.id)}
                className={`relative w-9 h-9 rounded flex items-center justify-center transition-colors cursor-pointer ${
                  win.isOpen && !win.isMinimized
                    ? 'bg-white/15'
                    : 'hover:bg-white/10'
                }`}
                title={app.label}
              >
                <span className="scale-75">{app.icon}</span>
                {win.isOpen && (
                  <span
                    className={`absolute bottom-0.5 h-0.5 rounded-full transition-all ${
                      win.isMinimized ? 'w-1.5 bg-neutral-400' : 'w-4 bg-sky-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right System Tray */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setStartOpen(false);
              setQuickNetOpen((q) => !q);
            }}
            className={`px-2 py-1.5 rounded flex items-center gap-2 transition-colors cursor-pointer ${
              quickNetOpen ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            title={
              !diagnostics.hardwareEnabled
                ? 'Not connected - No network adapters'
                : 'Ethernet connected'
            }
          >
            {diagnostics.hardwareEnabled ? (
              <MonitorCheck className="w-4 h-4 text-white" />
            ) : (
              <Globe className="w-4 h-4 text-neutral-300" />
            )}
            <Volume2 className="w-4 h-4 text-neutral-200 hidden sm:inline" />
          </button>

          <div className="text-right leading-tight px-1.5 text-[11px] text-neutral-200 tabular-nums">
            <div>{timeStr}</div>
            <div className="text-neutral-400">{dateStr}</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
