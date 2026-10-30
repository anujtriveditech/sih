import React, { useState } from 'react';
import { FDRApplication, UserProfile, CheckStatus } from '../types/aicte';
import { DocumentComparisonViewer } from './DocumentComparisonViewer';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Landmark, 
  Building2, 
  FileText, 
  Send, 
  Check, 
  X, 
  ArrowLeft,
  Calendar,
  Lock,
  MessageSquare
} from 'lucide-react';

interface CaseReviewWorkspaceProps {
  application: FDRApplication;
  currentUser: UserProfile;
  onBack: () => void;
  onApplicationUpdated: (updatedApp: FDRApplication) => void;
}

export const CaseReviewWorkspace: React.FC<CaseReviewWorkspaceProps> = ({
  application,
  currentUser,
  onBack,
  onApplicationUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'document' | 'findings' | 'bank' | 'audit'>('overview');
  const [isActing, setIsActing] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'CORRECTION' | 'APPROVE' | 'REJECT' | 'BANK_DISPATCH' | 'BANK_RECORD' | 'RELEASE' | null>(null);
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalBankDetails, setModalBankDetails] = useState({
    referenceNumber: '',
    officerName: '',
    contact: ''
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const isOfficer = ['REVIEWING_OFFICER', 'AUTHORIZED_APPROVER', 'ADMINISTRATOR'].includes(currentUser.role);
  const isApprover = ['AUTHORIZED_APPROVER', 'ADMINISTRATOR'].includes(currentUser.role);

  const handleExecuteAction = async (actionType: string) => {
    setIsActing(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/fdr/${application.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          action: actionType,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          notes: modalNotes,
          bankDetails: modalBankDetails
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        onApplicationUpdated(data.data);
        setActiveModal(null);
        setModalNotes('');
      } else {
        setActionError(data.error || 'Failed to execute workflow action');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error');
    } finally {
      setIsActing(false);
    }
  };

  const findings = application.compliance_findings || [];
  const passedCount = findings.filter((f) => f.status === 'PASSED').length;
  const failedCount = findings.filter((f) => f.status === 'FAILED').length;
  const reviewCount = findings.filter((f) => f.status === 'NEEDS_REVIEW').length;

  return (
    <div className="space-y-5">
      {/* Top Banner Navigation & Status Header */}
      <div className="bg-[#17263B] text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              {application.fdr_number}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {application.application_number}
            </span>
          </div>
          <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium text-white">{application.institution_name}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>{application.program_category}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>{application.bank_name}</span>
          </div>
        </div>

        {/* Workflow Status & Action CTAs */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Current Lifecycle Status</div>
            <div className="text-sm font-bold text-teal-300 uppercase tracking-wider font-mono">
              {application.status.replace(/_/g, ' ')}
            </div>
            <div className="text-[11px] text-slate-400">
              Risk Priority: <span className="font-bold text-white font-mono">{application.risk_score?.score}/100</span> ({application.risk_score?.level})
            </div>
          </div>

          {/* Action CTAs */}
          {isOfficer && (
            <div className="flex items-center gap-2">
              {application.status === 'SUBMITTED' && (
                <button
                  onClick={() => handleExecuteAction('ASSIGN_OFFICER')}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-xs"
                >
                  Start Scrutiny
                </button>
              )}

              {['SUBMITTED', 'UNDER_REVIEW'].includes(application.status) && (
                <>
                  <button
                    onClick={() => setActiveModal('CORRECTION')}
                    className="px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-medium rounded cursor-pointer transition-colors"
                  >
                    Request Correction
                  </button>
                  <button
                    onClick={() => setActiveModal('BANK_DISPATCH')}
                    className="px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-medium rounded cursor-pointer transition-colors"
                  >
                    Dispatch Bank Verification
                  </button>
                </>
              )}

              {application.status === 'BANK_CONFIRMATION_PENDING' && (
                <button
                  onClick={() => setActiveModal('BANK_RECORD')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-xs"
                >
                  Record Branch Confirmation
                </button>
              )}

              {isApprover && ['UNDER_REVIEW', 'BANK_CONFIRMATION_PENDING'].includes(application.status) && (
                <button
                  onClick={() => setActiveModal('APPROVE')}
                  className="px-3.5 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 text-xs font-bold rounded cursor-pointer transition-colors shadow-xs"
                >
                  Grant Approval
                </button>
              )}

              {isApprover && application.status === 'RELEASE_PENDING' && (
                <button
                  onClick={() => setActiveModal('RELEASE')}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded cursor-pointer transition-colors shadow-xs"
                >
                  Authorize Release NOC
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Case Overview
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'document'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Document & OCR Inspector
        </button>
        <button
          onClick={() => setActiveTab('findings')}
          className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'findings'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Compliance Findings ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'bank'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Bank Confirmation Status
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Immutable Audit Trail ({application.audit_trail?.length || 0})
        </button>
      </div>

      {/* TAB 1: Case Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2 Cols: Details & Risk Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Deposit & Institutional Parameters
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Deposit Principal</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    ₹{(application.deposit_amount_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Tenure & Lock-in</div>
                  <div className="text-sm font-semibold font-mono text-slate-900 mt-0.5">
                    {application.tenure_years} Years (Statutory)
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Scheduled Bank</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {application.bank_name}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Issue Date</div>
                  <div className="text-sm font-mono text-slate-800 mt-0.5">
                    {application.issue_date}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Maturity Date</div>
                  <div className="text-sm font-mono text-slate-800 mt-0.5">
                    {application.maturity_date}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Branch IFSC</div>
                  <div className="text-sm font-mono text-slate-800 mt-0.5">
                    {application.branch_ifsc}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-3">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">AICTE Joint Lien Beneficiary</div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5 font-mono">
                    {application.joint_holder_name}
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable Risk Breakdown */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Explainable Financial Security Risk Score
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent breakdown of factors contributing to officer attention priority.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-slate-900">{application.risk_score?.score}</span>
                  <span className="text-xs text-slate-400"> / 100</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {(application.risk_score?.breakdown || []).map((b, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{b.factor_name}</span>
                      <span className="font-mono text-teal-800">+{b.points_added} pts (max {b.max_points})</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-1">{b.explanation}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-teal-50/70 border border-teal-200 rounded text-xs text-teal-950">
                <strong>Recommended Next Action:</strong> {application.risk_score?.primary_recommendation}
              </div>
            </div>
          </div>

          {/* 1 Col: Scrutiny Status & Quick Facts */}
          <div className="space-y-6">
            {/* Quick Compliance Summary */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Compliance Scorecard
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                  <div className="text-base font-bold font-mono text-emerald-800">{passedCount}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Passed</div>
                </div>
                <div className="p-2 rounded bg-red-50 border border-red-200">
                  <div className="text-base font-bold font-mono text-red-800">{failedCount}</div>
                  <div className="text-[10px] text-red-700 font-semibold uppercase">Failed</div>
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                  <div className="text-base font-bold font-mono text-amber-800">{reviewCount}</div>
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">Review</div>
                </div>
              </div>
            </div>

            {/* Bank Confirmation Summary Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bank Branch Confirmation
              </h4>
              <div className="text-xs text-slate-600">
                Status: <span className="font-semibold text-slate-900">{application.bank_confirmation?.status || 'NOT_INITIATED'}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {application.bank_confirmation?.notes || 'No branch confirmation recorded yet. Verification pending.'}
              </div>
              <div className="pt-2">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                  application.bank_confirmation?.is_verified
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {application.bank_confirmation?.is_verified ? 'Verified on CBS' : 'Pending Bank Seal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Document & OCR Inspector */}
      {activeTab === 'document' && (
        <DocumentComparisonViewer application={application} />
      )}

      {/* TAB 3: Compliance Findings */}
      {activeTab === 'findings' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Deterministic Regulatory Rules & Evidentiary Findings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed findings evaluated against AICTE Approval Process Handbook (APH) Table 2.1.
            </p>
          </div>

          <div className="space-y-3">
            {findings.map((f, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border text-xs ${
                  f.status === 'PASSED'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : f.status === 'FAILED'
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    {f.status === 'PASSED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {f.status === 'FAILED' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {f.status === 'NEEDS_REVIEW' && <HelpCircle className="w-4 h-4 text-amber-600" />}
                    <span>{f.rule_title}</span>
                    <span className="font-mono text-[10px] text-slate-400">({f.rule_id})</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    f.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    f.status === 'FAILED' ? 'bg-red-100 text-red-800 border-red-300' :
                    'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {f.status}
                  </span>
                </div>

                <div className="mt-2 text-slate-800 leading-relaxed font-sans">
                  {f.reason}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400 font-sans">Extracted:</span> {String(f.extracted_value)}
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans">Expected Norm:</span> {String(f.expected_value)}
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 font-sans">
                  <span className="font-medium text-slate-600">Evidence Citation:</span> {f.evidence_citation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Bank Confirmation Status */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Bank Branch Confirmation & Verification Registry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authenticity protection safeguards distinguishing OCR quality from issuing branch confirmation.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Confirmation Status</span>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {application.bank_confirmation?.status || 'PENDING'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Branch Reference No</span>
                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {application.bank_confirmation?.reference_number || 'Awaiting Branch Letter'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Branch Officer</span>
                <div className="text-xs text-slate-800 mt-0.5">
                  {application.bank_confirmation?.branch_officer_name || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Verified Date</span>
                <div className="text-xs font-mono text-slate-800 mt-0.5">
                  {application.bank_confirmation?.verification_date || 'Pending'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
              <strong>Notes:</strong> {application.bank_confirmation?.notes || 'No notes logged.'}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Immutable Regulatory Audit Log
          </h3>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {(application.audit_trail || []).map((entry, idx) => (
              <div key={idx} className="relative text-xs">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-600 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{entry.action_type.replace(/_/g, ' ')}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono text-[10px]">{entry.timestamp}</span>
                </div>
                <div className="text-slate-600 mt-0.5">{entry.details}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Actor: {entry.actor_name} ({entry.actor_role})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION MODAL: Request Correction */}
      {activeModal === 'CORRECTION' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Demand Correction from Institution
            </h3>
            <p className="text-xs text-slate-500">
              Specify the exact regulatory deficiencies (e.g. deposit amount shortfall or missing AICTE joint lien endorsement).
            </p>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="e.g. Please submit supplementary FDR of ₹5,00,000 to meet prescribed ₹15 Lakhs norm and endorse joint lien to AICTE."
              rows={4}
              className="w-full p-2.5 text-xs border border-slate-300 rounded focus:border-teal-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('REQUEST_CORRECTION')}
                disabled={isActing || !modalNotes.trim()}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs rounded disabled:opacity-50"
              >
                {isActing ? 'Issuing...' : 'Issue Correction Notice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL: Dispatch Bank Verification */}
      {activeModal === 'BANK_DISPATCH' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Dispatch Bank Branch Verification Request
            </h3>
            <p className="text-xs text-slate-500">
              Initiate formal verification letter to {application.bank_name} ({application.branch_name}) to confirm joint lien and irrevocable auto-renewal.
            </p>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="Verification dispatch remarks or dispatch letter reference..."
              rows={3}
              className="w-full p-2.5 text-xs border border-slate-300 rounded focus:border-teal-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('DISPATCH_BANK_CONFIRM')}
                disabled={isActing}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded disabled:opacity-50"
              >
                {isActing ? 'Dispatching...' : 'Dispatch Letter & Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL: Record Bank Confirmation */}
      {activeModal === 'BANK_RECORD' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Record Branch Bank Confirmation
            </h3>
            <p className="text-xs text-slate-500">
              Enter confirmation letter number and branch officer details acknowledging AICTE lien.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Branch Confirmation Letter Ref / CBS UTR *
                </label>
                <input
                  type="text"
                  value={modalBankDetails.referenceNumber}
                  onChange={(e) => setModalBankDetails({ ...modalBankDetails, referenceNumber: e.target.value })}
                  placeholder="e.g. HDFC/CP/CONF/2026/881"
                  className="w-full p-2 text-xs border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Branch Officer Name & Designation *
                </label>
                <input
                  type="text"
                  value={modalBankDetails.officerName}
                  onChange={(e) => setModalBankDetails({ ...modalBankDetails, officerName: e.target.value })}
                  placeholder="e.g. S. K. Kulkarni, Chief Manager"
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verification Remarks / Notes
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Branch confirmed irrevocable joint lien in AICTE favor."
                  rows={2}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('RECORD_BANK_CONFIRM')}
                disabled={isActing || !modalBankDetails.referenceNumber.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded disabled:opacity-50"
              >
                {isActing ? 'Recording...' : 'Save Bank Confirmation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL: Grant Final Approval */}
      {activeModal === 'APPROVE' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Grant Authorized AICTE Approval
            </h3>
            <p className="text-xs text-slate-500">
              Authorizes security deposit into the national active registry.
            </p>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="Approval order remarks and committee reference..."
              rows={3}
              className="w-full p-2.5 text-xs border border-slate-300 rounded focus:border-teal-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('APPROVE')}
                disabled={isActing}
                className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-bold text-xs rounded disabled:opacity-50"
              >
                {isActing ? 'Approving...' : 'Confirm & Grant Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL: Authorize Release */}
      {activeModal === 'RELEASE' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Authorize Security Deposit Release NOC
            </h3>
            <p className="text-xs text-slate-500">
              Confirms completion of the 10-year lock-in period and issues release NOC to issuing bank.
            </p>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="Release authorization order number and committee meeting minutes..."
              rows={3}
              className="w-full p-2.5 text-xs border border-slate-300 rounded focus:border-teal-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('AUTHORIZE_RELEASE')}
                disabled={isActing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded disabled:opacity-50"
              >
                {isActing ? 'Authorizing...' : 'Issue Release NOC'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
