import React, { useRef, useState } from 'react';
import { NetworkDiagnosticsState } from '../../types/system';

interface CmdAppProps {
  diagnostics: NetworkDiagnosticsState;
}

export const CmdApp: React.FC<CmdAppProps> = ({ diagnostics }) => {
  const [history, setHistory] = useState<string[]>([
    'Microsoft Windows [Version 10.0.26100.2033]',
    '(c) Microsoft Corporation. All rights reserved.',
    '',
    'Type "help" for available network diagnostics commands (ipconfig, ping 8.8.8.8, curl, netsh).',
    '',
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    const lower = cmd.toLowerCase();
    const nextLines: string[] = [`C:\\Windows\\System32> ${cmd}`];

    if (!cmd) {
      setHistory((h) => [...h, 'C:\\Windows\\System32>']);
      return;
    }

    if (lower === 'cls' || lower === 'clear') {
      setHistory([]);
      return;
    } else if (lower === 'help') {
      nextLines.push(
        'Available diagnostic commands:',
        '  ipconfig                 Display Windows IP configuration',
        '  ping 8.8.8.8             Test Layer-3 ICMP connectivity',
        '  curl https://example.com Test Microsoft Edge / HTTP outbound path',
        '  netsh advfirewall        Inspect active blocking firewall rules',
        '  cls                      Clear console screen'
      );
    } else if (lower.startsWith('ipconfig')) {
      nextLines.push('', 'Windows IP Configuration', '');
      if (!diagnostics.hardwareEnabled) {
        nextLines.push(
          'No active Ethernet or Wireless LAN adapters detected.',
          'Hardware status: Onboard LAN controller disabled in UEFI firmware.'
        );
      } else {
        nextLines.push(
          'Ethernet adapter Ethernet:',
          '   Connection-specific DNS Suffix  . : home.arpa',
          '   Description . . . . . . . . . . . : Intel(R) Ethernet Controller (3) I225-V',
          '   Physical Address. . . . . . . . . : 04-7C-16-9A-4B-2E',
          '   DHCP Enabled. . . . . . . . . . . : Yes',
          '   IPv4 Address. . . . . . . . . . . : 192.168.1.142',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.1.1',
          '   DNS Servers . . . . . . . . . . . : 1.1.1.1'
        );
      }
    } else if (lower.startsWith('ping')) {
      if (!diagnostics.hardwareEnabled) {
        nextLines.push(
          'PING: transmit failed. General failure. No network interface available.'
        );
      } else {
        nextLines.push(
          '',
          'Pinging 8.8.8.8 with 32 bytes of data:',
          'Reply from 8.8.8.8: bytes=32 time=11ms TTL=117',
          'Reply from 8.8.8.8: bytes=32 time=12ms TTL=117',
          'Reply from 8.8.8.8: bytes=32 time=11ms TTL=117',
          '',
          'Ping statistics for 8.8.8.8:',
          '    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)'
        );
      }
    } else if (lower.startsWith('curl')) {
      if (!diagnostics.hardwareEnabled) {
        nextLines.push('curl: (6) Could not resolve host: network is down');
      } else if (diagnostics.browserFirewallBlocked) {
        nextLines.push(
          'curl: (7) Failed to connect — Outbound HTTP/HTTPS (80/443) blocked by Windows Defender Firewall rule "Block Browser Outbound (Microsoft Edge)".'
        );
      } else {
        nextLines.push(
          'HTTP/2 200 OK',
          'content-type: text/html; charset=UTF-8',
          'x-connection: Intel I225-V 2.5GbE (Firewall Permitted)'
        );
      }
    } else if (lower.startsWith('netsh')) {
      nextLines.push(
        'Active Outbound Blocking Rules:',
        diagnostics.browserFirewallBlocked
          ? '  [ENABLED] Block Browser Outbound (Microsoft Edge) -> msedge.exe (TCP/UDP 80,443,8443)'
          : '  None (All browser outbound traffic permitted)'
      );
    } else {
      nextLines.push(
        `'${cmd}' is not recognized as an internal or external command.`
      );
    }

    nextLines.push('');
    setHistory((h) => [...h, ...nextLines]);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
  };

  return (
    <div className="h-full bg-[#0c0c0c] text-neutral-200 font-mono text-xs p-4 flex flex-col overflow-hidden select-text">
      <div className="flex-1 overflow-y-auto space-y-0.5 whitespace-pre-wrap">
        {history.map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand(input);
          setInput('');
        }}
        className="flex items-center gap-2 pt-2 border-t border-neutral-800 mt-2"
      >
        <span className="text-neutral-400 shrink-0">C:\Windows\System32&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ipconfig, ping 8.8.8.8, curl, netsh..."
          className="flex-1 bg-transparent text-white outline-none font-mono text-xs"
          autoFocus
        />
      </form>
    </div>
  );
};
