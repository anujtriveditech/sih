import React, { useState, useMemo } from 'react';
import { FDRApplication, UserProfile, ExtractedField, ComplianceFinding } from '../types/aicte';
import { validateSubmissionFormData } from '../utils/validation';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Building2,
  Landmark,
  ShieldAlert,
  HelpCircle,
  Eye
} from 'lucide-react';

interface SubmissionWizardProps {
  currentUser: UserProfile;
  onSuccess: (newApp: FDRApplication) => void;
  onCancel: () => void;
}

export const SubmissionWizard: React.FC<SubmissionWizardProps> = ({
  currentUser,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    institution_name: currentUser.institutionName || 'Apex Institute of Technology',
    institution_code: '1-9382019481',
    program_category: 'Engineering & Technology (UG)',
    regional_office: currentUser.regionalOffice || 'Western Regional Office (WRO), Mumbai',
    bank_name: 'HDFC Bank',
    branch_name: 'Connaught Place Branch, New Delhi',
    branch_ifsc: 'HDFC0000003',
    fdr_number: 'HDFC-ND-2024-88491',
    deposit_amount_inr: 3500000,
    deposit_amount_words: 'Rupees Thirty Five Lakhs Only',
    issue_date: '2024-03-15',
    maturity_date: '2032-03-15',
    tenure_years: 8,
    joint_holder_name: 'Member Secretary, AICTE and Apex Institute of Technology',
    auto_renewal_clause: true
  });

  const [selectedSample, setSelectedSample] = useState<string>('set_a_sample');
  const [extractedFields, setExtractedFields] = useState<Record<string, ExtractedField>>({});
  const [complianceFindings, setComplianceFindings] = useState<ComplianceFinding[]>([]);
  const [rawOcrText, setRawOcrText] = useState<string>('');

  // Inline Form Validation State & Handlers
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formValidation = useMemo(() => {
    return validateSubmissionFormData(formData);
  }, [formData]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Sample Documents configuration (including SIH26265 Set A & Set B benchmarks)
  const SAMPLE_PRESETS: Record<string, { label: string; desc: string; sampleKey: string; expectedOutcome: string }> = {
    set_a_sample: {
      label: 'Set A — Compliant AICTE FDR Benchmark (₹35 Lakhs SBI)',
      desc: 'Mandatory 8-Year lock-in (2024-2032), joint lien with Member Secretary AICTE, scheduled bank, auto-renewal.',
      sampleKey: 'set_a_sample',
      expectedOutcome: 'PASSED — All deterministic regulatory checks pass without discrepancies.'
    },
    set_b_sample: {
      label: 'Set B — Defective FDR Discrepancy Benchmark (₹12 Lakhs PNB)',
      desc: 'Deliberate discrepancies: ₹23L shortfall against ₹35L norm, single holder without AICTE lien, 3-year term violating 8-year lock-in.',
      sampleKey: 'set_b_sample',
      expectedOutcome: 'FLAGGED — Identifies amount shortfall, missing lien, and insufficient tenure.'
    },
    hdfc_sample: {
      label: 'HDFC Bank Term Deposit (₹35 Lakhs - Fully Compliant)',
      desc: 'Standard 8-Year FDR with joint AICTE lien endorsement and auto-renewal instruction.',
      sampleKey: 'hdfc_sample',
      expectedOutcome: 'All deterministic rules pass.'
    },
    sbi_sample: {
      label: 'State Bank of India FDR (₹15 Lakhs - Management PGDM)',
      desc: 'SBI Special Term Deposit with Member Secretary AICTE first charge.',
      sampleKey: 'sbi_sample',
      expectedOutcome: 'Conforms to Management norm (₹15 Lakhs).'
    },
    pnb_sample_defective: {
      label: 'Punjab National Bank (₹10 Lakhs - Defective Non-Compliant)',
      desc: 'Sub-threshold deposit (shortfall ₹5L), missing AICTE joint name, 3-year tenure.',
      sampleKey: 'pnb_sample_defective',
      expectedOutcome: 'Fails deposit sufficiency and AICTE lien checks.'
    }
  };

  // Step 2: Run Python Extraction
  const handleRunExtraction = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/python/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleKey: selectedSample,
          sourceDocument: `${selectedSample}.pdf`
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setExtractedFields(data.data.fields || {});
        setRawOcrText(data.data.text || '');

        // Pre-fill form from Python extraction
        const fields = data.data.fields || {};
        setFormData((prev) => ({
          ...prev,
          fdr_number: fields.fdr_number?.value || prev.fdr_number,
          bank_name: fields.bank_name?.value || prev.bank_name,
          branch_ifsc: fields.branch_ifsc?.value || prev.branch_ifsc,
          deposit_amount_inr: fields.deposit_amount_inr?.value || prev.deposit_amount_inr,
          issue_date: fields.issue_date?.value || prev.issue_date,
          maturity_date: fields.maturity_date?.value || prev.maturity_date,
          joint_holder_name: fields.joint_holder_name?.value || prev.joint_holder_name,
          auto_renewal_clause: fields.auto_renewal_clause?.value !== undefined ? fields.auto_renewal_clause.value : prev.auto_renewal_clause
        }));

        setStep(3);
      } else {
        setErrorMsg(data.error || 'Extraction failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error executing extraction');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Run Deterministic Compliance Validation
  const handleRunValidation = async () => {
    if (!formValidation.isValid) {
      setTouched({
        fdr_number: true,
        deposit_amount_inr: true,
        bank_name: true,
        branch_ifsc: true,
        issue_date: true,
        maturity_date: true
      });
      setErrorMsg(`Mandatory fields incomplete: ${formValidation.missingFieldLabels.join(', ')}. Please correct all highlighted fields.`);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/python/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application: formData })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setComplianceFindings(data.data);
        setStep(4);
      } else {
        setErrorMsg('Validation failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 4: Final Submission to Backend
  const handleFinalSubmit = async () => {
    if (!formValidation.isValid) {
      setErrorMsg(`Cannot submit. Mandatory fields incomplete: ${formValidation.missingFieldLabels.join(', ')}.`);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/fdr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-institution-id': currentUser.institutionId || 'inst_01'
        },
        body: JSON.stringify({
          ...formData,
          actor_name: currentUser.name,
          extracted_fields: extractedFields,
          compliance_findings: complianceFindings,
          documents: [
            {
              id: `doc_${Date.now()}`,
              type: 'FDR_CERTIFICATE',
              name: `${formData.bank_name.replace(/\s+/g, '_')}_FDR_Receipt.pdf`,
              size: '1.8 MB',
              upload_date: new Date().toISOString().split('T')[0],
              status: 'SUBMITTED'
            }
          ]
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        onSuccess(data.data);
      } else {
        setErrorMsg(data.error || 'Submission failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error submitting application');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Wizard Header */}
      <div className="bg-[#17263B] text-white p-5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-teal-400 font-medium">
              Step {step} of 4 · Regulatory Submission Workflow
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              New FDR & Security Deposit Submission
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-[11px] font-medium text-slate-300">
          <div className={`p-1.5 border-t-2 ${step >= 1 ? 'border-[#14B8A6] text-white' : 'border-slate-700 text-slate-500'}`}>
            1. Institution & Norms
          </div>
          <div className={`p-1.5 border-t-2 ${step >= 2 ? 'border-[#14B8A6] text-white' : 'border-slate-700 text-slate-500'}`}>
            2. Document & OCR
          </div>
          <div className={`p-1.5 border-t-2 ${step >= 3 ? 'border-[#14B8A6] text-white' : 'border-slate-700 text-slate-500'}`}>
            3. Extraction Review
          </div>
          <div className={`p-1.5 border-t-2 ${step >= 4 ? 'border-[#14B8A6] text-white' : 'border-slate-700 text-slate-500'}`}>
            4. Compliance Check
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Institution & Program Details */}
      {step === 1 && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                value={formData.institution_name}
                onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AICTE Permanent Institution ID *
              </label>
              <input
                type="text"
                value={formData.institution_code}
                onChange={(e) => setFormData({ ...formData, institution_code: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded font-mono focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Category (Determines Prescribed Deposit Norm) *
              </label>
              <select
                value={formData.program_category}
                onChange={(e) => setFormData({ ...formData, program_category: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white focus:border-teal-600 focus:outline-none"
              >
                <option value="Engineering & Technology (UG)">Engineering & Technology (UG) — Min ₹35.00 Lakhs</option>
                <option value="Engineering & Technology (PG/Integrated)">Engineering (PG/Integrated) — Min ₹50.00 Lakhs</option>
                <option value="Management (MBA/PGDM)">Management (MBA/PGDM) — Min ₹15.00 Lakhs</option>
                <option value="Pharmacy (B.Pharm)">Pharmacy (B.Pharm) — Min ₹15.00 Lakhs</option>
                <option value="Architecture & Planning">Architecture & Planning — Min ₹15.00 Lakhs</option>
                <option value="Polytechnic / Diploma">Polytechnic / Diploma — Min ₹15.00 Lakhs</option>
                <option value="New Technical Institution (Comprehensive)">New Technical Comprehensive — Min ₹1.00 Crore</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Regional Jurisdiction Office *
              </label>
              <select
                value={formData.regional_office}
                onChange={(e) => setFormData({ ...formData, regional_office: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white focus:border-teal-600 focus:outline-none"
              >
                <option value="Western Regional Office (WRO), Mumbai">Western Regional Office (WRO), Mumbai</option>
                <option value="Northern Regional Office (NRO), Kanpur">Northern Regional Office (NRO), Kanpur</option>
                <option value="North-West Regional Office (NWRO), Chandigarh">North-West Regional Office (NWRO), Chandigarh</option>
                <option value="Southern Regional Office (SRO), Chennai">Southern Regional Office (SRO), Chennai</option>
                <option value="South-Western Regional Office (SWRO), Bengaluru">South-Western Regional Office (SWRO), Bengaluru</option>
                <option value="Eastern Regional Office (ERO), Kolkata">Eastern Regional Office (ERO), Kolkata</option>
                <option value="Central Regional Office (CRO), Bhopal">Central Regional Office (CRO), Bhopal</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-semibold text-xs rounded transition-colors"
            >
              Next: Document & Extraction <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Document Upload & Sample Selector */}
      {step === 2 && (
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Select or Upload FDR Document Scan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose an authentic banking receipt preset to test the Python Document Understanding Engine, or upload a custom file.
            </p>
          </div>

          {/* Preset Samples */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(SAMPLE_PRESETS).map(([key, item]) => (
              <div
                key={key}
                onClick={() => setSelectedSample(key)}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedSample === key
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-900">{item.label}</div>
                  <input
                    type="radio"
                    name="samplePreset"
                    checked={selectedSample === key}
                    onChange={() => setSelectedSample(key)}
                    className="text-teal-600"
                  />
                </div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {item.desc}
                </div>
                <div className="mt-2 text-[10px] font-mono text-teal-800 font-medium">
                  Result: {item.expectedOutcome}
                </div>
              </div>
            ))}
          </div>

          {/* Simulated File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-700">
              Attached Document: <span className="font-mono text-teal-700">{selectedSample}.pdf</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Supported formats: PDF, High-Resolution TIFF, JPEG (Min 300 DPI recommended for OCR parsing).
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={handleRunExtraction}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-semibold text-xs rounded transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Running Python OCR Engine...' : 'Run Document Extraction'} <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review Extracted Entities */}
      {step === 3 && (
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Extracted Banking Entities & Confidence Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Parsed by Python Document Extraction Engine. Review and edit any field before running compliance validation.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Confidence &ge; 94%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FDR Reference Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  FDR Reference Number <span className="text-rose-500">*</span>
                </label>
                {formValidation.errors.fdr_number && (touched.fdr_number || !formData.fdr_number) && (
                  <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    Required
                  </span>
                )}
              </div>
              <input
                type="text"
                name="fdr_number"
                value={formData.fdr_number}
                onChange={(e) => handleFieldChange('fdr_number', e.target.value)}
                onBlur={() => handleBlur('fdr_number')}
                placeholder="e.g. HDFC-ND-2024-88491"
                aria-invalid={Boolean(formValidation.errors.fdr_number && (touched.fdr_number || !formData.fdr_number))}
                aria-describedby="fdr-error"
                className={`w-full p-2 text-xs border rounded font-mono transition-colors focus:outline-none ${
                  formValidation.errors.fdr_number && (touched.fdr_number || !formData.fdr_number)
                    ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formValidation.errors.fdr_number && (touched.fdr_number || !formData.fdr_number) && (
                <p id="fdr-error" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formValidation.errors.fdr_number}</span>
                </p>
              )}
            </div>

            {/* Deposit Principal (INR) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Deposit Principal (INR) <span className="text-rose-500">*</span>
                </label>
                {formValidation.errors.deposit_amount_inr && (touched.deposit_amount_inr || !formData.deposit_amount_inr) && (
                  <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    Required &gt; ₹0
                  </span>
                )}
              </div>
              <input
                type="number"
                name="deposit_amount_inr"
                value={formData.deposit_amount_inr || ''}
                onChange={(e) => handleFieldChange('deposit_amount_inr', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                onBlur={() => handleBlur('deposit_amount_inr')}
                placeholder="e.g. 3500000"
                aria-invalid={Boolean(formValidation.errors.deposit_amount_inr && (touched.deposit_amount_inr || !formData.deposit_amount_inr))}
                aria-describedby="amount-error"
                className={`w-full p-2 text-xs border rounded font-mono tabular-nums transition-colors focus:outline-none ${
                  formValidation.errors.deposit_amount_inr && (touched.deposit_amount_inr || !formData.deposit_amount_inr)
                    ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formValidation.errors.deposit_amount_inr && (touched.deposit_amount_inr || !formData.deposit_amount_inr) && (
                <p id="amount-error" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formValidation.errors.deposit_amount_inr}</span>
                </p>
              )}
            </div>

            {/* Issuing Scheduled Bank */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Issuing Scheduled Bank <span className="text-rose-500">*</span>
                </label>
                {formValidation.errors.bank_name && (touched.bank_name || !formData.bank_name) && (
                  <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    Required
                  </span>
                )}
              </div>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={(e) => handleFieldChange('bank_name', e.target.value)}
                onBlur={() => handleBlur('bank_name')}
                placeholder="e.g. State Bank of India"
                aria-invalid={Boolean(formValidation.errors.bank_name && (touched.bank_name || !formData.bank_name))}
                aria-describedby="bank-error"
                className={`w-full p-2 text-xs border rounded transition-colors focus:outline-none ${
                  formValidation.errors.bank_name && (touched.bank_name || !formData.bank_name)
                    ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formValidation.errors.bank_name && (touched.bank_name || !formData.bank_name) && (
                <p id="bank-error" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formValidation.errors.bank_name}</span>
                </p>
              )}
            </div>

            {/* Branch IFSC Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Branch IFSC Code <span className="text-rose-500">*</span>
                </label>
                {formValidation.errors.branch_ifsc && (touched.branch_ifsc || !formData.branch_ifsc) && (
                  <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    Required
                  </span>
                )}
              </div>
              <input
                type="text"
                name="branch_ifsc"
                value={formData.branch_ifsc}
                onChange={(e) => handleFieldChange('branch_ifsc', e.target.value)}
                onBlur={() => handleBlur('branch_ifsc')}
                placeholder="e.g. SBIN0000691"
                aria-invalid={Boolean(formValidation.errors.branch_ifsc && (touched.branch_ifsc || !formData.branch_ifsc))}
                aria-describedby="ifsc-error"
                className={`w-full p-2 text-xs border rounded font-mono transition-colors focus:outline-none ${
                  formValidation.errors.branch_ifsc && (touched.branch_ifsc || !formData.branch_ifsc)
                    ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formValidation.errors.branch_ifsc && (touched.branch_ifsc || !formData.branch_ifsc) && (
                <p id="ifsc-error" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formValidation.errors.branch_ifsc}</span>
                </p>
              )}
            </div>

            {/* Date of Issue */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Date of Issue <span className="text-rose-500">*</span>
                </label>
                {formValidation.errors.issue_date && (touched.issue_date || !formData.issue_date) && (
                  <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    Required
                  </span>
                )}
              </div>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={(e) => handleFieldChange('issue_date', e.target.value)}
                onBlur={() => handleBlur('issue_date')}
                aria-invalid={Boolean(formValidation.errors.issue_date && (touched.issue_date || !formData.issue_date))}
                aria-describedby="issue-error"
                className={`w-full p-2 text-xs border rounded font-mono transition-colors focus:outline-none ${
                  formValidation.errors.issue_date && (touched.issue_date || !formData.issue_date)
                    ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formValidation.errors.issue_date && (touched.issue_date || !formData.issue_date) && (
                <p id="issue-error" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formValidation.errors.issue_date}</span>
                </p>
              )}
            </div>

            {/* Date of Maturity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Date of Maturity <span className="text-rose-500">*</span>
                </label>
                {formValidation.errors.maturity_date && (touched.maturity_date || !formData.maturity_date) && (
                  <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    Required
                  </span>
                )}
              </div>
              <input
                type="date"
                name="maturity_date"
                value={formData.maturity_date}
                onChange={(e) => handleFieldChange('maturity_date', e.target.value)}
                onBlur={() => handleBlur('maturity_date')}
                aria-invalid={Boolean(formValidation.errors.maturity_date && (touched.maturity_date || !formData.maturity_date))}
                aria-describedby="maturity-error"
                className={`w-full p-2 text-xs border rounded font-mono transition-colors focus:outline-none ${
                  formValidation.errors.maturity_date && (touched.maturity_date || !formData.maturity_date)
                    ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formValidation.errors.maturity_date && (touched.maturity_date || !formData.maturity_date) && (
                <p id="maturity-error" className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{formValidation.errors.maturity_date}</span>
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Title / Joint Beneficiary (Lien Holder) *
              </label>
              <input
                type="text"
                value={formData.joint_holder_name}
                onChange={(e) => handleFieldChange('joint_holder_name', e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoRenewalCheck"
                checked={formData.auto_renewal_clause}
                onChange={(e) => handleFieldChange('auto_renewal_clause', e.target.checked)}
                className="rounded text-teal-600"
              />
              <label htmlFor="autoRenewalCheck" className="text-xs text-slate-700 font-medium">
                Mandatory Irrevocable Auto-Renewal Clause verified on banking certificate
              </label>
            </div>
          </div>

          {/* Validation Summary Warning if Incomplete */}
          {!formValidation.isValid && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold">Mandatory Submission Fields Incomplete: </span>
                Please provide valid entries for <span className="font-medium underline">{formValidation.missingFieldLabels.join(', ')}</span> before running compliance checks.
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="flex items-center gap-3">
              {!formValidation.isValid && (
                <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                  Mandatory fields required to proceed
                </span>
              )}
              <button
                onClick={handleRunValidation}
                disabled={!formValidation.isValid || isProcessing}
                aria-disabled={!formValidation.isValid || isProcessing}
                title={!formValidation.isValid ? `Please fill in: ${formValidation.missingFieldLabels.join(', ')}` : 'Run AICTE Regulatory Rules Engine'}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-semibold text-xs rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? 'Executing Rules Engine...' : 'Run Compliance Engine'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Compliance Findings & Final Submission */}
      {step === 4 && (
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Explainable Regulatory Compliance Findings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic rule evaluation based on AICTE Approval Process Handbook (Table 2.1).
            </p>
          </div>

          <div className="space-y-3">
            {complianceFindings.map((finding, idx) => {
              const isPassed = finding.status === 'PASSED';
              const isFailed = finding.status === 'FAILED';
              const isReview = finding.status === 'NEEDS_REVIEW';

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-xs ${
                    isPassed
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                      : isFailed
                      ? 'border-red-200 bg-red-50/40 text-red-950'
                      : 'border-amber-200 bg-amber-50/40 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-1.5">
                      {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isFailed && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {isReview && <HelpCircle className="w-4 h-4 text-amber-600" />}
                      <span>{finding.rule_title}</span>
                      <span className="font-mono text-[10px] text-slate-500">({finding.rule_id})</span>
                    </div>
                    <span className={`font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded border ${
                      isPassed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      isFailed ? 'bg-red-100 text-red-800 border-red-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {finding.status}
                    </span>
                  </div>

                  <div className="mt-1.5 text-slate-700 leading-relaxed">
                    {finding.reason}
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white/70 p-2 rounded border border-slate-200/60 font-mono">
                    <div>
                      <span className="text-slate-400 font-sans">Extracted:</span> {finding.extracted_value}
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans">Required Norm:</span> {finding.expected_value}
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                    <span className="font-medium text-slate-600">Evidence Citation:</span>
                    <span>{finding.evidence_citation}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Declaration */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
            <strong>Applicant Declaration:</strong> I hereby certify that the information entered is authentic and corresponds to the official Fixed Deposit Receipt issued by the scheduled bank in favor of AICTE.
          </div>

          {!formValidation.isValid && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold">Cannot submit application:</span> Mandatory fields ({formValidation.missingFieldLabels.join(', ')}) are incomplete or invalid. Please click &quot;Edit Fields&quot; to correct them.
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Edit Fields
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={!formValidation.isValid || isProcessing}
              aria-disabled={!formValidation.isValid || isProcessing}
              title={!formValidation.isValid ? `Mandatory fields incomplete: ${formValidation.missingFieldLabels.join(', ')}` : 'Submit Application to National Scrutiny Registry'}
              className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-bold text-xs rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              {isProcessing ? 'Submitting to National Registry...' : 'Confirm & Submit to Scrutiny Officer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
