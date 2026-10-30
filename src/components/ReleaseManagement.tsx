import React, { useState } from 'react';
import { FDRApplication, UserProfile } from '../types/aicte';
import { 
  Unlock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck2, 
  Download, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ReleaseManagementProps {
  applications: FDRApplication[];
  currentUser: UserProfile;
  onSelectApplication: (app: FDRApplication) => void;
  onAuthorizeRelease: (appId: string, notes: string) => void;
}

export const ReleaseManagement: React.FC<ReleaseManagementProps> = ({
  applications,
  currentUser,
  onSelectApplication,
  onAuthorizeRelease
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'eligible' | 'released'>('pending');
  const [selectedForRelease, setSelectedForRelease] = useState<FDRApplication | null>(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApprover = ['AUTHORIZED_APPROVER', 'ADMINISTRATOR'].includes(currentUser.role);

  // Group applications
  const releasePendingApps = applications.filter((a) => a.status === 'RELEASE_PENDING');
  const releasedApps = applications.filter((a) => a.status === 'RELEASED');
  
  // Eligible for release: 10 years tenure or past 10 years lock-in
  const eligibleApps = applications.filter(
    (a) => a.status === 'APPROVED' && (a.tenure_years >= 10 || (a.maturity_date && new Date(a.maturity_date).getFullYear() - new Date(a.issue_date || '').getFullYear() >= 10))
  );

  const handleConfirmRelease = () => {
    if (!selectedForRelease || !releaseNotes.trim()) return;
    setIsSubmitting(true);
    onAuthorizeRelease(selectedForRelease.id, releaseNotes);
    setSelectedForRelease(null);
    setReleaseNotes('');
    setIsSubmitting(false);
  };

  const downloadReleaseNoc = (app: FDRApplication) => {
    const text = `
ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
NEW DELHI - 110070
------------------------------------------------------------
STATUTORY SECURITY DEPOSIT RELEASE ORDER / NO OBJECTION CERTIFICATE (NOC)

Release Order Ref: AICTE/REL/NOC/${app.fdr_number}
Date of Release: ${new Date().toISOString().split('T')[0]}

TO THE BRANCH MANAGER:
${app.bank_name}, ${app.branch_name}
IFSC: ${app.branch_ifsc}

SUBJECT: Release of AICTE Joint Lien on Fixed Deposit Receipt No. ${app.fdr_number}

This is to certify that ${app.institution_name} (AICTE ID: ${app.institution_code})
has completed the statutory lock-in period of 10 years in full compliance with AICTE
Approval Process Handbook (APH) regulations.

Deposit Principal: INR ${(app.deposit_amount_inr || 0).toLocaleString('en-IN')}
Account Title: ${app.joint_holder_name}

AICTE hereby unconditionally releases its first-charge joint lien over the aforesaid
Fixed Deposit Receipt and has No Objection to the proceeds being credited to the registered
account of the institution society.

Authorized Signatory:
Regional Director / Member Secretary Approval Committee
AICTE Headquarters, New Delhi
------------------------------------------------------------
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_Release_NOC_${app.fdr_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="bg-[#14243A] text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-teal-400 font-medium flex items-center gap-2">
            <Unlock className="w-3.5 h-3.5" />
            <span>AICTE Statutory Lock-in & Deposit Release Bureau</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Security Deposit Release & NOC Management
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Governs 10-year statutory completion evaluations, institutional closure clearances, and Authorized Approver release orders.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded border border-slate-700 text-xs">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'pending'
                ? 'bg-[#087F78] text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Pending Authorization ({releasePendingApps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('eligible')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'eligible'
                ? 'bg-[#087F78] text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Eligible for Release ({eligibleApps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('released')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'released'
                ? 'bg-[#087F78] text-white font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Released Archives ({releasedApps.length})
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-lg border border-[#E0E5E9] shadow-xs divide-y divide-slate-100 overflow-hidden">
        {activeSubTab === 'pending' && (
          <div>
            {releasePendingApps.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No release petitions currently awaiting approval.
              </div>
            ) : (
              releasePendingApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">{app.fdr_number}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-700 font-medium">{app.bank_name}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-slate-900 font-bold">
                        ₹{(app.deposit_amount_inr || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {app.institution_name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Tenure: <strong className="font-mono text-slate-700">{app.tenure_years} Years</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>10-Year Statutory Lock-in: <strong className="text-emerald-700 font-semibold">Completed</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => onSelectApplication(app)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded"
                    >
                      Inspect Evidence
                    </button>
                    {isApprover && (
                      <button
                        onClick={() => setSelectedForRelease(app)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-xs"
                      >
                        Authorize Release NOC
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === 'eligible' && (
          <div>
            {eligibleApps.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No active deposits currently meeting the 10-year release criteria.
              </div>
            ) : (
              eligibleApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">{app.fdr_number}</span>
                      <span className="text-slate-600 font-medium">({app.bank_name})</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {app.institution_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Eligible for statutory return upon institution filing formal Form 12 release request.
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectApplication(app)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === 'released' && (
          <div>
            {releasedApps.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No released archives recorded.
              </div>
            ) : (
              releasedApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">{app.fdr_number}</span>
                      <span className="text-emerald-700 font-semibold uppercase text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        NOC Issued & Released
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {app.institution_name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Released Principal: ₹{(app.deposit_amount_inr || 0).toLocaleString('en-IN')} · Bank: {app.bank_name}
                    </div>
                  </div>

                  <button
                    onClick={() => downloadReleaseNoc(app)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-teal-800 text-xs font-semibold rounded border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" /> Download NOC
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Release Confirmation Dialog */}
      {selectedForRelease && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Sign & Authorize Statutory Security Release Order
            </h3>
            <p className="text-xs text-slate-500">
              Confirming release for <strong>{selectedForRelease.institution_name}</strong> (FDR: <span className="font-mono">{selectedForRelease.fdr_number}</span>).
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-950">
              <strong>Checklist:</strong> 10-year term completed, no vigilance complaints pending, bank lien certificate verified.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Executive Committee Approval Resolution *
              </label>
              <textarea
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="e.g. Approved pursuant to 142nd Regional Committee meeting resolution dated 28-Oct-2026."
                rows={3}
                className="w-full p-2.5 text-xs border border-slate-300 rounded focus:border-teal-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedForRelease(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRelease}
                disabled={isSubmitting || !releaseNotes.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? 'Signing...' : 'Issue Release NOC'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
