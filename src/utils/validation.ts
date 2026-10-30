/**
 * AICTE SmartTrack - Submission Form Validation Engine
 * Enforces mandatory regulatory inputs: FDR Reference Number, Deposit Principal, Maturity Date, etc.
 */

export interface SubmissionFormData {
  institution_name?: string;
  institution_code?: string;
  program_category?: string;
  regional_office?: string;
  bank_name?: string;
  branch_name?: string;
  branch_ifsc?: string;
  fdr_number?: string;
  deposit_amount_inr?: number;
  deposit_amount_words?: string;
  issue_date?: string;
  maturity_date?: string;
  tenure_years?: number;
  joint_holder_name?: string;
  auto_renewal_clause?: boolean;
}

export interface SubmissionFormErrors {
  fdr_number?: string;
  deposit_amount_inr?: string;
  maturity_date?: string;
  issue_date?: string;
  bank_name?: string;
  branch_ifsc?: string;
  joint_holder_name?: string;
}

export interface SubmissionValidationResult {
  isValid: boolean;
  errors: SubmissionFormErrors;
  missingFieldLabels: string[];
}

export function validateSubmissionFormData(formData: SubmissionFormData): SubmissionValidationResult {
  const errors: SubmissionFormErrors = {};
  const missingFieldLabels: string[] = [];

  // 1. Mandatory FDR Number
  if (!formData.fdr_number || !formData.fdr_number.trim()) {
    errors.fdr_number = 'FDR Reference Number is mandatory';
    missingFieldLabels.push('FDR Reference Number');
  } else if (formData.fdr_number.trim().length < 3) {
    errors.fdr_number = 'FDR Reference Number must be at least 3 characters';
    missingFieldLabels.push('Valid FDR Reference Number');
  }

  // 2. Mandatory Deposit Principal (Amount)
  const amount = Number(formData.deposit_amount_inr);
  if (
    formData.deposit_amount_inr === undefined ||
    formData.deposit_amount_inr === null ||
    isNaN(amount) ||
    amount <= 0
  ) {
    errors.deposit_amount_inr = 'Deposit principal amount is mandatory and must be greater than ₹0';
    missingFieldLabels.push('Deposit Principal (Amount)');
  }

  // 3. Mandatory Date of Issue
  if (!formData.issue_date || !formData.issue_date.trim()) {
    errors.issue_date = 'Date of Issue is mandatory';
    missingFieldLabels.push('Date of Issue');
  }

  // 4. Mandatory Date of Maturity
  if (!formData.maturity_date || !formData.maturity_date.trim()) {
    errors.maturity_date = 'Date of Maturity is mandatory';
    missingFieldLabels.push('Date of Maturity');
  } else if (isNaN(new Date(formData.maturity_date).getTime())) {
    errors.maturity_date = 'Maturity date is not a valid calendar date';
    missingFieldLabels.push('Valid Date of Maturity');
  } else if (formData.issue_date && !isNaN(new Date(formData.issue_date).getTime())) {
    const issueTime = new Date(formData.issue_date).getTime();
    const maturityTime = new Date(formData.maturity_date).getTime();
    if (maturityTime <= issueTime) {
      errors.maturity_date = 'Date of Maturity must be chronologically after the Date of Issue';
      missingFieldLabels.push('Maturity Date > Issue Date');
    }
  }

  // 5. Mandatory Issuing Bank
  if (!formData.bank_name || !formData.bank_name.trim()) {
    errors.bank_name = 'Issuing Scheduled Bank name is mandatory';
    missingFieldLabels.push('Issuing Bank Name');
  }

  // 6. Mandatory Branch IFSC Code
  if (!formData.branch_ifsc || !formData.branch_ifsc.trim()) {
    errors.branch_ifsc = 'Branch IFSC Code is mandatory';
    missingFieldLabels.push('Branch IFSC Code');
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    missingFieldLabels
  };
}
