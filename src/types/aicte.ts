/**
 * AICTE SmartTrack - Core TypeScript Types & Interfaces
 */

export type LifecycleState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'BANK_CONFIRMATION_PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RENEWAL_PENDING'
  | 'RELEASE_PENDING'
  | 'RELEASED'
  | 'EXPIRED';

export type CheckStatus =
  | 'PASSED'
  | 'FAILED'
  | 'NEEDS_REVIEW'
  | 'NOT_CHECKED'
  | 'UNABLE_TO_DETERMINE';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type UserRole =
  | 'INSTITUTION_USER'
  | 'REVIEWING_OFFICER'
  | 'AUTHORIZED_APPROVER'
  | 'ADMINISTRATOR'
  | 'READ_ONLY_AUDITOR';

export interface Institution {
  id: string;
  name: string;
  code: string; // AICTE Permanent ID
  type: string;
  regionalOffice: string;
  city: string;
  state: string;
  accreditedPrograms: string[];
  totalFdrCount: number;
  totalDepositAmountInr: number;
  complianceRating: 'COMPLIANT' | 'NEEDS_ATTENTION' | 'NON_COMPLIANT';
  principalName: string;
  contactEmail: string;
  contactPhone: string;
  registeredTrust: string;
  establishedYear: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  institutionId?: string;
  institutionName?: string;
  regionalOffice?: string;
  email: string;
}

export interface ExtractedField {
  name: string;
  value: any;
  confidence: number;
  source_document: string;
  page_number: number;
  bounding_box?: { x: number; y: number; width: number; height: number };
  validation_status: string;
  review_status?: string;
  correction_note?: string;
}

export interface ComplianceFinding {
  rule_id: string;
  rule_title: string;
  check_item: string;
  extracted_value: any;
  expected_value: any;
  status: CheckStatus;
  reason: string;
  evidence_citation: string;
  recommended_action: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RiskBreakdown {
  factor_name: string;
  points_added: number;
  max_points: number;
  explanation: string;
  severity: string;
}

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  breakdown: RiskBreakdown[];
  summary: string;
  primary_recommendation: string;
}

export interface BankConfirmationRecord {
  status: string;
  reference_number?: string;
  branch_officer_name?: string;
  branch_contact?: string;
  verification_date?: string;
  confirmation_letter_url?: string;
  notes?: string;
  is_verified: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action_type: string;
  details: string;
  previous_state?: string;
  new_state?: string;
  ip_address?: string;
}

export interface FDRApplication {
  id: string;
  application_number: string;
  institution_id: string;
  institution_name: string;
  institution_code: string;
  program_category: string;
  regional_office: string;
  fdr_number: string;
  bank_name: string;
  branch_name: string;
  branch_ifsc: string;
  deposit_amount_inr: number;
  deposit_amount_words: string;
  issue_date: string;
  maturity_date: string;
  tenure_years: number;
  joint_holder_name: string;
  auto_renewal_clause: boolean;
  status: LifecycleState;
  assigned_officer_id?: string;
  assigned_officer_name?: string;
  extracted_fields: Record<string, ExtractedField>;
  compliance_findings: ComplianceFinding[];
  risk_score: RiskScoreResult;
  bank_confirmation?: BankConfirmationRecord;
  audit_trail: AuditEntry[];
  documents: Array<{
    id: string;
    type: string;
    name: string;
    size: string;
    upload_date: string;
    status: string;
    url?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface RuleSetting {
  id: string;
  category: string;
  minimum_amount_inr: number;
  standard_tenure_years: number;
  mandatory_auto_renewal: boolean;
  joint_lien_mandatory: boolean;
}
