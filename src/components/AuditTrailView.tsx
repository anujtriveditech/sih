import React, { useState, useMemo } from 'react';
import { FDRApplication, UserProfile } from '../types/aicte';
import { History, Search, Filter, ShieldCheck, Download, Clock } from 'lucide-react';

interface AuditTrailViewProps {
  applications: FDRApplication[];
  currentUser: UserProfile;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  applications,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Aggregate all audit logs from all applications
  const allLogs = useMemo(() => {
    const list: any[] = [];
    applications.forEach((app) => {
      (app.audit_trail || []).forEach((log) => {
        list.push({
          ...log,
          fdrNumber: app.fdr_number,
          institutionName: app.institution_name,
          appId: app.id
        });
      });
    });
    // Sort reverse chronological
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.actor_name?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.fdrNumber?.toLowerCase().includes(q) ||
        log.institutionName?.toLowerCase().includes(q);

      const matchesAction = actionFilter === 'ALL' || log.action_type === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [allLogs, searchQuery, actionFilter]);

  const handleExportAudit = () => {
    const headers = ['Timestamp', 'FDR Reference', 'Institution', 'Action Type', 'Actor Name', 'Actor Role', 'Details', 'Previous State', 'New State'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.fdrNumber}"`,
      `"${l.institutionName}"`,
      `"${l.action_type}"`,
      `"${l.actor_name}"`,
      `"${l.actor_role}"`,
      `"${l.details?.replace(/"/g, '""')}"`,
      `"${l.previous_state || ''}"`,
      `"${l.new_state || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_SmartTrack_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="bg-[#14243A] text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-teal-400 font-medium flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            <span>AICTE Immutable Regulatory Audit Trail & Governance Log</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Audit History & Traceability Ledger
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Tamper-evident chronological record of submissions, field corrections, bank confirmations, approvals, and releases.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#087F78] hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" /> Export Audit CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-[#E0E5E9] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action details, institution, or FDR..."
            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded text-xs bg-slate-50/50 focus:outline-none focus:border-teal-600"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-700"
        >
          <option value="ALL">All Action Events ({allLogs.length})</option>
          <option value="APPLICATION_SUBMITTED">Applications Submitted</option>
          <option value="SCRUTINY_COMPLETED">Scrutiny Completed</option>
          <option value="CORRECTION_DEMANDED">Corrections Demanded</option>
          <option value="DISPATCHED_BANK_VERIFICATION">Bank Dispatches</option>
          <option value="RECORD_BANK_CONFIRM">Bank Confirmations</option>
          <option value="FINAL_APPROVAL">Approvals Granted</option>
          <option value="AUTHORIZE_RELEASE">Releases Authorized</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-[#E0E5E9] shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No audit records found matching the active filter.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {log.action_type?.replace(/_/g, ' ')}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono text-teal-800 font-semibold">{log.fdrNumber}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600 font-medium">{log.institutionName}</span>
                </div>

                <div className="text-slate-800 leading-relaxed font-sans">
                  {log.details}
                </div>

                {log.previous_state && log.new_state && (
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                    <span>State Transition:</span>
                    <span className="text-slate-600 font-semibold">{log.previous_state}</span>
                    <span>&rarr;</span>
                    <span className="text-teal-800 font-bold">{log.new_state}</span>
                  </div>
                )}
              </div>

              <div className="text-right shrink-0 self-end sm:self-start">
                <div className="font-mono text-[11px] text-slate-500">
                  {new Date(log.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Actor: <strong className="text-slate-700">{log.actor_name}</strong> ({log.actor_role})
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
