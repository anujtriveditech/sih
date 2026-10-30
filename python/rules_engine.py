"""
AICTE SmartTrack - Deterministic Compliance Validation Engine
Implements strict regulatory norms and explainable validation checks
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date
from .models import (
    CheckStatus,
    ComplianceFinding,
    FDRApplication,
    LifecycleState
)

# AICTE Prescribed Minimum Security Deposit Norms (in INR)
DEFAULT_DEPOSIT_THRESHOLDS = {
    "Engineering & Technology (UG)": 3500000.0,      # ₹35 Lakhs
    "Engineering & Technology (PG/Integrated)": 5000000.0, # ₹50 Lakhs
    "Management (MBA/PGDM)": 1500000.0,              # ₹15 Lakhs
    "Pharmacy (B.Pharm)": 1500000.0,                 # ₹15 Lakhs
    "Architecture & Planning": 1500000.0,            # ₹15 Lakhs
    "Applied Arts & Crafts": 1000000.0,              # ₹10 Lakhs
    "Polytechnic / Diploma": 1500000.0,              # ₹15 Lakhs
    "New Technical Institution (Comprehensive)": 10000000.0 # ₹1.00 Crore
}

SCHEDULED_COMMERCIAL_BANKS = [
    "State Bank of India",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Indian Bank",
    "Bank of India",
    "Central Bank of India",
    "IDBI Bank",
    "Federal Bank",
    "IndusInd Bank"
]

class ComplianceEngine:
    """
    Deterministic rule engine that validates FDR attributes against AICTE norms.
    Every check produces an explainable finding with evidence citations and recommended actions.
    """

    def __init__(self, custom_thresholds: Optional[Dict[str, float]] = None):
        self.thresholds = custom_thresholds or DEFAULT_DEPOSIT_THRESHOLDS

    def validate(self, app_data: Dict[str, Any], existing_fdr_numbers: Optional[List[str]] = None) -> List[ComplianceFinding]:
        findings: List[ComplianceFinding] = []
        existing_fdr_numbers = existing_fdr_numbers or []

        # 1. Deposit Amount Compliance Check
        program = app_data.get("program_category", "Engineering & Technology (UG)")
        required_min = self.thresholds.get(program, 3500000.0)
        actual_amount = float(app_data.get("deposit_amount_inr", 0.0))

        if actual_amount <= 0:
            findings.append(ComplianceFinding(
                rule_id="RULE-AMT-001",
                rule_title="Deposit Amount Completeness",
                check_item="Principal Deposit Amount",
                extracted_value=actual_amount,
                expected_value=f">= ₹{required_min:,.2f}",
                status=CheckStatus.FAILED,
                reason="The extracted or entered FDR amount is zero or missing.",
                evidence_citation="FDR Certificate - Amount Box",
                recommended_action="Re-upload legible FDR certificate or manually verify amount with bank.",
                severity="HIGH"
            ))
        elif actual_amount < required_min:
            shortfall = required_min - actual_amount
            findings.append(ComplianceFinding(
                rule_id="RULE-AMT-002",
                rule_title="AICTE Mandatory Deposit Sufficiency",
                check_item=f"Prescribed Threshold for {program}",
                extracted_value=f"₹{actual_amount:,.2f}",
                expected_value=f"₹{required_min:,.2f}",
                status=CheckStatus.FAILED,
                reason=f"FDR principal amount is ₹{shortfall:,.2f} below the AICTE prescribed minimum threshold for {program}.",
                evidence_citation="AICTE Approval Process Handbook (APH) Table 2.1 & FDR Certificate",
                recommended_action=f"Submit supplementary FDR of ₹{shortfall:,.2f} or replace with unified deposit.",
                severity="HIGH"
            ))
        else:
            findings.append(ComplianceFinding(
                rule_id="RULE-AMT-002",
                rule_title="AICTE Mandatory Deposit Sufficiency",
                check_item=f"Prescribed Threshold for {program}",
                extracted_value=f"₹{actual_amount:,.2f}",
                expected_value=f">= ₹{required_min:,.2f}",
                status=CheckStatus.PASSED,
                reason=f"FDR principal satisfies and exceeds the prescribed requirement of ₹{required_min:,.2f}.",
                evidence_citation="AICTE Approval Process Handbook & FDR Certificate Amount Box",
                recommended_action="No action needed. Amount is compliant.",
                severity="LOW"
            ))

        # 2. Joint Lien & Beneficiary Check
        # AICTE requires FDR in joint name: "Member Secretary, AICTE" or "AICTE" and "Institution/Society"
        joint_holder = str(app_data.get("joint_holder_name", "")).strip()
        inst_name = str(app_data.get("institution_name", "")).strip()

        has_aicte = ("aicte" in joint_holder.lower() or 
                     "all india council for technical education" in joint_holder.lower() or
                     "member secretary" in joint_holder.lower())

        if not joint_holder:
            findings.append(ComplianceFinding(
                rule_id="RULE-LIEN-001",
                rule_title="Joint Name / AICTE Lien Endorsement",
                check_item="Joint Holder Endorsement",
                extracted_value="Missing",
                expected_value="Jointly with 'Member Secretary, AICTE' or 'AICTE'",
                status=CheckStatus.FAILED,
                reason="No joint account holder or lien endorsement detected on the FDR certificate.",
                evidence_citation="FDR Certificate - Account Title / In Favor Of line",
                recommended_action="Request bank to issue amendment endorsement letter establishing joint lien with AICTE.",
                severity="HIGH"
            ))
        elif not has_aicte:
            findings.append(ComplianceFinding(
                rule_id="RULE-LIEN-001",
                rule_title="Joint Name / AICTE Lien Endorsement",
                check_item="AICTE Lien Representation",
                extracted_value=joint_holder,
                expected_value="Must include 'AICTE' or 'Member Secretary, AICTE'",
                status=CheckStatus.FAILED,
                reason=f"FDR is drawn in name of '{joint_holder}' without explicit AICTE joint lien endorsement.",
                evidence_citation="FDR Certificate - Title of Account",
                recommended_action="Obtain Lien Marking Certificate from bank branch honoring AICTE first charge.",
                severity="HIGH"
            ))
        else:
            findings.append(ComplianceFinding(
                rule_id="RULE-LIEN-001",
                rule_title="Joint Name / AICTE Lien Endorsement",
                check_item="AICTE Lien Representation",
                extracted_value=joint_holder,
                expected_value="Lien marked to AICTE",
                status=CheckStatus.PASSED,
                reason="FDR has verified joint lien endorsement in favor of AICTE.",
                evidence_citation="FDR Certificate - Account Holder designation",
                recommended_action="Verify physical signature and branch seal during bank confirmation.",
                severity="LOW"
            ))

        # 3. Scheduled Commercial Bank Verification
        bank_name = str(app_data.get("bank_name", "")).strip()
        is_scheduled = any(known.lower() in bank_name.lower() for known in SCHEDULED_COMMERCIAL_BANKS)

        if not bank_name:
            findings.append(ComplianceFinding(
                rule_id="RULE-BANK-001",
                rule_title="Issuing Bank Eligibility",
                check_item="Issuing Bank Entity",
                extracted_value="Missing",
                expected_value="RBI Scheduled Commercial Bank",
                status=CheckStatus.FAILED,
                reason="Issuing bank name could not be identified from document or submission.",
                evidence_citation="FDR Certificate Header",
                recommended_action="Provide issuing bank and branch details.",
                severity="HIGH"
            ))
        elif not is_scheduled:
            findings.append(ComplianceFinding(
                rule_id="RULE-BANK-001",
                rule_title="Issuing Bank Eligibility",
                check_item="Scheduled Commercial Bank Status",
                extracted_value=bank_name,
                expected_value="RBI Approved Scheduled Commercial Bank",
                status=CheckStatus.NEEDS_REVIEW,
                reason=f"Bank '{bank_name}' requires manual verification against RBI's Second Schedule registry.",
                evidence_citation="Reserve Bank of India Second Schedule Bank Directory",
                recommended_action="Officer to verify RBI license category for non-standard or cooperative bank.",
                severity="MEDIUM"
            ))
        else:
            findings.append(ComplianceFinding(
                rule_id="RULE-BANK-001",
                rule_title="Issuing Bank Eligibility",
                check_item="Scheduled Commercial Bank Status",
                extracted_value=bank_name,
                expected_value="RBI Approved Scheduled Commercial Bank",
                status=CheckStatus.PASSED,
                reason=f"'{bank_name}' is a recognized Scheduled Commercial Bank under RBI regulations.",
                evidence_citation="RBI Master Circular on Banking Institutions",
                recommended_action="Proceed to branch verification.",
                severity="LOW"
            ))

        # 4. Tenure and Chronological Date Consistency
        issue_date_str = app_data.get("issue_date")
        maturity_date_str = app_data.get("maturity_date")
        tenure_years = app_data.get("tenure_years", 0)

        date_valid = False
        calculated_tenure = 0.0

        if issue_date_str and maturity_date_str:
            try:
                # Handle ISO format YYYY-MM-DD
                d_issue = datetime.fromisoformat(issue_date_str.split("T")[0]).date()
                d_maturity = datetime.fromisoformat(maturity_date_str.split("T")[0]).date()

                if d_maturity <= d_issue:
                    findings.append(ComplianceFinding(
                        rule_id="RULE-DATE-001",
                        rule_title="Chronological Date Sequence",
                        check_item="Issue vs Maturity Date Order",
                        extracted_value=f"Issue: {d_issue}, Maturity: {d_maturity}",
                        expected_value="Maturity Date > Issue Date",
                        status=CheckStatus.FAILED,
                        reason="Maturity date is on or before the issue date.",
                        evidence_citation="FDR Certificate Date Blocks",
                        recommended_action="Request corrected FDR certificate from issuing branch.",
                        severity="HIGH"
                    ))
                else:
                    days_diff = (d_maturity - d_issue).days
                    calculated_tenure = round(days_diff / 365.25, 2)
                    date_valid = True
            except Exception as e:
                findings.append(ComplianceFinding(
                    rule_id="RULE-DATE-001",
                    rule_title="Date Format & Parsing",
                    check_item="Date String Parsing",
                    extracted_value=f"{issue_date_str} / {maturity_date_str}",
                    expected_value="Valid ISO Date (YYYY-MM-DD)",
                    status=CheckStatus.FAILED,
                    reason=f"Date parsing error: {str(e)}",
                    evidence_citation="FDR Certificate Header / Body",
                    recommended_action="Check extracted dates and enter valid YYYY-MM-DD formats.",
                    severity="HIGH"
                ))

        if date_valid:
            # AICTE Standard tenure is 8.0 years (96 months) for UG/PG programs; minimum permissible with rollover is 5.0 years
            min_tenure = 8.0
            if calculated_tenure < 4.0:
                findings.append(ComplianceFinding(
                    rule_id="RULE-TENURE-001",
                    rule_title="Mandatory Lock-in Tenure Horizon",
                    check_item="Tenure Duration",
                    extracted_value=f"{calculated_tenure} years ({days_diff} days)",
                    expected_value=">= 8.0 years (or minimum 5.0 years with irrevocable renewal)",
                    status=CheckStatus.FAILED,
                    reason=f"Deposit tenure of {calculated_tenure} years is severely below the AICTE statutory 8-year requirement. Short-term deposit violates regulatory lock-in mandate.",
                    evidence_citation="AICTE APH Chapter 2, Clause 2.14 & Clause 6.46",
                    recommended_action="Instruct institution to amend deposit term to 8 or 10 years or furnish auto-renewal deed from issuing bank.",
                    severity="HIGH"
                ))
            elif calculated_tenure < min_tenure:
                findings.append(ComplianceFinding(
                    rule_id="RULE-TENURE-001",
                    rule_title="Minimum Prescribed Tenure",
                    check_item="Tenure Duration",
                    extracted_value=f"{calculated_tenure} years ({days_diff} days)",
                    expected_value=">= 8.0 years standard",
                    status=CheckStatus.NEEDS_REVIEW,
                    reason=f"Deposit tenure of {calculated_tenure} years is under the recommended 8-year standard. Irrevocable auto-renewal mandate is mandatory.",
                    evidence_citation="AICTE APH Guidelines Chapter 2, Clause 2.14",
                    recommended_action="Ensure irrevocable auto-renewal mandate is on file if tenure is under 8 years.",
                    severity="MEDIUM"
                ))
            else:
                findings.append(ComplianceFinding(
                    rule_id="RULE-TENURE-001",
                    rule_title="Minimum Prescribed Tenure",
                    check_item="Tenure Duration",
                    extracted_value=f"{calculated_tenure} years",
                    expected_value=">= 8.0 years",
                    status=CheckStatus.PASSED,
                    reason=f"Tenure of {calculated_tenure} years fully satisfies AICTE regulatory lock-in requirements.",
                    evidence_citation="FDR Certificate Maturity Block",
                    recommended_action="Add to maturity monitoring schedule.",
                    severity="LOW"
                ))

        # 5. Auto-Renewal Clause Check
        auto_renewal = app_data.get("auto_renewal_clause", False)
        if not auto_renewal:
            findings.append(ComplianceFinding(
                rule_id="RULE-RENEW-001",
                rule_title="Irrevocable Auto-Renewal Clause",
                check_item="Special Instructions / Rollover Clause",
                extracted_value="Not Specified or Disabled",
                expected_value="Mandatory Auto-Renewal on Maturity until AICTE Release NOC",
                status=CheckStatus.NEEDS_REVIEW,
                reason="Document does not explicitly mention automatic rollover on maturity in favor of AICTE.",
                evidence_citation="FDR Terms & Conditions / Special Instructions",
                recommended_action="Obtain written undertaking from bank branch confirming automatic renewal until NOC.",
                severity="MEDIUM"
            ))
        else:
            findings.append(ComplianceFinding(
                rule_id="RULE-RENEW-001",
                rule_title="Irrevocable Auto-Renewal Clause",
                check_item="Special Instructions / Rollover Clause",
                extracted_value="Auto-Renewal Enabled",
                expected_value="Mandatory Auto-Renewal on Maturity",
                status=CheckStatus.PASSED,
                reason="Automatic rollover on maturity is registered with the branch.",
                evidence_citation="FDR Terms & Conditions endorsement",
                recommended_action="Maintain record in automated renewal alert tracker.",
                severity="LOW"
            ))

        # 6. Duplicate FDR Reference Check
        fdr_num = str(app_data.get("fdr_number", "")).strip().upper()
        current_id = str(app_data.get("id", ""))
        
        if not fdr_num or len(fdr_num) < 4:
            findings.append(ComplianceFinding(
                rule_id="RULE-DUP-001",
                rule_title="FDR Reference Integrity",
                check_item="FDR / Deposit Receipt Number",
                extracted_value=fdr_num or "Empty",
                expected_value="Unique alphanumeric bank receipt identifier",
                status=CheckStatus.FAILED,
                reason="FDR identifier is missing or invalid.",
                evidence_citation="FDR Certificate top-right reference block",
                recommended_action="Re-scan top right corner of FDR certificate for receipt number.",
                severity="HIGH"
            ))
        elif fdr_num in [num.upper() for num in existing_fdr_numbers]:
            findings.append(ComplianceFinding(
                rule_id="RULE-DUP-001",
                rule_title="Duplicate Submission Protection",
                check_item="FDR Reference Uniqueness",
                extracted_value=fdr_num,
                expected_value="Unique across all institution submissions",
                status=CheckStatus.FAILED,
                reason=f"FDR reference number '{fdr_num}' matches an existing active submission in the system.",
                evidence_citation="SmartTrack Master FDR Registry",
                recommended_action="Investigate whether this is a resubmission or a duplicate document reuse.",
                severity="HIGH"
            ))
        else:
            findings.append(ComplianceFinding(
                rule_id="RULE-DUP-001",
                rule_title="Duplicate Submission Protection",
                check_item="FDR Reference Uniqueness",
                extracted_value=fdr_num,
                expected_value="Unique identifier",
                status=CheckStatus.PASSED,
                reason="No duplicate FDR reference detected in the national repository.",
                evidence_citation="SmartTrack Master FDR Registry",
                recommended_action="Proceed to officer scrutiny.",
                severity="LOW"
            ))

        return findings
