export type BootPhase =
  | 'post'
  | 'uefi'
  | 'os_booting'
  | 'lockscreen'
  | 'desktop';

export type WindowId =
  | 'edge'
  | 'firewall'
  | 'settings'
  | 'devicemanager'
  | 'cmd';

export interface BiosSettings {
  onboardLanEnabled: boolean;
  networkStack: boolean;
  ipv4PxeSupport: boolean;
  wifiControllerEnabled: boolean;
  hdAudioEnabled: boolean;
  thunderboltSupport: boolean;
  docpProfile: 'Disabled' | 'XMP I (DDR5-6000)' | 'XMP II (DDR5-6000)';
  fastBoot: boolean;
  secureBoot: 'Windows UEFI mode' | 'Other OS';
  tpmDevice: 'Enabled' | 'Disabled';
  fanProfile: 'Standard' | 'Silent' | 'Turbo';
}

export interface FirewallRule {
  id: string;
  name: string;
  direction: 'Outbound' | 'Inbound';
  group: string;
  profile: 'All' | 'Private' | 'Public' | 'Domain';
  enabled: boolean;
  action: 'Allow' | 'Block';
  program: string;
  protocol: string;
  localPort: string;
  remotePort: string;
  description: string;
  isBrowserBlockRule?: boolean;
}

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NetworkDiagnosticsState {
  hardwareEnabled: boolean;
  browserFirewallBlocked: boolean;
  hasLocalNetwork: boolean;
  hasInternetAccess: boolean;
}
