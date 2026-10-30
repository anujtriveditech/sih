import React, { useState, useMemo } from 'react';
import { FDRApplication, UserProfile } from '../types/aicte';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  Send,
  Building2,
  Calendar
} from 'lucide-react';

interface VerificationQueueProps {
  applications: FDRApplication[];
  currentUser: UserProfile;
  onSelectApplication: (app: FDRApplication) => void;
  onClaimCase: (appId: string) => void;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({
  applications,
  currentUser,
  onSelectApplication,
  onClaimCase
}) => {
  const [filterType, setFilterType] = useState<'ALL_ACTIVE' | 'MY_ASSIGNED' | 'UNASSIGNED' | 'CRITICAL_URGENCY'>('ALL_ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  // Cases that require active verification or review
  const activeQueueCases = useMemo(() => {
    return applications.filter((a) =>
      ['SUBMITTED', 'UNDER_REVIEW', 'BANK_CONFIRMATION_PENDING', 'CORRECTION_REQUIRED'].includes(a.status)
    );
  }, [applications]);

  const filtered = useMemo(() => {
    return activeQueueCases.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.fdr_number.toLowerCase().includes(q) ||
        app.institution_name.toLowerCase().includes(q) ||
        app.bank_name.toLowerCase().includes(q);

      let matchesFilter = true;
      if (filterType === 'MY_ASSIGNED') {
        matchesFilter = app.assigned_officer_id === currentUser.id;
      } else if (filterType === 'UNASSIGNED') {
        matchesFilter = !app.assigned_officer_id || app.status === 'SUBMITTED';
      } else if (filterType === 'CRITICAL_URGENCY') {
        matchesFilter = app.risk_score?.level === 'CRITICAL' || app.risk_score?.level === 'HIGH';
      }

      return matchesSearch && matchesFilter;
    });
  }, [activeQueueCases, searchQuery, filterType, currentUser.id]);

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="bg-[#14243A] text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-teal-400 font-medium flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>AICTE Scrutiny Officer Active Workflow Queue</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Verification & Regulatory Scrutiny Queue
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Active FDR submissions requiring document inspection, bank verification dispatch, or compliance correction demands.
          </p>
        </div>

        {/* Queue Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded border border-slate-700 text-xs">
          <button
            onClick={() => setFilterType('ALL_ACTIVE')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'ALL_ACTIVE' ? 'bg-[#087F78] text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Active ({activeQueueCases.length})
          </button>
          <button
            onClick={() => setFilterType('CRITICAL_URGENCY')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'CRITICAL_URGENCY' ? 'bg-red-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Critical Urgency
          </button>
          <button
            onClick={() => setFilterType('UNASSIGNED')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'UNASSIGNED' ? 'bg-[#087F78] text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Unassigned
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-lg border border-[#E0E5E9] shadow-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queue by FDR number, institution name, or bank..."
            className="w-full pl-8 pr-4 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Queue Items */}
      <div className="bg-white rounded-lg border border-[#E0E5E9] shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No applications found matching the selected queue filter.
          </div>
        ) : (
          filtered.map((app) => {
            const isCritical = app.risk_score?.level === 'CRITICAL';
            const isHigh = app.risk_score?.level === 'HIGH';

            return (
              <div
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">{app.fdr_number}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-600">{app.bank_name}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{(app.deposit_amount_inr || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {app.institution_name}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Assigned Officer: <strong className="text-slate-700">{app.assigned_officer_name || 'Unassigned'}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Status: <strong className="font-mono text-teal-800">{app.status.replace(/_/g, ' ')}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Priority Score</div>
                    <div className={`font-mono text-sm font-bold tabular-nums ${
                      isCritical ? 'text-red-700' : isHigh ? 'text-amber-700' : 'text-slate-800'
                    }`}>
                      {app.risk_score?.score} / 100
                    </div>
                  </div>

                  {!app.assigned_officer_id && app.status === 'SUBMITTED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClaimCase(app.id);
                      }}
                      className="px-3 py-1.5 bg-[#087F78] hover:bg-teal-700 text-white text-xs font-semibold rounded shadow-xs"
                    >
                      Assign to Me
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApplication(app);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded"
                  >
                    Scrutinize Case
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
