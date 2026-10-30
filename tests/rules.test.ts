import test from 'node:test';
import assert from 'node:assert/strict';

// Core logic helpers matching AICTE norms
export function checkDepositSufficiency(amount: number, category: string): { compliant: boolean; shortfall: number } {
  const thresholds: Record<string, number> = {
    'Engineering & Technology (UG)': 3500000,
    'Engineering & Technology (PG/Integrated)': 5000000,
    'Management (MBA/PGDM)': 1500000,
    'Pharmacy (B.Pharm)': 1500000,
    'Polytechnic / Diploma': 1500000,
    'New Technical Institution (Comprehensive)': 10000000
  };

  const minRequired = thresholds[category] ?? 3500000;
  const shortfall = Math.max(0, minRequired - amount);
  return {
    compliant: amount >= minRequired,
    shortfall
  };
}

export function calculateDaysToMaturity(maturityDateStr: string, currentDateStr: string = '2026-10-29'): number {
  const dMat = new Date(maturityDateStr);
  const dCur = new Date(currentDateStr);
  const diffTime = dMat.getTime() - dCur.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function computeRiskPriority(daysToMaturity: number, failedChecksCount: number, bankConfirmed: boolean): { score: number; level: string } {
  let score = 0;
  if (daysToMaturity < 0) score += 45;
  else if (daysToMaturity <= 30) score += 35;
  else if (daysToMaturity <= 90) score += 20;

  if (failedChecksCount > 0) score += Math.min(30, failedChecksCount * 15);
  if (!bankConfirmed) score += 15;

  score = Math.min(100, Math.max(0, score));

  let level = 'LOW';
  if (score >= 75) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  return { score, level };
}

export function checkClause646ReleaseEligibility(params: {
  lockInCompleted: boolean;
  hasAffidavit6: boolean;
  hasLatestLoaOrEoa: boolean;
  hasUniversityNoc: boolean;
  hasBankVerification: boolean;
}): { eligible: boolean; pendingClearances: string[] } {
  const pendingClearances: string[] = [];
  if (!params.lockInCompleted) pendingClearances.push('Mandatory 8/10-year statutory lock-in period has not elapsed');
  if (!params.hasAffidavit6) pendingClearances.push('Statutory Affidavit 6 (Undertaking of No Pending Dues/Liabilities) missing');
  if (!params.hasLatestLoaOrEoa) pendingClearances.push('Current academic year Letter of Approval / Extension of Approval missing');
  if (!params.hasUniversityNoc) pendingClearances.push('Affiliating University / State Directorate No-Objection Certificate missing');
  if (!params.hasBankVerification) pendingClearances.push('Issuing Bank CBS verification of unencumbered lien missing');

  return {
    eligible: pendingClearances.length === 0,
    pendingClearances
  };
}

test('checkDepositSufficiency validates approved engineering UG threshold', () => {
  const res = checkDepositSufficiency(3500000, 'Engineering & Technology (UG)');
  assert.equal(res.compliant, true);
  assert.equal(res.shortfall, 0);
});

test('checkDepositSufficiency flags shortfall on sub-threshold deposits', () => {
  const res = checkDepositSufficiency(2500000, 'Engineering & Technology (UG)');
  assert.equal(res.compliant, false);
  assert.equal(res.shortfall, 1000000);
});

test('calculateDaysToMaturity correctly measures approaching maturity window', () => {
  const days = calculateDaysToMaturity('2026-11-20', '2026-10-29');
  assert.equal(days, 22);
});

test('calculateDaysToMaturity detects past-due expired deposits', () => {
  const days = calculateDaysToMaturity('2025-06-01', '2026-10-29');
  assert.ok(days < 0);
});

test('computeRiskPriority assigns CRITICAL when expired with compliance failure', () => {
  const result = computeRiskPriority(-100, 2, false);
  assert.equal(result.level, 'CRITICAL');
  assert.ok(result.score >= 75);
});

test('Clause 6.46 Release: Grants eligibility when all statutory conditions are met', () => {
  const result = checkClause646ReleaseEligibility({
    lockInCompleted: true,
    hasAffidavit6: true,
    hasLatestLoaOrEoa: true,
    hasUniversityNoc: true,
    hasBankVerification: true
  });
  assert.equal(result.eligible, true);
  assert.equal(result.pendingClearances.length, 0);
});

test('Clause 6.46 Release: Rejects premature request with missing Affidavit 6 and University NOC', () => {
  const result = checkClause646ReleaseEligibility({
    lockInCompleted: false, // premature
    hasAffidavit6: false, // missing
    hasLatestLoaOrEoa: true,
    hasUniversityNoc: false, // missing
    hasBankVerification: true
  });
  assert.equal(result.eligible, false);
  assert.equal(result.pendingClearances.length, 3);
  assert.ok(result.pendingClearances.some((c) => c.includes('lock-in')));
  assert.ok(result.pendingClearances.some((c) => c.includes('Affidavit 6')));
});

import { validateSubmissionFormData } from '../src/utils/validation';

test('validateSubmissionFormData: rejects missing FDR number, zero amount, and missing maturity date', () => {
  const emptyForm = {
    bank_name: '',
    branch_ifsc: '',
    fdr_number: '',
    deposit_amount_inr: 0,
    issue_date: '',
    maturity_date: ''
  };

  const validation = validateSubmissionFormData(emptyForm);
  assert.equal(validation.isValid, false);
  assert.ok(validation.errors.fdr_number);
  assert.ok(validation.errors.deposit_amount_inr);
  assert.ok(validation.errors.maturity_date);
  assert.ok(validation.missingFieldLabels.includes('FDR Reference Number'));
  assert.ok(validation.missingFieldLabels.includes('Deposit Principal (Amount)'));
  assert.ok(validation.missingFieldLabels.includes('Date of Maturity'));
});

test('validateSubmissionFormData: rejects maturity date earlier than issue date', () => {
  const invalidDateForm = {
    bank_name: 'State Bank of India',
    branch_ifsc: 'SBIN0000691',
    fdr_number: 'SBI-2024-998811',
    deposit_amount_inr: 3500000,
    issue_date: '2024-05-10',
    maturity_date: '2023-05-10' // Invalid: earlier than issue date
  };

  const validation = validateSubmissionFormData(invalidDateForm);
  assert.equal(validation.isValid, false);
  assert.ok(validation.errors.maturity_date?.includes('chronologically after'));
});

test('validateSubmissionFormData: passes on compliant mandatory data', () => {
  const validForm = {
    bank_name: 'HDFC Bank',
    branch_ifsc: 'HDFC0000003',
    fdr_number: 'HDFC-ND-2024-88491',
    deposit_amount_inr: 3500000,
    issue_date: '2024-03-15',
    maturity_date: '2032-03-15'
  };

  const validation = validateSubmissionFormData(validForm);
  assert.equal(validation.isValid, true);
  assert.equal(Object.keys(validation.errors).length, 0);
  assert.equal(validation.missingFieldLabels.length, 0);
});

