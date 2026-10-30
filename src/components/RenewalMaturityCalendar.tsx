import React, { useState } from 'react';
import { FDRApplication, UserProfile } from '../types/aicte';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight, RefreshCw, Send } from 'lucide-react';

interface RenewalMaturityCalendarProps {
  applications: FDRApplication[];
  currentUser: UserProfile;
  onSelectApplication: (app: FDRApplication) => void;
  onRequestRenewal: (appId: string) => void;
}

export const RenewalMaturityCalendar: React.FC<RenewalMaturityCalendarProps> = ({
  applications,
  currentUser,
  onSelectApplication,
  onRequestRenewal
}) => {
  const [filterHorizon, setFilterHorizon] = useState<'ALL' | 'EXPIRED' | '30_DAYS' | '90_DAYS' | 'RELEASE_ELIGIBLE'>('ALL');

  const today = new Date('2026-10-29');

  // Categorize applications by maturity status
  const appsWithMaturity = applications.map((a) => {
    let diffDays = 9999;
    if (a.maturity_date) {
      const matDate = new Date(a.maturity_date);
      diffDays = Math.ceil((matDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    }
    return {
      ...a,
      diffDays,
      isExpired: diffDays < 0,
      isCritical30: diffDays >= 0 && diffDays <= 30,
      isApproaching90: diffDays > 30 && diffDays <= 90,
      isReleaseEligible: a.tenure_years >= 10 || a.status === 'RELEASE_PENDING'
    };
  });

  const filtered = appsWithMaturity.filter((a) => {
    if (filterHorizon === 'EXPIRED') return a.isExpired;
    if (filterHorizon === '30_DAYS') return a.isCritical30;
    if (filterHorizon === '90_DAYS') return a.isApproaching90;
    if (filterHorizon === 'RELEASE_ELIGIBLE') return a.isReleaseEligible;
    return true;
  });

  // Sort chronologically by maturity date
  const sorted = [...filtered].sort((a, b) => a.diffDays - b.diffDays);

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="bg-[#17263B] text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-teal-400 font-medium flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>AICTE Statutory Maturity Horizon & Rollover Tracker</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Renewal & Statutory Maturity Calendar
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitors 8-year lock-in schedules, automated rollover instructions, and 10-year release eligibility.
          </p>
        </div>

        {/* Filter Horizon Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded border border-slate-700 text-xs">
          <button
            onClick={() => setFilterHorizon('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterHorizon === 'ALL' ? 'bg-[#14B8A6] text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Horizon
          </button>
          <button
            onClick={() => setFilterHorizon('30_DAYS')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterHorizon === '30_DAYS' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            &le; 30 Days
          </button>
          <button
            onClick={() => setFilterHorizon('EXPIRED')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterHorizon === 'EXPIRED' ? 'bg-red-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Lapsed / Expired
          </button>
          <button
            onClick={() => setFilterHorizon('RELEASE_ELIGIBLE')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterHorizon === 'RELEASE_ELIGIBLE' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Release Eligible
          </button>
        </div>
      </div>

      {/* Timeline List of Maturities */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No deposits found in this maturity horizon category.
          </div>
        ) : (
          sorted.map((item) => {
            let textColor = 'text-slate-700';
            let dotColor = 'bg-slate-400';
            let horizonLabel = `${item.diffDays} days remaining`;

            if (item.isExpired) {
              textColor = 'text-red-700 font-bold';
              dotColor = 'bg-red-600';
              horizonLabel = `Expired ${Math.abs(item.diffDays)} days ago`;
            } else if (item.isCritical30) {
              textColor = 'text-amber-700 font-bold';
              dotColor = 'bg-amber-500';
              horizonLabel = `Due in ${item.diffDays} days`;
            } else if (item.isApproaching90) {
              textColor = 'text-sky-700 font-semibold';
              dotColor = 'bg-sky-500';
            }

            // Calculate tenure progress
            const issueTime = item.issue_date ? new Date(item.issue_date).getTime() : today.getTime() - 365*24*3600*1000;
            const matTime = item.maturity_date ? new Date(item.maturity_date).getTime() : today.getTime() + 365*24*3600*1000;
            const totalDuration = matTime - issueTime;
            const elapsed = today.getTime() - issueTime;
            const progressPct = totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 50;

            return (
              <div
                key={item.id}
                onClick={() => onSelectApplication(item)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 max-w-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">{item.fdr_number}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-600">{item.bank_name}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{(item.deposit_amount_inr / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {item.institution_name}
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Maturity: <strong className="font-mono text-slate-800">{item.maturity_date}</strong></span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>Tenure: <strong className="font-mono text-slate-700">{item.tenure_years} Years</strong></span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>Auto-Renewal: {item.auto_renewal_clause ? 'Enabled on CBS' : 'Manual Required'}</span>
                  </div>

                  {/* Lifespan Progress Indicator */}
                  <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Issued {item.issue_date}</span>
                    <div className="flex-1 max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.isExpired ? 'bg-red-500' : item.isCritical30 ? 'bg-amber-500' : 'bg-teal-600'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span>{progressPct}% Tenure</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <div className="font-mono text-xs tabular-nums flex items-center justify-end gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                      <span className={textColor}>{horizonLabel}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono">
                      Status: {item.status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {currentUser.role === 'INSTITUTION_USER' && (item.isCritical30 || item.isExpired) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestRenewal(item.id);
                      }}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Request Renewal
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApplication(item);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-[#14243A] text-slate-700 hover:text-white font-medium rounded transition-colors text-xs cursor-pointer"
                  >
                    Inspect
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
