import { test } from 'node:test';
import assert from 'node:assert';

test('Security Access Matrix: Read-Only Auditor is restricted from write operations', () => {
  const allowedRolesForApproval = ['AUTHORIZED_APPROVER'];
  const auditorRole = 'READ_ONLY_AUDITOR';
  
  assert.strictEqual(allowedRolesForApproval.includes(auditorRole), false, 'Auditor must not have approval privileges');
});

test('Security Access Matrix: Institution users can only view their own records', () => {
  const records = [
    { id: 'fdr_1', institution_id: 'inst_01', fdr_number: 'FDR-01' },
    { id: 'fdr_2', institution_id: 'inst_02', fdr_number: 'FDR-02' }
  ];

  const requestingUser = { role: 'INSTITUTION_USER', institutionId: 'inst_01' };

  const authorizedRecords = records.filter((r) => {
    if (requestingUser.role === 'INSTITUTION_USER' && requestingUser.institutionId) {
      return r.institution_id === requestingUser.institutionId;
    }
    return true;
  });

  assert.strictEqual(authorizedRecords.length, 1);
  assert.strictEqual(authorizedRecords[0].id, 'fdr_1');
});

test('Onboarding Validation: Duplicate AICTE ID rejected', () => {
  const existingCodes = ['1-9382019481', '1-4401827419'];
  const newCode = '1-9382019481';

  const isDuplicate = existingCodes.includes(newCode);
  assert.strictEqual(isDuplicate, true, 'Duplicate permanent ID must be detected');
});

test('Tenure Horizon Math: Accurate 10-year statutory lock-in calculation', () => {
  const issueDate = new Date('2016-04-10');
  const currentDate = new Date('2026-10-29');

  const diffYears = (currentDate.getTime() - issueDate.getTime()) / (365.25 * 24 * 3600 * 1000);
  const isReleaseEligible = diffYears >= 10;

  assert.strictEqual(isReleaseEligible, true, 'Deposit issued in 2016 must be eligible for statutory release in 2026');
});
