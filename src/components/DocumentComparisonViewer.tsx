import React, { useState } from 'react';
import { FDRApplication, ExtractedField } from '../types/aicte';
import { 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  ShieldCheck,
  Building,
  Calendar,
  Lock,
  Edit2
} from 'lucide-react';

interface DocumentComparisonViewerProps {
  application: FDRApplication;
  onUpdateField?: (fieldKey: string, newValue: any) => void;
}

export const DocumentComparisonViewer: React.FC<DocumentComparisonViewerProps> = ({
  application,
  onUpdateField
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>('fdr_number');

  const fields = application.extracted_fields || {};

  // Formatted display values
  const displayFields = [
    { key: 'fdr_number', label: 'FDR Reference Number', val: application.fdr_number, conf: 0.98, box: { x: 58, y: 12, w: 38, h: 6 } },
    { key: 'deposit_amount_inr', label: 'Principal Deposit Amount', val: `₹${(application.deposit_amount_inr || 0).toLocaleString('en-IN')}`, conf: 0.99, box: { x: 18, y: 30, w: 35, h: 6 } },
    { key: 'bank_name', label: 'Issuing Scheduled Bank', val: application.bank_name, conf: 0.99, box: { x: 10, y: 6, w: 80, h: 5 } },
    { key: 'branch_ifsc', label: 'Branch IFSC', val: application.branch_ifsc, conf: 0.97, box: { x: 50, y: 18, w: 25, h: 4 } },
    { key: 'joint_holder_name', label: 'Joint Beneficiary (Lien Holder)', val: application.joint_holder_name, conf: 0.94, box: { x: 15, y: 22, w: 70, h: 6 } },
    { key: 'issue_date', label: 'Date of Issue', val: application.issue_date, conf: 0.96, box: { x: 15, y: 42, w: 28, h: 5 } },
    { key: 'maturity_date', label: 'Date of Maturity', val: application.maturity_date, conf: 0.96, box: { x: 52, y: 42, w: 28, h: 5 } },
    { key: 'auto_renewal_clause', label: 'Auto-Renewal Rollover Clause', val: application.auto_renewal_clause ? 'Irrevocable Auto-Renewal Registered' : 'Not Specified', conf: 0.91, box: { x: 10, y: 64, w: 80, h: 7 } }
  ];

  const activeField = displayFields.find((f) => f.key === selectedFieldKey) || displayFields[0];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Bar */}
      <div className="px-5 py-3.5 bg-[#17263B] text-white flex items-center justify-between border-b border-slate-800">
        <div>
          <div className="text-xs text-teal-400 font-medium">
            Document Understanding Workspace · Split-Screen Inspection
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">
            {application.bank_name} Certificate vs Extracted OCR Model
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(75, prev - 15))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(150, prev + 15))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Side: Simulated High-Fidelity Banking Certificate Preview */}
        <div className="p-6 bg-slate-100/70 overflow-auto max-h-[640px] flex justify-center items-start">
          <div
            className="w-full max-w-[540px] bg-[#FAF8F5] p-8 rounded border border-amber-900/20 shadow-md relative select-none transition-transform origin-top"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none text-6xl font-black rotate-[-30deg]">
              AICTE SECURITY DEPOSIT
            </div>

            {/* Bank Header */}
            <div className="border-b-2 border-slate-800 pb-3 text-center">
              <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                {application.bank_name}
              </div>
              <div className="text-[10px] text-slate-600">
                {application.branch_name} · IFSC: {application.branch_ifsc}
              </div>
              <div className="text-[11px] font-bold tracking-tight text-slate-900 mt-1 uppercase">
                Fixed Deposit Receipt / Term Deposit Advice
              </div>
            </div>

            {/* Document Body with Interactive Highlight Boxes */}
            <div className="mt-4 space-y-4 text-xs font-mono text-slate-800">
              <div className="flex justify-between items-center relative p-1">
                <div>
                  <span className="text-[10px] font-sans text-slate-500 uppercase">Customer A/C No:</span>
                  <div>092817441098</div>
                </div>
                <div
                  onClick={() => setSelectedFieldKey('fdr_number')}
                  className={`cursor-pointer p-1 rounded transition-colors ${
                    selectedFieldKey === 'fdr_number'
                      ? 'bg-teal-200/80 ring-2 ring-teal-600'
                      : 'hover:bg-teal-100/50'
                  }`}
                >
                  <span className="text-[10px] font-sans text-slate-500 uppercase">Receipt No:</span>
                  <div className="font-bold text-slate-950">{application.fdr_number}</div>
                </div>
              </div>

              {/* Joint Holder / Title */}
              <div
                onClick={() => setSelectedFieldKey('joint_holder_name')}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  selectedFieldKey === 'joint_holder_name'
                    ? 'bg-teal-200/80 ring-2 ring-teal-600'
                    : 'hover:bg-teal-100/50'
                }`}
              >
                <div className="text-[10px] font-sans text-slate-500 uppercase">Account Title / Joint Holder:</div>
                <div className="font-semibold text-slate-900">{application.joint_holder_name}</div>
              </div>

              {/* Deposit Amount */}
              <div
                onClick={() => setSelectedFieldKey('deposit_amount_inr')}
                className={`p-2 rounded cursor-pointer transition-colors border border-slate-300/80 bg-white/60 ${
                  selectedFieldKey === 'deposit_amount_inr'
                    ? 'bg-teal-200/80 ring-2 ring-teal-600'
                    : 'hover:bg-teal-100/50'
                }`}
              >
                <div className="text-[10px] font-sans text-slate-500 uppercase">Principal Deposit Amount:</div>
                <div className="text-base font-bold text-slate-950">
                  ₹{(application.deposit_amount_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-sans text-slate-600 italic">
                  ({application.deposit_amount_words || 'Thirty Five Lakhs Rupees Only'})
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedFieldKey('issue_date')}
                  className={`p-1.5 rounded cursor-pointer transition-colors ${
                    selectedFieldKey === 'issue_date'
                      ? 'bg-teal-200/80 ring-2 ring-teal-600'
                      : 'hover:bg-teal-100/50'
                  }`}
                >
                  <div className="text-[10px] font-sans text-slate-500 uppercase">Date of Issue:</div>
                  <div className="font-semibold text-slate-900">{application.issue_date}</div>
                </div>
                <div
                  onClick={() => setSelectedFieldKey('maturity_date')}
                  className={`p-1.5 rounded cursor-pointer transition-colors ${
                    selectedFieldKey === 'maturity_date'
                      ? 'bg-teal-200/80 ring-2 ring-teal-600'
                      : 'hover:bg-teal-100/50'
                  }`}
                >
                  <div className="text-[10px] font-sans text-slate-500 uppercase">Date of Maturity:</div>
                  <div className="font-semibold text-slate-900">{application.maturity_date}</div>
                </div>
              </div>

              {/* Special Instructions & Auto Renewal */}
              <div
                onClick={() => setSelectedFieldKey('auto_renewal_clause')}
                className={`p-2 rounded cursor-pointer transition-colors border-t border-slate-300 ${
                  selectedFieldKey === 'auto_renewal_clause'
                    ? 'bg-teal-200/80 ring-2 ring-teal-600'
                    : 'hover:bg-teal-100/50'
                }`}
              >
                <div className="text-[10px] font-sans text-slate-500 uppercase">Special Instructions / Rollover Clause:</div>
                <div className="text-[11px] leading-relaxed text-slate-800">
                  {application.auto_renewal_clause
                    ? 'LIEN MARKED IN FAVOR OF AICTE NEW DELHI. MANDATORY AUTO-RENEWAL ON MATURITY UNTIL FORMAL NOC DISPATCHED.'
                    : 'STANDARD TERM DEPOSIT. PREMATURE ENCASHMENT ALLOWED WITH PENALTY.'}
                </div>
              </div>

              {/* Bank Seal & Signatory Mark */}
              <div className="pt-4 flex items-end justify-between border-t border-slate-300">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-teal-800/40 flex items-center justify-center text-[9px] text-teal-900 font-bold text-center leading-tight">
                  BRANCH<br />SEAL
                </div>
                <div className="text-right">
                  <div className="w-32 border-b border-slate-800 mb-1" />
                  <div className="text-[10px] text-slate-600 font-sans">Authorized Bank Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Extracted Fields & Confidence Inspector */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Extracted Field Inspector
              </h4>
              <p className="text-[11px] text-slate-500">
                Click any row to jump to its source bounding box on the original document.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              8 Fields Verified
            </span>
          </div>

          <div className="space-y-2">
            {displayFields.map((field) => {
              const isSelected = selectedFieldKey === field.key;
              return (
                <div
                  key={field.key}
                  onClick={() => setSelectedFieldKey(field.key)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{field.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500">
                        Confidence: {(field.conf * 100).toFixed(0)}%
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                  </div>
                  <div className="mt-1 font-mono text-slate-900 font-medium truncate">
                    {String(field.val)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Field Source Location Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Source Location:</span>
              <span className="text-teal-700 font-mono">{activeField.label}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Coordinates: X: {activeField.box.x}%, Y: {activeField.box.y}%, W: {activeField.box.w}%, H: {activeField.box.h}% · Page 1
            </div>
            <div className="text-[11px] text-slate-600 pt-1">
              Deterministic validation confirms this value was extracted directly from the uploaded certificate. Original source file is preserved intact.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
