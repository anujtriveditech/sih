"""
AICTE SmartTrack - Core Data Models
Intelligent Security Deposit & FDR Management Platform
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime, date

class LifecycleState(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    CORRECTION_REQUIRED = "CORRECTION_REQUIRED"
    BANK_CONFIRMATION_PENDING = "BANK_CONFIRMATION_PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    RENEWAL_PENDING = "RENEWAL_PENDING"
    RELEASE_PENDING = "RELEASE_PENDING"
    RELEASED = "RELEASED"
    EXPIRED = "EXPIRED"

class CheckStatus(str, Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    NOT_CHECKED = "NOT_CHECKED"
    UNABLE_TO_DETERMINE = "UNABLE_TO_DETERMINE"

class RiskLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class UserRole(str, Enum):
    INSTITUTION_USER = "INSTITUTION_USER"
    REVIEWING_OFFICER = "REVIEWING_OFFICER"
    AUTHORIZED_APPROVER = "AUTHORIZED_APPROVER"
    ADMINISTRATOR = "ADMINISTRATOR"

@dataclass
class ExtractedField:
    name: str
    value: Any
    confidence: float
    source_document: str
    page_number: int
    bounding_box: Optional[Dict[str, float]] = None
    validation_status: str = "PENDING"
    review_status: str = "UNREVIEWED"
    correction_note: Optional[str] = None

@dataclass
class ComplianceFinding:
    rule_id: str
    rule_title: str
    check_item: str
    extracted_value: Any
    expected_value: Any
    status: CheckStatus
    reason: str
    evidence_citation: str
    recommended_action: str
    severity: str = "MEDIUM"

@dataclass
class RiskBreakdown:
    factor_name: str
    points_added: int
    max_points: int
    explanation: str
    severity: str

@dataclass
class RiskScoreResult:
    score: int
    level: RiskLevel
    breakdown: List[RiskBreakdown]
    summary: str
    primary_recommendation: str

@dataclass
class BankConfirmationRecord:
    status: str
    reference_number: Optional[str] = None
    branch_officer_name: Optional[str] = None
    branch_contact: Optional[str] = None
    verification_date: Optional[str] = None
    confirmation_letter_url: Optional[str] = None
    notes: Optional[str] = None
    is_verified: bool = False

@dataclass
class AuditEntry:
    id: str
    timestamp: str
    actor_name: str
    actor_role: str
    action_type: str
    details: str
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    ip_address: str = "127.0.0.1"

@dataclass
class FDRApplication:
    id: str
    application_number: str
    institution_id: str
    institution_name: str
    institution_code: str
    program_category: str
    regional_office: str
    fdr_number: str
    bank_name: str
    branch_name: str
    branch_ifsc: str
    deposit_amount_inr: float
    deposit_amount_words: str
    issue_date: str
    maturity_date: str
    tenure_years: int
    joint_holder_name: str
    auto_renewal_clause: bool
    status: LifecycleState
    assigned_officer_id: Optional[str] = None
    assigned_officer_name: Optional[str] = None
    extracted_fields: Dict[str, ExtractedField] = field(default_factory=dict)
    compliance_findings: List[ComplianceFinding] = field(default_factory=list)
    risk_score: Optional[RiskScoreResult] = None
    bank_confirmation: Optional[BankConfirmationRecord] = None
    audit_trail: List[AuditEntry] = field(default_factory=list)
    documents: List[Dict[str, Any]] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
