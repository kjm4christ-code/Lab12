import React, { useMemo, useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Ban,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { FirewallRule } from '../../types/system';

interface FirewallAppProps {
  rules: FirewallRule[];
  onUpdateRule: (id: string, patch: Partial<FirewallRule>) => void;
}

type TreeSection = 'overview' | 'inbound' | 'outbound';

export const FirewallApp: React.FC<FirewallAppProps> = ({
  rules,
  onUpdateRule,
}) => {
  const [section, setSection] = useState<TreeSection>('outbound');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('rule-block-msedge');
  const [filterQuery, setFilterQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'block' | 'enabled'>('all');
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);

  const visibleRules = useMemo(() => {
    const dir = section === 'inbound' ? 'Inbound' : 'Outbound';
    return rules.filter((r) => {
      if (section !== 'overview' && r.direction !== dir) return false;
      if (filterMode === 'block' && r.action !== 'Block') return false;
      if (filterMode === 'enabled' && !r.enabled) return false;
      const q = filterQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.program.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q)
      );
    });
  }, [rules, section, filterMode, filterQuery]);

  const selectedRule = useMemo(
    () => rules.find((r) => r.id === selectedRuleId) ?? visibleRules[0] ?? null,
    [rules, selectedRuleId, visibleRules]
  );

  // Properties modal draft state
  const [draftEnabled, setDraftEnabled] = useState(false);
  const [draftAction, setDraftAction] = useState<'Allow' | 'Block'>('Allow');

  const openProperties = (rule: FirewallRule) => {
    setDraftEnabled(rule.enabled);
    setDraftAction(rule.action);
    setShowPropertiesModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-[#1b1d22] text-slate-100 select-none text-xs">
      {/* MMC Toolbar */}
      <div className="bg-[#23262d] border-b border-neutral-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span className="font-medium text-neutral-100">
            Windows Defender Firewall with Advanced Security on Local Computer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter rules..."
            className="bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-sky-500 w-44"
          />
          <select
            aria-label="Filter rules by status"
            value={filterMode}
            onChange={(e) =>
              setFilterMode(e.target.value as 'all' | 'block' | 'enabled')
            }
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 cursor-pointer"
          >
            <option value="all">All Rules</option>
            <option value="block">Block Rules Only</option>
            <option value="enabled">Enabled Only</option>
          </select>
        </div>
      </div>

      {/* 3-Pane MMC Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Navigation Tree */}
        <aside className="col-span-3 bg-[#17191e] border-r border-neutral-800 p-2 space-y-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => setSection('overview')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-left cursor-pointer ${
              section === 'overview'
                ? 'bg-sky-600/25 text-white'
                : 'text-neutral-300 hover:bg-neutral-800/70'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('inbound')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-left cursor-pointer ${
              section === 'inbound'
                ? 'bg-sky-600/25 text-white'
                : 'text-neutral-300 hover:bg-neutral-800/70'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Inbound Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('outbound')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-left cursor-pointer ${
              section === 'outbound'
                ? 'bg-sky-600/25 text-white'
                : 'text-neutral-300 hover:bg-neutral-800/70'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Outbound Rules</span>
          </button>
        </aside>

        {/* Center Rules Table / Overview */}
        <main className="col-span-6 border-r border-neutral-800 overflow-auto bg-[#1b1d22]">
          {section === 'overview' ? (
            <div className="p-5 space-y-4">
              <h3 className="font-display text-sm font-semibold text-white">
                Windows Defender Firewall Profiles
              </h3>
              {(['Domain Profile', 'Private Profile', 'Public Profile'] as const).map(
                (profile) => (
                  <div
                    key={profile}
                    className="p-3.5 rounded bg-neutral-900 border border-neutral-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-100">
                        {profile}
                      </span>
                      <span className="text-emerald-400 font-medium">
                        Firewall is on
                      </span>
                    </div>
                    <p className="text-neutral-400">
                      Inbound connections: Block (default) · Outbound connections:
                      Allow (unless overridden by an enabled Outbound Block rule)
                    </p>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => setSection('outbound')}
                className="px-3.5 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium cursor-pointer"
              >
                Inspect Outbound Rules
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#23262d] border-b border-neutral-700 sticky top-0 text-[11px] text-neutral-300">
                <tr>
                  <th className="py-2 px-3 font-medium">Name</th>
                  <th className="py-2 px-2 font-medium">Profile</th>
                  <th className="py-2 px-2 font-medium">Enabled</th>
                  <th className="py-2 px-2 font-medium">Action</th>
                  <th className="py-2 px-2 font-medium">Remote Port</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70">
                {visibleRules.map((rule) => {
                  const selected = selectedRule?.id === rule.id;
                  const isActiveBlock = rule.enabled && rule.action === 'Block';
                  return (
                    <tr
                      key={rule.id}
                      onClick={() => setSelectedRuleId(rule.id)}
                      onDoubleClick={() => openProperties(rule)}
                      className={`cursor-pointer transition-colors ${
                        selected
                          ? 'bg-sky-600/25 text-white'
                          : isActiveBlock
                          ? 'bg-red-950/20 hover:bg-red-950/35 text-neutral-100'
                          : 'hover:bg-neutral-800/60 text-neutral-300'
                      }`}
                    >
                      <td className="py-2 px-3 flex items-center gap-2 min-w-[200px]">
                        {rule.action === 'Block' ? (
                          <Ban
                            className={`w-3.5 h-3.5 shrink-0 ${
                              rule.enabled ? 'text-red-400' : 'text-neutral-500'
                            }`}
                          />
                        ) : (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              rule.enabled ? 'text-emerald-400' : 'text-neutral-500'
                            }`}
                          />
                        )}
                        <span className="truncate font-medium">{rule.name}</span>
                      </td>
                      <td className="py-2 px-2 text-neutral-400">{rule.profile}</td>
                      <td
                        className={`py-2 px-2 font-medium ${
                          rule.enabled ? 'text-neutral-100' : 'text-neutral-500'
                        }`}
                      >
                        {rule.enabled ? 'Yes' : 'No'}
                      </td>
                      <td
                        className={`py-2 px-2 font-medium ${
                          rule.action === 'Block'
                            ? rule.enabled
                              ? 'text-red-400'
                              : 'text-neutral-500'
                            : 'text-emerald-400'
                        }`}
                      >
                        {rule.action}
                      </td>
                      <td className="py-2 px-2 font-mono text-[11px] text-neutral-400">
                        {rule.remotePort}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </main>

        {/* Right Actions Pane */}
        <aside className="col-span-3 bg-[#17191e] p-3 flex flex-col justify-between overflow-y-auto">
          {selectedRule ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-neutral-200 border-b border-neutral-800 pb-1.5 mb-2">
                  Actions
                </h4>
                <p className="text-[11px] text-neutral-400 mb-3 leading-snug">
                  {selectedRule.name}
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateRule(selectedRule.id, {
                        enabled: !selectedRule.enabled,
                      })
                    }
                    className={`w-full py-2 px-3 rounded font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      selectedRule.enabled
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {selectedRule.enabled ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Disable Rule</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Enable Rule</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openProperties(selectedRule)}
                    className="w-full py-1.5 px-3 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Properties</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-3 space-y-2 text-[11px]">
                <div className="text-neutral-400 uppercase tracking-wider font-semibold">
                  Rule Details
                </div>
                <div>
                  <span className="text-neutral-500">Program:</span>
                  <div className="font-mono text-neutral-300 break-all mt-0.5">
                    {selectedRule.program}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Protocol</span>
                  <span className="font-mono text-neutral-300">
                    {selectedRule.protocol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Remote Port</span>
                  <span className="font-mono text-neutral-300">
                    {selectedRule.remotePort}
                  </span>
                </div>
                <p className="text-neutral-400 leading-relaxed pt-1">
                  {selectedRule.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-neutral-500">Select a rule to inspect actions.</div>
          )}
        </aside>
      </div>

      {/* Properties Modal */}
      {showPropertiesModal && selectedRule && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#22252c] border border-neutral-700 rounded shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
              <span className="font-semibold text-white truncate">
                {selectedRule.name} Properties
              </span>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftEnabled}
                  onChange={(e) => setDraftEnabled(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span className="text-neutral-200 font-medium">Enabled</span>
              </label>

              <div className="space-y-2 border-t border-neutral-700 pt-3">
                <div className="font-medium text-neutral-300">Action</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rule-action"
                    checked={draftAction === 'Allow'}
                    onChange={() => setDraftAction('Allow')}
                    className="accent-sky-500"
                  />
                  <span className="text-neutral-200">Allow the connection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rule-action"
                    checked={draftAction === 'Block'}
                    onChange={() => setDraftAction('Block')}
                    className="accent-sky-500"
                  />
                  <span className="text-neutral-200">Block the connection</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowPropertiesModal(false)}
                  className="px-3.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateRule(selectedRule.id, {
                      enabled: draftEnabled,
                      action: draftAction,
                    });
                    setShowPropertiesModal(false);
                  }}
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
