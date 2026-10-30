import React, { useState } from 'react';
import { FDRApplication, UserProfile } from '../types/aicte';
import { Landmark, CheckCircle2, Clock, Send, ShieldCheck, Search, AlertCircle } from 'lucide-react';

interface BankConfirmationCentreProps {
  applications: FDRApplication[];
  currentUser: UserProfile;
  onSelectApplication: (app: FDRApplication) => void;
  onRecordConfirmation: (appId: string, details: { referenceNumber: string; officerName: string; notes: string }) => void;
}

export const BankConfirmationCentre: React.FC<BankConfirmationCentreProps> = ({
  applications,
  currentUser,
  onSelectApplication,
  onRecordConfirmation
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [refNumber, setRefNumber] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingConfirmationApps = applications.filter(
    (a) => a.status === 'BANK_CONFIRMATION_PENDING' || !a.bank_confirmation?.is_verified
  );

  const verifiedApps = applications.filter((a) => a.bank_confirmation?.is_verified);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !refNumber.trim() || !officerName.trim()) return;

    setIsSubmitting(true);
    onRecordConfirmation(selectedAppId, {
      referenceNumber: refNumber,
      officerName,
      notes
    });
    setRefNumber('');
    setOfficerName('');
    setNotes('');
    setSelectedAppId('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#17263B] text-white rounded-lg p-5 border border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
          <Landmark className="w-4 h-4" />
          <span>Issuing Bank Branch Verification Registry</span>
        </div>
        <h2 className="text-lg font-bold text-white mt-1">
          Bank Confirmation & Lien Authentication Centre
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          Authenticity safeguards distinguishing optical character recognition from issuing branch CBS confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pending & Verified Queues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Confirmations Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Branch Confirmations ({pendingConfirmationApps.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Verification dispatches awaiting response from issuing scheduled commercial bank branches.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingConfirmationApps.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No bank confirmations currently pending.
                </div>
              ) : (
                pendingConfirmationApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-900">{app.fdr_number}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-700 font-medium">{app.bank_name}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono text-slate-600">₹{(app.deposit_amount_inr / 100000).toFixed(2)} Lakhs</span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-0.5">
                        {app.institution_name}
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Dispatch Ref: {app.bank_confirmation?.reference_number || 'AICTE/WRO/DISPATCH/PENDING'}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppId(app.id);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded whitespace-nowrap cursor-pointer transition-colors shadow-xs"
                    >
                      Record Response
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Verified Confirmations */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Recently Verified Bank Confirmations ({verifiedApps.length})
            </h3>
            <div className="space-y-2">
              {verifiedApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">{app.fdr_number}</span> —{' '}
                    <span className="font-medium text-slate-800">{app.institution_name}</span> ({app.bank_name})
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      CBS Conf Ref: <span className="font-mono text-slate-700">{app.bank_confirmation?.reference_number}</span> · Verified on {app.bank_confirmation?.verification_date}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Record Confirmation Form */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Record Branch Bank Confirmation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter branch acknowledgment letter details to confirm authentic AICTE lien marking.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select FDR Record *
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                required
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="">-- Choose FDR Application --</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fdr_number} — {a.institution_name.slice(0, 25)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch Confirmation Letter Reference / CBS UTR *
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. HDFC/CONF/2026/8912"
                required
                className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch Officer Name & Designation *
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="e.g. R. K. Singhania, Branch Manager"
                required
                className="w-full p-2 text-xs border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Verification Remarks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Confirmed joint lien marking in Core Banking System with automatic rollover."
                rows={3}
                className="w-full p-2 text-xs border border-slate-300 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedAppId}
              className="w-full py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-bold text-xs rounded transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Confirm Branch Authenticity
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
