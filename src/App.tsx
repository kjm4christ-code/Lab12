import { useMemo, useState } from 'react';
import {
  BiosSettings,
  BootPhase,
  FirewallRule,
  NetworkDiagnosticsState,
} from './types/system';
import {
  INITIAL_BIOS_SETTINGS,
  INITIAL_FIREWALL_RULES,
} from './data/initialSystem';
import { HardwareBezelBar } from './components/HardwareBezelBar';
import { PostBootScreen } from './components/PostBootScreen';
import { UefiBios } from './components/UefiBios';
import { OsBootSpinner } from './components/OsBootSpinner';
import { Win11LockScreen } from './components/Win11LockScreen';
import { Win11Desktop } from './components/Win11Desktop';

export default function App() {
  const [bootPhase, setBootPhase] = useState<BootPhase>('post');
  const [biosSettings, setBiosSettings] = useState<BiosSettings>(
    INITIAL_BIOS_SETTINGS
  );
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>(
    INITIAL_FIREWALL_RULES
  );

  const diagnostics: NetworkDiagnosticsState = useMemo(() => {
    const hardwareEnabled =
      biosSettings.onboardLanEnabled || biosSettings.wifiControllerEnabled;
    const browserRule = firewallRules.find((r) => r.isBrowserBlockRule);
    const browserFirewallBlocked = Boolean(
      browserRule && browserRule.enabled && browserRule.action === 'Block'
    );
    const hasLocalNetwork = hardwareEnabled;
    const hasInternetAccess = hardwareEnabled && !browserFirewallBlocked;

    return {
      hardwareEnabled,
      browserFirewallBlocked,
      hasLocalNetwork,
      hasInternetAccess,
    };
  }, [biosSettings, firewallRules]);

  const handleUpdateFirewallRule = (
    id: string,
    patch: Partial<FirewallRule>
  ) => {
    setFirewallRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule))
    );
  };

  const handleSaveBiosAndExit = (nextSettings: BiosSettings) => {
    setBiosSettings(nextSettings);
    setBootPhase('os_booting');
  };

  const handleFullReset = () => {
    setBiosSettings(INITIAL_BIOS_SETTINGS);
    setFirewallRules(INITIAL_FIREWALL_RULES);
    setBootPhase('post');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-950 overflow-hidden">
      <HardwareBezelBar
        bootPhase={bootPhase}
        diagnostics={diagnostics}
        onRebootToUefi={() => setBootPhase('uefi')}
        onPowerReset={() => setBootPhase('post')}
        onFullResetSimulation={handleFullReset}
      />

      {bootPhase === 'post' && (
        <PostBootScreen
          biosSettings={biosSettings}
          onEnterUefi={() => setBootPhase('uefi')}
          onBootOs={() => setBootPhase('os_booting')}
        />
      )}

      {bootPhase === 'uefi' && (
        <UefiBios
          appliedSettings={biosSettings}
          onSaveAndExit={handleSaveBiosAndExit}
          onDiscardAndExit={() => setBootPhase('os_booting')}
        />
      )}

      {bootPhase === 'os_booting' && (
        <OsBootSpinner onComplete={() => setBootPhase('lockscreen')} />
      )}

      {bootPhase === 'lockscreen' && (
        <Win11LockScreen
          hasLocalNetwork={diagnostics.hasLocalNetwork}
          hasInternetAccess={diagnostics.hasInternetAccess}
          onLogin={() => setBootPhase('desktop')}
          onRestartToUefi={() => setBootPhase('uefi')}
        />
      )}

      {bootPhase === 'desktop' && (
        <Win11Desktop
          biosSettings={biosSettings}
          firewallRules={firewallRules}
          diagnostics={diagnostics}
          onUpdateFirewallRule={handleUpdateFirewallRule}
          onRebootToUefi={() => setBootPhase('uefi')}
          onRestartOs={() => setBootPhase('post')}
          onLockScreen={() => setBootPhase('lockscreen')}
        />
      )}
    </div>
  );
}
