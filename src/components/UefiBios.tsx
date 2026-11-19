import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Search,
  Thermometer,
  Fan,
  AlertTriangle,
  ArrowLeft,
  Save,
  RotateCcw,
} from 'lucide-react';
import { BiosSettings } from '../types/system';
import { INITIAL_BIOS_SETTINGS } from '../data/initialSystem';

interface UefiBiosProps {
  appliedSettings: BiosSettings;
  onSaveAndExit: (nextSettings: BiosSettings) => void;
  onDiscardAndExit: () => void;
}

type BiosMode = 'ez' | 'advanced';
type AdvancedTab =
  | 'My Favorites'
  | 'Main'
  | 'Ai Tweaker'
  | 'Advanced'
  | 'Monitor'
  | 'Boot'
  | 'Tool'
  | 'Exit';

type AdvancedSubPage =
  | 'root'
  | 'onboard_devices'
  | 'cpu_config'
  | 'pch_config'
  | 'usb_config'
  | 'nvme_config';

export const UefiBios: React.FC<UefiBiosProps> = ({
  appliedSettings,
  onSaveAndExit,
  onDiscardAndExit,
}) => {
  const [mode, setMode] = useState<BiosMode>('ez');
  const [activeTab, setActiveTab] = useState<AdvancedTab>('Advanced');
  const [subPage, setSubPage] = useState<AdvancedSubPage>('root');
  const [pending, setPending] = useState<BiosSettings>({ ...appliedSettings });
  const [selectedHelp, setSelectedHelp] = useState<string>(
    'Select an item to view its hardware configuration description and available values.'
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clockTime, setClockTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const changesList = useMemo(() => {
    const diffs: { label: string; from: string; to: string }[] = [];
    const formatBool = (v: boolean) => (v ? 'Enabled' : 'Disabled');

    if (pending.onboardLanEnabled !== appliedSettings.onboardLanEnabled) {
      diffs.push({
        label: 'Intel(R) I225-V 2.5Gb LAN Controller',
        from: formatBool(appliedSettings.onboardLanEnabled),
        to: formatBool(pending.onboardLanEnabled),
      });
    }
    if (pending.networkStack !== appliedSettings.networkStack) {
      diffs.push({
        label: 'Network Stack',
        from: formatBool(appliedSettings.networkStack),
        to: formatBool(pending.networkStack),
      });
    }
    if (pending.ipv4PxeSupport !== appliedSettings.ipv4PxeSupport) {
      diffs.push({
        label: 'IPv4 PXE Support',
        from: formatBool(appliedSettings.ipv4PxeSupport),
        to: formatBool(pending.ipv4PxeSupport),
      });
    }
    if (pending.wifiControllerEnabled !== appliedSettings.wifiControllerEnabled) {
      diffs.push({
        label: 'Wi-Fi 6E Controller',
        from: formatBool(appliedSettings.wifiControllerEnabled),
        to: formatBool(pending.wifiControllerEnabled),
      });
    }
    if (pending.hdAudioEnabled !== appliedSettings.hdAudioEnabled) {
      diffs.push({
        label: 'HD Audio Controller',
        from: formatBool(appliedSettings.hdAudioEnabled),
        to: formatBool(pending.hdAudioEnabled),
      });
    }
    if (pending.thunderboltSupport !== appliedSettings.thunderboltSupport) {
      diffs.push({
        label: 'Discrete Thunderbolt(TM) Support',
        from: formatBool(appliedSettings.thunderboltSupport),
        to: formatBool(pending.thunderboltSupport),
      });
    }
    if (pending.docpProfile !== appliedSettings.docpProfile) {
      diffs.push({
        label: 'Ai Overclock Tuner (XMP)',
        from: appliedSettings.docpProfile,
        to: pending.docpProfile,
      });
    }
    if (pending.fastBoot !== appliedSettings.fastBoot) {
      diffs.push({
        label: 'Fast Boot',
        from: formatBool(appliedSettings.fastBoot),
        to: formatBool(pending.fastBoot),
      });
    }
    if (pending.secureBoot !== appliedSettings.secureBoot) {
      diffs.push({
        label: 'OS Type (Secure Boot)',
        from: appliedSettings.secureBoot,
        to: pending.secureBoot,
      });
    }
    if (pending.tpmDevice !== appliedSettings.tpmDevice) {
      diffs.push({
        label: 'PTT / TPM 2.0 Device',
        from: appliedSettings.tpmDevice,
        to: pending.tpmDevice,
      });
    }
    if (pending.fanProfile !== appliedSettings.fanProfile) {
      diffs.push({
        label: 'Q-Fan Profile',
        from: appliedSettings.fanProfile,
        to: pending.fanProfile,
      });
    }
    return diffs;
  }, [pending, appliedSettings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F7') {
        e.preventDefault();
        setMode((m) => (m === 'ez' ? 'advanced' : 'ez'));
      } else if (e.key === 'F9') {
        e.preventDefault();
        setShowSearchModal((s) => !s);
      } else if (e.key === 'F10') {
        e.preventDefault();
        setShowSaveModal(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        setPending({
          ...INITIAL_BIOS_SETTINGS,
          onboardLanEnabled: true,
          wifiControllerEnabled: true,
        });
      } else if (e.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showSaveModal) {
          setShowSaveModal(false);
        } else if (showDiscardModal) {
          setShowDiscardModal(false);
        } else if (mode === 'advanced' && subPage !== 'root') {
          setSubPage('root');
        } else {
          setShowDiscardModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, subPage, showSearchModal, showSaveModal, showDiscardModal]);

  const searchItems = useMemo(() => {
    const catalog = [
      {
        title: 'Intel(R) I225-V 2.5Gb LAN Controller',
        path: 'Advanced > Onboard Devices Configuration',
        value: pending.onboardLanEnabled ? 'Enabled' : 'Disabled',
        action: () => {
          setMode('advanced');
          setActiveTab('Advanced');
          setSubPage('onboard_devices');
          setShowSearchModal(false);
        },
      },
      {
        title: 'Network Stack',
        path: 'Advanced > Onboard Devices Configuration',
        value: pending.networkStack ? 'Enabled' : 'Disabled',
        action: () => {
          setMode('advanced');
          setActiveTab('Advanced');
          setSubPage('onboard_devices');
          setShowSearchModal(false);
        },
      },
      {
        title: 'Wi-Fi 6E Controller',
        path: 'Advanced > Onboard Devices Configuration',
        value: pending.wifiControllerEnabled ? 'Enabled' : 'Disabled',
        action: () => {
          setMode('advanced');
          setActiveTab('Advanced');
          setSubPage('onboard_devices');
          setShowSearchModal(false);
        },
      },
      {
        title: 'Ai Overclock Tuner (XMP)',
        path: 'Ai Tweaker',
        value: pending.docpProfile,
        action: () => {
          setMode('advanced');
          setActiveTab('Ai Tweaker');
          setSubPage('root');
          setShowSearchModal(false);
        },
      },
      {
        title: 'Fast Boot',
        path: 'Boot',
        value: pending.fastBoot ? 'Enabled' : 'Disabled',
        action: () => {
          setMode('advanced');
          setActiveTab('Boot');
          setSubPage('root');
          setShowSearchModal(false);
        },
      },
      {
        title: 'Secure Boot / OS Type',
        path: 'Boot',
        value: pending.secureBoot,
        action: () => {
          setMode('advanced');
          setActiveTab('Boot');
          setSubPage('root');
          setShowSearchModal(false);
        },
      },
    ];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
    );
  }, [searchQuery, pending]);

  const fanRpm =
    pending.fanProfile === 'Silent'
      ? '890 RPM'
      : pending.fanProfile === 'Turbo'
      ? '1,680 RPM'
      : '1,180 RPM';

  const dateStr = clockTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const timeStr = clockTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const tabs: AdvancedTab[] = [
    'My Favorites',
    'Main',
    'Ai Tweaker',
    'Advanced',
    'Monitor',
    'Boot',
    'Tool',
    'Exit',
  ];

  const renderToggleRow = (
    label: string,
    value: boolean,
    onChange: (next: boolean) => void,
    helpText: string,
    highlightImportant?: boolean
  ) => (
    <div
      onMouseEnter={() => setSelectedHelp(helpText)}
      className={`flex items-center justify-between gap-4 px-4 py-2.5 border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors ${
        highlightImportant && !value ? 'bg-amber-950/20' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-slate-200 truncate">{label}</span>
        {highlightImportant && !value && (
          <span className="text-xs text-amber-400 font-mono shrink-0">
            [Disabled]
          </span>
        )}
      </div>
      <select
        aria-label={label}
        value={value ? 'Enabled' : 'Disabled'}
        onChange={(e) => onChange(e.target.value === 'Enabled')}
        onFocus={() => setSelectedHelp(helpText)}
        className={`font-mono text-xs px-3 py-1.5 rounded border outline-none cursor-pointer transition-colors ${
          value
            ? 'bg-slate-900 border-emerald-700/70 text-emerald-300'
            : 'bg-slate-900 border-amber-600/70 text-amber-300'
        }`}
      >
        <option value="Disabled">Disabled</option>
        <option value="Enabled">Enabled</option>
      </select>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0b0e14] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top ASUS UEFI Header Bar */}
      <div className="bg-[#121620] border-b border-slate-800 px-5 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-wider text-red-500 text-base">
              ASUS
            </span>
            <span className="font-display font-semibold text-slate-100 text-sm whitespace-nowrap">
              UEFI BIOS Utility — {mode === 'ez' ? 'EZ Mode' : 'Advanced Mode'}
            </span>
          </div>
          <span className="hidden lg:inline text-xs font-mono text-slate-400">
            ROG STRIX Z790-E GAMING WIFI · BIOS Ver. 2402
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono text-slate-300 shrink-0">
          <span className="hidden sm:inline tabular-nums">{dateStr}</span>
          <span className="tabular-nums text-amber-300">{timeStr}</span>
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'ez' ? 'advanced' : 'ez'))}
            className="px-3 py-1 rounded bg-red-600/20 hover:bg-red-600/35 border border-red-500/50 text-red-200 font-sans font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            {mode === 'ez' ? 'Advanced Mode (F7)' : 'EZ Mode (F7)'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {mode === 'ez' ? (
        /* ================= EZ MODE ================= */
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: System Info + DRAM + Onboard Network */}
            <div className="lg:col-span-7 space-y-4">
              {/* System Information */}
              <div className="bg-[#131822] border border-slate-800 rounded p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-red-500" />
                    <h2 className="font-display text-sm font-semibold text-slate-100">
                      Information
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    x64 UEFI Firmware
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Motherboard</span>
                    <span className="font-mono text-slate-200">ROG STRIX Z790-E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">BIOS Version</span>
                    <span className="font-mono text-slate-200">2402 x64</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processor</span>
                    <span className="font-mono text-slate-200">Core i9-14900K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Memory</span>
                    <span className="font-mono text-slate-200">32768 MB DDR5</span>
                  </div>
                </div>
              </div>

              {/* Onboard Network & Hardware Controllers Quick Status */}
              <div className="bg-[#131822] border border-slate-800 rounded p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-red-500" />
                    <h2 className="font-display text-sm font-semibold text-slate-100">
                      Onboard Devices Quick Configuration
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('advanced');
                      setActiveTab('Advanced');
                      setSubPage('onboard_devices');
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open in Advanced Mode</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-4 py-1.5 px-3 rounded bg-slate-900/70 border border-slate-800">
                    <div>
                      <p className="text-slate-100 font-medium">
                        Intel(R) I225-V 2.5Gb LAN Controller
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        Primary wired Ethernet network controller on motherboard rear I/O
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPending((p) => ({
                          ...p,
                          onboardLanEnabled: !p.onboardLanEnabled,
                        }))
                      }
                      className={`px-3 py-1.5 rounded font-mono text-xs border transition-colors cursor-pointer shrink-0 ${
                        pending.onboardLanEnabled
                          ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300'
                          : 'bg-amber-950/50 border-amber-600/70 text-amber-300'
                      }`}
                    >
                      {pending.onboardLanEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1.5 px-3 rounded bg-slate-900/70 border border-slate-800">
                    <div>
                      <p className="text-slate-100 font-medium">
                        Onboard Wi-Fi 6E Controller
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        Integrated wireless AX211 module
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPending((p) => ({
                          ...p,
                          wifiControllerEnabled: !p.wifiControllerEnabled,
                        }))
                      }
                      className={`px-3 py-1.5 rounded font-mono text-xs border transition-colors cursor-pointer shrink-0 ${
                        pending.wifiControllerEnabled
                          ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {pending.wifiControllerEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>

              {/* DRAM & XMP */}
              <div className="bg-[#131822] border border-slate-800 rounded p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-red-500" />
                    <h2 className="font-display text-sm font-semibold text-slate-100">
                      DRAM Status & X.M.P.
                    </h2>
                  </div>
                  <select
                    aria-label="XMP Profile"
                    value={pending.docpProfile}
                    onChange={(e) =>
                      setPending((p) => ({
                        ...p,
                        docpProfile: e.target.value as BiosSettings['docpProfile'],
                      }))
                    }
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200 cursor-pointer"
                  >
                    <option value="Disabled">Disabled (4800 MHz)</option>
                    <option value="XMP I (DDR5-6000)">XMP I (DDR5-6000)</option>
                    <option value="XMP II (DDR5-6000)">XMP II (DDR5-6000)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                    <div className="text-slate-500">DIMM_A2</div>
                    <div className="text-slate-200 mt-0.5">G.SKILL 16384MB</div>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                    <div className="text-slate-500">DIMM_B2</div>
                    <div className="text-slate-200 mt-0.5">G.SKILL 16384MB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hardware Monitor + Q-Fan + Boot Priority */}
            <div className="lg:col-span-5 space-y-4">
              {/* Telemetry */}
              <div className="bg-[#131822] border border-slate-800 rounded p-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <h2 className="font-display text-sm font-semibold text-slate-100">
                    System Thermal & Voltage
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-900/70 rounded border border-slate-800">
                    <div className="text-xs text-slate-400">CPU Temp</div>
                    <div className="font-mono text-lg text-amber-300 mt-1 tabular-nums">
                      38°C
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900/70 rounded border border-slate-800">
                    <div className="text-xs text-slate-400">MB Temp</div>
                    <div className="font-mono text-lg text-slate-200 mt-1 tabular-nums">
                      31°C
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900/70 rounded border border-slate-800">
                    <div className="text-xs text-slate-400">VCore</div>
                    <div className="font-mono text-lg text-slate-200 mt-1 tabular-nums">
                      1.184V
                    </div>
                  </div>
                </div>
              </div>

              {/* Q-Fan Control */}
              <div className="bg-[#131822] border border-slate-800 rounded p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Fan className="w-4 h-4 text-red-500" />
                    <h2 className="font-display text-sm font-semibold text-slate-100">
                      Q-Fan Profile
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 tabular-nums">
                    CPU_FAN: {fanRpm}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(['Silent', 'Standard', 'Turbo'] as const).map((profile) => (
                    <button
                      key={profile}
                      type="button"
                      onClick={() =>
                        setPending((p) => ({ ...p, fanProfile: profile }))
                      }
                      className={`py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        pending.fanProfile === profile
                          ? 'bg-red-600/25 border-red-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
                <svg viewBox="0 0 280 70" className="w-full h-16 bg-slate-950/80 rounded border border-slate-800">
                  <line x1="0" y1="50" x2="280" y2="50" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="30" x2="280" y2="30" stroke="#1e293b" strokeWidth="1" />
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    points={
                      pending.fanProfile === 'Silent'
                        ? '10,58 100,54 180,42 265,16'
                        : pending.fanProfile === 'Turbo'
                        ? '10,40 90,32 165,18 265,10'
                        : '10,52 95,46 175,30 265,12'
                    }
                  />
                </svg>
              </div>

              {/* Boot Priority */}
              <div className="bg-[#131822] border border-slate-800 rounded p-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                  <HardDrive className="w-4 h-4 text-red-500" />
                  <h2 className="font-display text-sm font-semibold text-slate-100">
                    Boot Priority
                  </h2>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                    <span className="text-slate-200 font-medium">
                      1. Windows Boot Manager
                    </span>
                    <span className="font-mono text-slate-400">
                      Samsung 990 PRO 2TB
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800/70 rounded text-slate-500">
                    <span>2. UEFI: Built-in EFI Shell</span>
                    <span className="font-mono">Internal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= ADVANCED MODE ================= */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Tabs */}
          <nav className="bg-[#10141d] border-b border-slate-800 px-4 flex items-center gap-1 overflow-x-auto shrink-0">
            {tabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setSubPage('root');
                  }}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-red-500 text-white bg-slate-800/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {/* Split Body: Left Settings Tree + Right Item Help / Hardware Summary */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left Settings Panel */}
            <div className="lg:col-span-8 border-r border-slate-800 overflow-y-auto bg-[#0d1118]">
              {activeTab === 'My Favorites' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      My Favorites
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Frequently accessed motherboard and network controller toggles
                    </p>
                  </div>
                  {renderToggleRow(
                    'Intel(R) I225-V 2.5Gb LAN Controller',
                    pending.onboardLanEnabled,
                    (v) => setPending((p) => ({ ...p, onboardLanEnabled: v })),
                    'Enables or disables the onboard Intel I225-V 2.5Gb Ethernet controller. When disabled, Windows 11 cannot detect the wired network interface.',
                    true
                  )}
                  {renderToggleRow(
                    'Wi-Fi 6E Controller',
                    pending.wifiControllerEnabled,
                    (v) =>
                      setPending((p) => ({ ...p, wifiControllerEnabled: v })),
                    'Enables or disables the onboard Intel Wi-Fi 6E wireless adapter.'
                  )}
                  {renderToggleRow(
                    'Fast Boot',
                    pending.fastBoot,
                    (v) => setPending((p) => ({ ...p, fastBoot: v })),
                    'Skips full hardware initialization during POST to accelerate OS boot.'
                  )}
                </div>
              )}

              {activeTab === 'Main' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Main System Overview
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-800/80 text-sm">
                    {[
                      ['BIOS Version', '2402 x64'],
                      ['Build Date', '10/14/2026'],
                      ['Processor Type', 'Intel(R) Core(TM) i9-14900K'],
                      ['Processor Speed', '3200 MHz'],
                      ['Total Memory', '32768 MB (DDR5)'],
                      [
                        'Onboard LAN MAC Address',
                        pending.onboardLanEnabled
                          ? '04-7C-16-9A-4B-2E'
                          : 'N/A (Controller Disabled)',
                      ],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-slate-400">{k}</span>
                        <span className="font-mono text-xs text-slate-200">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Ai Tweaker' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Ai Tweaker
                    </h3>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
                    <span className="text-sm text-slate-200">
                      Ai Overclock Tuner
                    </span>
                    <select
                      aria-label="Ai Overclock Tuner"
                      value={pending.docpProfile}
                      onChange={(e) =>
                        setPending((p) => ({
                          ...p,
                          docpProfile: e.target.value as BiosSettings['docpProfile'],
                        }))
                      }
                      className="font-mono text-xs bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded cursor-pointer"
                    >
                      <option value="Disabled">Auto</option>
                      <option value="XMP I (DDR5-6000)">XMP I (DDR5-6000)</option>
                      <option value="XMP II (DDR5-6000)">XMP II (DDR5-6000)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
                    <span className="text-sm text-slate-400">
                      ASUS MultiCore Enhancement
                    </span>
                    <span className="font-mono text-xs text-slate-300">
                      Auto - Lets BIOS Optimize
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
                    <span className="text-sm text-slate-400">
                      CPU Core Voltage
                    </span>
                    <span className="font-mono text-xs text-slate-300">
                      Auto (1.184V)
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'Advanced' && subPage === 'root' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Advanced Configuration
                    </h3>
                  </div>
                  {[
                    {
                      id: 'onboard_devices' as AdvancedSubPage,
                      name: 'Onboard Devices Configuration',
                      hint: !pending.onboardLanEnabled
                        ? 'LAN Controller Disabled'
                        : 'LAN Controller Enabled',
                      highlight: !pending.onboardLanEnabled,
                    },
                    {
                      id: 'cpu_config' as AdvancedSubPage,
                      name: 'CPU Configuration',
                      hint: 'Intel VT-x / Hyper-Threading',
                      highlight: false,
                    },
                    {
                      id: 'pch_config' as AdvancedSubPage,
                      name: 'PCH Storage Configuration',
                      hint: 'SATA / PCIe M.2',
                      highlight: false,
                    },
                    {
                      id: 'usb_config' as AdvancedSubPage,
                      name: 'USB Configuration',
                      hint: 'XHCI Hand-off Enabled',
                      highlight: false,
                    },
                    {
                      id: 'nvme_config' as AdvancedSubPage,
                      name: 'NVMe Configuration',
                      hint: 'Samsung SSD 990 PRO 2TB',
                      highlight: false,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSubPage(item.id)}
                      onMouseEnter={() =>
                        setSelectedHelp(
                          item.id === 'onboard_devices'
                            ? 'Configure integrated motherboard controllers including Intel 2.5Gb LAN, Wi-Fi 6E, Network Stack, HD Audio, and Thunderbolt.'
                            : `View and configure ${item.name}.`
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-800/80 hover:bg-slate-800/50 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-slate-100 font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-xs ${
                          item.highlight ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'Advanced' && subPage === 'onboard_devices' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubPage('root')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      aria-label="Back to Advanced menu"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">
                        Advanced &gt; Onboard Devices Configuration
                      </h3>
                      <p className="text-xs text-slate-400">
                        Enable or disable integrated motherboard PCIe controllers
                      </p>
                    </div>
                  </div>

                  {renderToggleRow(
                    'Intel(R) I225-V 2.5Gb LAN Controller',
                    pending.onboardLanEnabled,
                    (v) => setPending((p) => ({ ...p, onboardLanEnabled: v })),
                    'Enable or disable the onboard Intel I225-V 2.5Gb Ethernet network controller. Must be Enabled for Windows 11 to enumerate Ethernet hardware.',
                    true
                  )}
                  {renderToggleRow(
                    'Network Stack',
                    pending.networkStack,
                    (v) => setPending((p) => ({ ...p, networkStack: v })),
                    'Enable or disable UEFI Network Stack (required only for PXE network booting).'
                  )}
                  {renderToggleRow(
                    'IPv4 PXE Support',
                    pending.ipv4PxeSupport,
                    (v) => setPending((p) => ({ ...p, ipv4PxeSupport: v })),
                    'Enable IPv4 PXE boot support when Network Stack is active.'
                  )}
                  {renderToggleRow(
                    'Wi-Fi 6E Controller',
                    pending.wifiControllerEnabled,
                    (v) =>
                      setPending((p) => ({ ...p, wifiControllerEnabled: v })),
                    'Enable or disable the onboard Intel Wi-Fi 6E / Bluetooth module.'
                  )}
                  {renderToggleRow(
                    'HD Audio Controller',
                    pending.hdAudioEnabled,
                    (v) => setPending((p) => ({ ...p, hdAudioEnabled: v })),
                    'Enable or disable the onboard Realtek ALC4080 High Definition Audio codec.'
                  )}
                  {renderToggleRow(
                    'Discrete Thunderbolt(TM) Support',
                    pending.thunderboltSupport,
                    (v) => setPending((p) => ({ ...p, thunderboltSupport: v })),
                    'Enable or disable rear USB4 / Thunderbolt controller support.'
                  )}
                </div>
              )}

              {activeTab === 'Advanced' &&
                subPage !== 'root' &&
                subPage !== 'onboard_devices' && (
                  <div>
                    <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSubPage('root')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h3 className="text-sm font-semibold text-slate-100">
                        Advanced &gt;{' '}
                        {subPage === 'cpu_config'
                          ? 'CPU Configuration'
                          : subPage === 'pch_config'
                          ? 'PCH Storage Configuration'
                          : subPage === 'usb_config'
                          ? 'USB Configuration'
                          : 'NVMe Configuration'}
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-800/80 text-sm">
                      <div className="flex justify-between px-4 py-2.5">
                        <span className="text-slate-300">Controller Status</span>
                        <span className="font-mono text-xs text-emerald-400">
                          Operational
                        </span>
                      </div>
                      <div className="flex justify-between px-4 py-2.5">
                        <span className="text-slate-300">
                          {subPage === 'nvme_config'
                            ? 'M.2_1 Drive'
                            : 'Hardware Mode'}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {subPage === 'nvme_config'
                            ? 'Samsung SSD 990 PRO 2TB (2000.3 GB)'
                            : 'Auto / PCIe Gen4'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {activeTab === 'Monitor' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Hardware Monitor
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-800/80 text-sm">
                    {[
                      ['CPU Temperature', '+38°C'],
                      ['Motherboard Temperature', '+31°C'],
                      ['CPU Core Voltage', '1.184 V'],
                      ['+12V Voltage', '12.096 V'],
                      ['+5V Voltage', '5.040 V'],
                      ['CPU_FAN1 Speed', fanRpm],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between px-4 py-2.5">
                        <span className="text-slate-300">{k}</span>
                        <span className="font-mono text-xs text-amber-300 tabular-nums">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Boot' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Boot Configuration
                    </h3>
                  </div>
                  {renderToggleRow(
                    'Fast Boot',
                    pending.fastBoot,
                    (v) => setPending((p) => ({ ...p, fastBoot: v })),
                    'Accelerates Windows 11 startup by skipping extended POST checks.'
                  )}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
                    <span className="text-sm text-slate-200">
                      Secure Boot · OS Type
                    </span>
                    <select
                      aria-label="Secure Boot OS Type"
                      value={pending.secureBoot}
                      onChange={(e) =>
                        setPending((p) => ({
                          ...p,
                          secureBoot: e.target.value as BiosSettings['secureBoot'],
                        }))
                      }
                      className="font-mono text-xs bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded cursor-pointer"
                    >
                      <option value="Windows UEFI mode">Windows UEFI mode</option>
                      <option value="Other OS">Other OS</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'Tool' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      ASUS UEFI Tools
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-800/80 text-sm">
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-slate-200">ASUS EZ Flash 3 Utility</span>
                      <span className="font-mono text-xs text-slate-400">
                        BIOS 2402 Ready
                      </span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-slate-200">ASUS Secure Erase</span>
                      <span className="font-mono text-xs text-slate-400">
                        NVMe Supported
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Exit' && (
                <div>
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Exit Options
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setShowSaveModal(true)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-medium text-emerald-300">
                          Save Changes &amp; Reset (F10)
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Write pending UEFI configuration to NVRAM and boot Windows 11
                        </div>
                      </div>
                      <Save className="w-4 h-4 text-emerald-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDiscardModal(true)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200">
                          Discard Changes &amp; Exit (ESC)
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Exit UEFI setup without saving changes
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPending({
                          ...INITIAL_BIOS_SETTINGS,
                          onboardLanEnabled: true,
                          wifiControllerEnabled: true,
                        })
                      }
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200">
                          Load Optimized Defaults (F5)
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Restore factory recommended defaults (enables Onboard LAN)
                        </div>
                      </div>
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Pane: Item Specific Help + Pending Changes */}
            <div className="lg:col-span-4 bg-[#11151e] p-5 flex flex-col justify-between gap-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="font-display text-xs uppercase tracking-wider text-red-400 font-semibold mb-2">
                    Item Specific Help
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedHelp}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="font-display text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Pending NVRAM Changes ({changesList.length})
                  </h4>
                  {changesList.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No unsaved configuration changes.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {changesList.map((diff) => (
                        <li
                          key={diff.label}
                          className="p-2 rounded bg-slate-900/90 border border-slate-800"
                        >
                          <div className="text-slate-200 font-medium">
                            {diff.label}
                          </div>
                          <div className="font-mono text-slate-400 mt-1">
                            {diff.from} &rarr;{' '}
                            <span className="text-emerald-400">{diff.to}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-1 font-mono">
                <p>Hardware Target: Windows 11 Pro</p>
                <p>
                  LAN Status:{' '}
                  <span
                    className={
                      pending.onboardLanEnabled
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    {pending.onboardLanEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom UEFI Action Footer */}
      <div className="bg-[#121620] border-t border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-4 text-slate-400 font-mono">
          <span>F5: Optimized Defaults</span>
          <span>F7: {mode === 'ez' ? 'Advanced Mode' : 'EZ Mode'}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search (F9)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDiscardModal(true)}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
          >
            Discard &amp; Exit (ESC)
          </button>
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save &amp; Exit (F10)</span>
          </button>
        </div>
      </div>

      {/* F9 Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#141923] border border-slate-700 rounded shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-white">
                Search UEFI BIOS Settings (F9)
              </span>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type setting name (e.g. LAN, Network, Wi-Fi, Boot)..."
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/80 border border-slate-800 rounded">
                {searchItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-100">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.path}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-amber-300 shrink-0">
                      {item.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* F10 Save & Exit Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#141923] border border-slate-700 rounded shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-display text-sm font-semibold text-white">
                Save &amp; Reset
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {changesList.length === 0 ? (
                <p className="text-sm text-slate-300">
                  You have not made any changes to the BIOS settings. Reboot to
                  Windows 11 anyway?
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-200">
                    Save the following configuration changes and reset?
                  </p>
                  <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2 max-h-48 overflow-y-auto">
                    {changesList.map((diff) => (
                      <div key={diff.label} className="text-xs">
                        <div className="text-slate-200 font-medium">
                          {diff.label}
                        </div>
                        <div className="font-mono text-slate-400 mt-0.5">
                          [{diff.from}] &rarr;{' '}
                          <span className="text-emerald-400">[{diff.to}]</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    onSaveAndExit(pending);
                  }}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-xs font-medium text-white cursor-pointer"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discard & Exit Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-[#141923] border border-slate-700 rounded shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-display text-sm font-semibold text-white">
                Discard Changes &amp; Exit
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-300">
                Discard any unsaved changes and boot into Windows 11?
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardModal(false);
                    onDiscardAndExit();
                  }}
                  className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white cursor-pointer"
                >
                  Discard &amp; Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
