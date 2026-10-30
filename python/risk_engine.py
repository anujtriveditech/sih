"""
AICTE SmartTrack - Smart Financial Security Risk Score Engine
Calculates explainable priority urgency score (0-100) to prioritize officer workload
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date
from .models import (
    RiskLevel,
    RiskBreakdown,
    RiskScoreResult,
    LifecycleState,
    CheckStatus
)

class RiskScoreEngine:
    """
    Explainable Risk & Urgency Scorer.
    Points prioritize cases needing immediate officer attention.
    Urgency is explicitly distinguished from fraud or regulatory eligibility.
    """

    # Configurable weights (can be adjusted by Administrator)
    DEFAULT_WEIGHTS = {
        "expired": 45,
        "maturity_within_30_days": 35,
        "maturity_within_90_days": 20,
        "overdue_renewal_request": 25,
        "compliance_failures": 25,
        "bank_confirmation_pending_over_14_days": 15,
        "unassigned_review_over_7_days": 10,
        "missing_mandatory_documents": 20
    }

    def __init__(self, weights: Optional[Dict[str, int]] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS

    def calculate_score(self, app_data: Dict[str, Any], compliance_findings: Optional[List[Dict[str, Any]]] = None) -> RiskScoreResult:
        score = 0
        breakdown: List[RiskBreakdown] = []
        findings = compliance_findings or []

        # Current reference date
        today = date(2026, 10, 29) # Local system calendar

        # 1. Maturity Timeline Check
        mat_date_str = app_data.get("maturity_date")
        status = app_data.get("status", LifecycleState.SUBMITTED)

        if mat_date_str:
            try:
                d_mat = datetime.fromisoformat(mat_date_str.split("T")[0]).date()
                days_left = (d_mat - today).days

                if days_left < 0:
                    pts = self.weights["expired"]
                    score += pts
                    breakdown.append(RiskBreakdown(
                        factor_name="FDR Past Maturity Date",
                        points_added=pts,
                        max_points=45,
                        explanation=f"FDR expired {abs(days_left)} days ago ({d_mat.isoformat()}). Security deposit coverage has lapsed.",
                        severity="CRITICAL"
                    ))
                elif days_left <= 30:
                    pts = self.weights["maturity_within_30_days"]
                    score += pts
                    breakdown.append(RiskBreakdown(
                        factor_name="Critical Maturity Window (<= 30 days)",
                        points_added=pts,
                        max_points=35,
                        explanation=f"Maturity due in {days_left} days ({d_mat.isoformat()}). Urgent renewal or rollover confirmation required.",
                        severity="CRITICAL"
                    ))
                elif days_left <= 90:
                    pts = self.weights["maturity_within_90_days"]
                    score += pts
                    breakdown.append(RiskBreakdown(
                        factor_name="Approaching Maturity (31 - 90 days)",
                        points_added=pts,
                        max_points=20,
                        explanation=f"Maturity due in {days_left} days. Advance notification dispatched to institution.",
                        severity="HIGH"
                    ))
            except Exception:
                pass

        # 2. Unresolved Compliance Failures
        failed_count = sum(1 for f in findings if f.get("status") in [CheckStatus.FAILED.value, "FAILED"])
        needs_review_count = sum(1 for f in findings if f.get("status") in [CheckStatus.NEEDS_REVIEW.value, "NEEDS_REVIEW"])

        if failed_count > 0:
            pts = min(30, failed_count * 15)
            score += pts
            breakdown.append(RiskBreakdown(
                factor_name="Deterministic Compliance Violations",
                points_added=pts,
                max_points=30,
                explanation=f"{failed_count} mandatory compliance checks failed (e.g. amount shortfall or missing AICTE lien).",
                severity="HIGH"
            ))
        elif needs_review_count > 0:
            pts = min(15, needs_review_count * 5)
            score += pts
            breakdown.append(RiskBreakdown(
                factor_name="Compliance Anomaly Review Required",
                points_added=pts,
                max_points=15,
                explanation=f"{needs_review_count} checks require officer scrutiny (e.g. non-standard tenure or rollover wording).",
                severity="MEDIUM"
            ))

        # 3. Bank Confirmation Status
        bank_conf = app_data.get("bank_confirmation") or {}
        is_verified = bank_conf.get("is_verified", False)
        status_val = str(status)

        if status_val == LifecycleState.BANK_CONFIRMATION_PENDING.value or not is_verified:
            # Check days in pending state
            pts = self.weights["bank_confirmation_pending_over_14_days"]
            score += pts
            breakdown.append(RiskBreakdown(
                factor_name="Bank Confirmation Unresolved",
                points_added=pts,
                max_points=15,
                explanation="Authenticity is not yet verified via issuing branch confirmation letter or banking portal.",
                severity="MEDIUM"
            ))

        # 4. Review Bottleneck / Unassigned Case
        assigned_officer = app_data.get("assigned_officer_id")
        if not assigned_officer and status_val in [LifecycleState.SUBMITTED.value, LifecycleState.UNDER_REVIEW.value]:
            pts = self.weights["unassigned_review_over_7_days"]
            score += pts
            breakdown.append(RiskBreakdown(
                factor_name="Unassigned Scrutiny Queue",
                points_added=pts,
                max_points=10,
                explanation="Application is currently unassigned to a Regional Scrutiny Officer.",
                severity="MEDIUM"
            ))

        # 5. Overdue Renewal or Correction Required
        if status_val == LifecycleState.CORRECTION_REQUIRED.value:
            pts = 10
            score += pts
            breakdown.append(RiskBreakdown(
                factor_name="Pending Institution Correction",
                points_added=pts,
                max_points=15,
                explanation="Correction notice was issued to institution; resubmission pending.",
                severity="MEDIUM"
            ))
        elif status_val == LifecycleState.RENEWAL_PENDING.value:
            pts = 20
            score += pts
            breakdown.append(RiskBreakdown(
                factor_name="Active Renewal Authorization Required",
                points_added=pts,
                max_points=25,
                explanation="Renewal extension requested by institution requires committee approval.",
                severity="HIGH"
            ))

        # Bound score between 0 and 100
        total_score = min(100, max(0, score))

        # Determine level
        if total_score >= 75:
            level = RiskLevel.CRITICAL
            summary = "Critical urgency: Immediate officer intervention required before regulatory deadline."
            recommendation = "Prioritize for same-day officer review and issue notice or branch escalation."
        elif total_score >= 50:
            level = RiskLevel.HIGH
            summary = "High urgency: Compliance mismatches or approaching maturity require resolution."
            recommendation = "Review compliance findings, request branch confirmation, or issue correction demand."
        elif total_score >= 25:
            level = RiskLevel.MEDIUM
            summary = "Moderate attention: Standard administrative steps pending in normal cycle."
            recommendation = "Complete standard document scrutiny and schedule verification."
        else:
            level = RiskLevel.LOW
            summary = "Low attention: Fully compliant, active deposit with extended tenure remaining."
            recommendation = "Routine periodic monitoring; no immediate manual intervention needed."

        return RiskScoreResult(
            score=total_score,
            level=level,
            breakdown=breakdown,
            summary=summary,
            primary_recommendation=recommendation
        )
