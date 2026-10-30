"""
AICTE SmartTrack - Unit Test Suite (Python)
Verifies deterministic compliance checks, risk scoring, and document extraction.
"""

import unittest
from datetime import date
from python.rules_engine import ComplianceEngine, DEFAULT_DEPOSIT_THRESHOLDS
from python.risk_engine import RiskScoreEngine
from python.extractor import DocumentExtractionEngine
from python.models import CheckStatus, RiskLevel

class TestAICTESmartTrack(unittest.TestCase):

    def setUp(self):
        self.engine = ComplianceEngine()
        self.scorer = RiskScoreEngine()
        self.extractor = DocumentExtractionEngine()

    def test_deposit_amount_sufficiency_passes(self):
        app_data = {
            "program_category": "Engineering & Technology (UG)",
            "deposit_amount_inr": 3500000.0,
            "joint_holder_name": "Member Secretary AICTE and Apex Tech",
            "bank_name": "State Bank of India",
            "issue_date": "2024-01-01",
            "maturity_date": "2032-01-01",
            "tenure_years": 8,
            "auto_renewal_clause": True,
            "fdr_number": "SBI-TEST-001"
        }
        findings = self.engine.validate(app_data)
        amt_findings = [f for f in findings if f.rule_id == "RULE-AMT-002"]
        self.assertEqual(len(amt_findings), 1)
        self.assertEqual(amt_findings[0].status, CheckStatus.PASSED)

    def test_deposit_amount_shortfall_fails(self):
        app_data = {
            "program_category": "Engineering & Technology (UG)",
            "deposit_amount_inr": 2500000.0, # ₹10 Lakh shortfall
            "joint_holder_name": "Member Secretary AICTE",
            "bank_name": "HDFC Bank",
            "issue_date": "2024-01-01",
            "maturity_date": "2032-01-01",
            "fdr_number": "HDFC-TEST-002"
        }
        findings = self.engine.validate(app_data)
        amt_findings = [f for f in findings if f.rule_id == "RULE-AMT-002"]
        self.assertEqual(amt_findings[0].status, CheckStatus.FAILED)
        self.assertIn("below the AICTE prescribed minimum threshold", amt_findings[0].reason)

    def test_joint_lien_missing_aicte_fails(self):
        app_data = {
            "program_category": "Management (MBA/PGDM)",
            "deposit_amount_inr": 1500000.0,
            "joint_holder_name": "Principal, Local Educational Trust Only", # Missing AICTE
            "bank_name": "Canara Bank",
            "issue_date": "2024-01-01",
            "maturity_date": "2032-01-01",
            "fdr_number": "CAN-TEST-003"
        }
        findings = self.engine.validate(app_data)
        lien_findings = [f for f in findings if f.rule_id == "RULE-LIEN-001"]
        self.assertEqual(lien_findings[0].status, CheckStatus.FAILED)

    def test_chronological_dates_invalid_order_fails(self):
        app_data = {
            "program_category": "Management (MBA/PGDM)",
            "deposit_amount_inr": 1500000.0,
            "joint_holder_name": "Member Secretary AICTE",
            "bank_name": "Punjab National Bank",
            "issue_date": "2025-01-01",
            "maturity_date": "2023-01-01", # Earlier than issue date
            "fdr_number": "PNB-TEST-004"
        }
        findings = self.engine.validate(app_data)
        date_findings = [f for f in findings if f.rule_id == "RULE-DATE-001"]
        self.assertEqual(date_findings[0].status, CheckStatus.FAILED)

    def test_duplicate_fdr_reference_fails(self):
        app_data = {
            "program_category": "Management (MBA/PGDM)",
            "deposit_amount_inr": 1500000.0,
            "joint_holder_name": "Member Secretary AICTE",
            "bank_name": "Punjab National Bank",
            "issue_date": "2024-01-01",
            "maturity_date": "2032-01-01",
            "fdr_number": "DUPLICATE-FDR-999"
        }
        findings = self.engine.validate(app_data, existing_fdr_numbers=["DUPLICATE-FDR-999", "OTHER-123"])
        dup_findings = [f for f in findings if f.rule_id == "RULE-DUP-001"]
        self.assertEqual(dup_findings[0].status, CheckStatus.FAILED)

    def test_risk_score_calculation_critical_for_expired(self):
        app_data = {
            "maturity_date": "2026-08-01", # Past maturity compared to 2026-10-29
            "status": "EXPIRED",
            "bank_confirmation": {"is_verified": False}
        }
        findings = [{"status": "FAILED"}, {"status": "FAILED"}]
        result = self.scorer.calculate_score(app_data, findings)
        self.assertGreaterEqual(result.score, 75)
        self.assertEqual(result.level, RiskLevel.CRITICAL)

    def test_document_extraction_sample_hdfc(self):
        sample = self.extractor.SAMPLE_TEMPLATES["hdfc_sample"]["text"]
        fields = self.extractor.extract_from_text(sample)
        self.assertEqual(fields["fdr_number"].value, "HDFC-ND-2024-88491")
        self.assertEqual(fields["bank_name"].value, "HDFC Bank")
        self.assertEqual(fields["deposit_amount_inr"].value, 3500000.0)
        self.assertEqual(fields["issue_date"].value, "2024-03-15")
        self.assertEqual(fields["maturity_date"].value, "2032-03-15")
        self.assertTrue(fields["auto_renewal_clause"].value)

    def test_set_a_benchmark_complete_compliance(self):
        """Set A fixture: Compliant FDR passes all configured deterministic rules."""
        raw_text = self.extractor.SAMPLE_TEMPLATES["set_a_sample"]["text"]
        extracted = self.extractor.extract_from_text(raw_text)
        
        app_data = {
            "program_category": "Engineering & Technology (UG)",
            "deposit_amount_inr": extracted["deposit_amount_inr"].value,
            "joint_holder_name": extracted["joint_holder_name"].value,
            "bank_name": extracted["bank_name"].value,
            "issue_date": extracted["issue_date"].value,
            "maturity_date": extracted["maturity_date"].value,
            "tenure_years": 8,
            "auto_renewal_clause": extracted["auto_renewal_clause"].value,
            "fdr_number": extracted["fdr_number"].value
        }
        findings = self.engine.validate(app_data)
        failed_findings = [f for f in findings if f.status == CheckStatus.FAILED]
        self.assertEqual(len(failed_findings), 0, f"Set A should have 0 failures, got: {[f.rule_id for f in failed_findings]}")

    def test_set_b_benchmark_discrepancy_and_shortfall_flags(self):
        """Set B fixture: Defective FDR triggers expected compliance shortfall flags."""
        raw_text = self.extractor.SAMPLE_TEMPLATES["set_b_sample"]["text"]
        extracted = self.extractor.extract_from_text(raw_text)

        app_data = {
            "program_category": "Engineering & Technology (UG)", # Prescribed: ₹35 Lakhs
            "deposit_amount_inr": extracted["deposit_amount_inr"].value, # Only ₹12 Lakhs
            "joint_holder_name": extracted["joint_holder_name"].value, # Missing AICTE
            "bank_name": extracted["bank_name"].value,
            "issue_date": extracted["issue_date"].value,
            "maturity_date": extracted["maturity_date"].value,
            "tenure_years": 3, # Only 3 years vs 8 years
            "auto_renewal_clause": extracted["auto_renewal_clause"].value,
            "fdr_number": extracted["fdr_number"].value
        }
        findings = self.engine.validate(app_data)
        failed_rule_ids = [f.rule_id for f in findings if f.status == CheckStatus.FAILED]
        
        # Verify specific expected discrepancies are identified
        self.assertIn("RULE-AMT-002", failed_rule_ids, "Should flag deposit amount shortfall")
        self.assertIn("RULE-LIEN-001", failed_rule_ids, "Should flag missing AICTE joint lien")
        self.assertIn("RULE-TENURE-001", failed_rule_ids, "Should flag inadequate tenure horizon")

if __name__ == "__main__":
    unittest.main()
