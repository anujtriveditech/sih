"""
AICTE SmartTrack - Intelligent Document Understanding & Extraction Engine
Extracts structured FDR entities from document scans/text with confidence scoring and quality safeguards.
"""

import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from .models import ExtractedField

class DocumentExtractionEngine:
    """
    Intelligent document processing service.
    Analyzes document raw text or metadata to extract critical banking and AICTE compliance parameters.
    """

    SAMPLE_TEMPLATES = {
        "set_a_sample": {
            "title": "Set A — Compliant AICTE FDR Benchmark (SBI ₹35L)",
            "text": """
                STATE BANK OF INDIA - PARLIAMENT STREET SPECIAL BRANCH, NEW DELHI
                FIXED DEPOSIT RECEIPT / TERM DEPOSIT ADVICE
                Receipt No: SBI-ND-2024-99102
                Branch Code: 00691 | IFSC: SBIN0000691
                Account Name: MEMBER SECRETARY AICTE AND BHARATIYA INSTITUTE OF TECHNOLOGY
                Joint Holder: Member Secretary, AICTE New Delhi
                Deposit Principal: INR 35,00,000.00
                Amount in Words: Thirty Five Lakhs Indian Rupees Only
                Date of Issue: 2024-04-01
                Date of Maturity: 2032-04-01
                Tenure: 96 Months (8.0 Years)
                Interest Rate: 7.10% p.a.
                Lien Clause: IRREVOCABLE JOINT LIEN MARKED IN FAVOR OF AICTE NEW DELHI.
                AUTO-RENEWAL MANDATORY ON MATURITY UNLESS FORMAL NOC ISSUED UNDER CLAUSE 6.46.
            """
        },
        "set_b_sample": {
            "title": "Set B — Defective FDR Discrepancy Benchmark (PNB ₹12L)",
            "text": """
                PUNJAB NATIONAL BANK - DEFENCE COLONY BRANCH, NEW DELHI
                FIXED DEPOSIT RECEIPT
                Receipt No: PNB-DEL-2023-11204
                Branch Code: 02140 | IFSC: PUNB0021400
                Account Name: SARASWATI EDUCATIONAL FOUNDATION
                Joint Holder: None (Single Holder)
                Deposit Principal: INR 12,00,000.00
                Amount in Words: Twelve Lakhs Indian Rupees Only
                Date of Issue: 2023-01-15
                Date of Maturity: 2026-01-15
                Tenure: 36 Months (3.0 Years)
                Lien Clause: No lien marked. Premature withdrawal permitted without notice.
                Auto Rollover: Not Selected.
            """
        },
        "hdfc_sample": {
            "title": "HDFC Bank Term Deposit Certificate",
            "text": """
                HDFC BANK LIMITED - SPECIALIZED BRANCH, CONNAUGHT PLACE, NEW DELHI
                FIXED DEPOSIT RECEIPT / TERM DEPOSIT ADVICE
                Receipt No: HDFC-ND-2024-88491
                Customer ID: 092817441
                Branch IFSC: HDFC0000003
                Account Name: MEMBER SECRETARY AICTE AND APEX INSTITUTE OF TECH
                Joint Holder: Member Secretary, AICTE New Delhi
                Deposit Amount: INR 35,00,000.00
                Amount in words: Thirty Five Lakhs Indian Rupees Only
                Date of Issue: 2024-03-15
                Date of Maturity: 2032-03-15
                Tenure: 96 Months (8.0 Years)
                Interest Rate: 7.25% p.a. Compounded Quarterly
                Special Instruction: LIEN MARKED IN FAVOR OF AICTE NEW DELHI.
                AUTO-RENEWAL ON MATURITY MANDATORY UNLESS FORMAL NOC ISSUED BY AICTE.
            """
        },
        "sbi_sample": {
            "title": "State Bank of India Special Term Deposit Receipt",
            "text": """
                STATE BANK OF INDIA - SME BRANCH, WHITEFIELD, BENGALURU
                SPECIAL TERM DEPOSIT RECEIPT (STDR)
                FDR Reference: SBI-BLR-9018274
                Branch Code: 04134 | IFSC: SBIN0004134
                In Favor Of: AICTE NEW DELHI A/C GLOBAL ACADEMY OF MANAGEMENT
                Deposit Principal: Rs. 15,00,000.00 (Fifteen Lakhs Only)
                Date of Deposit: 2023-08-10
                Date of Maturity: 2031-08-10
                Tenure: 8 Years
                Lien Note: First charge lien marked to Member Secretary AICTE.
                Auto Rollover: Enabled for equal tenure on prevailing card rate.
            """
        },
        "pnb_sample_defective": {
            "title": "Punjab National Bank FDR (Defective Sample with Missing Lien)",
            "text": """
                PUNJAB NATIONAL BANK - CHANDIGARH MAIN BRANCH
                FIXED DEPOSIT RECEIPT
                Receipt No: PNB-CHD-2022-44109
                Branch IFSC: PUNB0012300
                Account Name: MODERN POLYTECHNIC SOCIETY
                Principal Amount: Rs. 10,00,000.00 (Ten Lakhs Only)
                Date of Issue: 2022-06-01
                Date of Maturity: 2025-06-01
                Tenure: 3 Years
                Special Conditions: Premature withdrawal allowed with penalty.
            """
        }
    }

    def extract_from_text(self, text: str, source_doc: str = "Uploaded_FDR.pdf") -> Dict[str, ExtractedField]:
        fields: Dict[str, ExtractedField] = {}
        clean_text = text.replace("\r", " ")

        # 1. FDR Reference Number
        fdr_match = re.search(r'(?:Receipt\s*No|FDR\s*Reference|Receipt\s*Number|FDR\s*No|Deposit\s*No)[:\s]*([A-Z0-9\-_/]+)', clean_text, re.IGNORECASE)
        if fdr_match:
            val = fdr_match.group(1).strip()
            fields["fdr_number"] = ExtractedField(
                name="fdr_number",
                value=val,
                confidence=0.96,
                source_document=source_doc,
                page_number=1,
                bounding_box={"x": 62.0, "y": 14.5, "width": 32.0, "height": 4.5},
                validation_status="EXTRACTED"
            )
        else:
            fields["fdr_number"] = ExtractedField(
                name="fdr_number",
                value="",
                confidence=0.15,
                source_document=source_doc,
                page_number=1,
                validation_status="NOT_FOUND"
            )

        # 2. Bank Name & Branch
        banks = [
            ("State Bank of India", "SBI"),
            ("HDFC Bank", "HDFC"),
            ("Punjab National Bank", "PNB"),
            ("Canara Bank", "CANARA"),
            ("Bank of Baroda", "BOB"),
            ("ICICI Bank", "ICICI"),
            ("Axis Bank", "AXIS"),
            ("Union Bank of India", "UNION")
        ]
        found_bank = None
        for b_full, b_abbr in banks:
            if b_full.lower() in clean_text.lower() or b_abbr.lower() in clean_text.lower():
                found_bank = b_full
                break
        
        fields["bank_name"] = ExtractedField(
            name="bank_name",
            value=found_bank or "Unspecified Bank",
            confidence=0.94 if found_bank else 0.30,
            source_document=source_doc,
            page_number=1,
            bounding_box={"x": 10.0, "y": 8.0, "width": 80.0, "height": 5.0},
            validation_status="EXTRACTED" if found_bank else "NOT_FOUND"
        )

        # 3. IFSC Code
        ifsc_match = re.search(r'IFSC[:\s]*([A-Z]{4}0[A-Z0-9]{6})', clean_text, re.IGNORECASE)
        fields["branch_ifsc"] = ExtractedField(
            name="branch_ifsc",
            value=ifsc_match.group(1).upper() if ifsc_match else "UNKNOWN",
            confidence=0.98 if ifsc_match else 0.20,
            source_document=source_doc,
            page_number=1,
            bounding_box={"x": 55.0, "y": 18.0, "width": 25.0, "height": 3.5},
            validation_status="EXTRACTED" if ifsc_match else "NOT_FOUND"
        )

        # 4. Deposit Amount
        amt_match = re.search(r'(?:Deposit\s*Amount|Principal|Principal\s*Amount|Rs\.?|INR)[:\s]*([0-9,]+(?:\.[0-9]{2})?)', clean_text, re.IGNORECASE)
        if amt_match:
            raw_amt_str = amt_match.group(1).replace(",", "").strip()
            try:
                amt_val = float(raw_amt_str)
            except ValueError:
                amt_val = 0.0
            fields["deposit_amount_inr"] = ExtractedField(
                name="deposit_amount_inr",
                value=amt_val,
                confidence=0.95,
                source_document=source_doc,
                page_number=1,
                bounding_box={"x": 20.0, "y": 32.0, "width": 30.0, "height": 4.5},
                validation_status="EXTRACTED"
            )
        else:
            fields["deposit_amount_inr"] = ExtractedField(
                name="deposit_amount_inr",
                value=0.0,
                confidence=0.10,
                source_document=source_doc,
                page_number=1,
                validation_status="NOT_FOUND"
            )

        # 5. Issue Date
        issue_match = re.search(r'(?:Date\s*of\s*Issue|Date\s*of\s*Deposit|Issue\s*Date)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}/[0-9]{2}/[0-9]{4}|[0-9]{2}-[0-9]{2}-[0-9]{4})', clean_text, re.IGNORECASE)
        if issue_match:
            raw_d = issue_match.group(1)
            parsed_d = self._normalize_date(raw_d)
            fields["issue_date"] = ExtractedField(
                name="issue_date",
                value=parsed_d,
                confidence=0.92,
                source_document=source_doc,
                page_number=1,
                bounding_box={"x": 15.0, "y": 45.0, "width": 25.0, "height": 3.8},
                validation_status="EXTRACTED"
            )
        else:
            fields["issue_date"] = ExtractedField(
                name="issue_date",
                value="",
                confidence=0.10,
                source_document=source_doc,
                page_number=1,
                validation_status="NOT_FOUND"
            )

        # 6. Maturity Date
        mat_match = re.search(r'(?:Date\s*of\s*Maturity|Maturity\s*Date)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}/[0-9]{2}/[0-9]{4}|[0-9]{2}-[0-9]{2}-[0-9]{4})', clean_text, re.IGNORECASE)
        if mat_match:
            raw_m = mat_match.group(1)
            parsed_m = self._normalize_date(raw_m)
            fields["maturity_date"] = ExtractedField(
                name="maturity_date",
                value=parsed_m,
                confidence=0.93,
                source_document=source_doc,
                page_number=1,
                bounding_box={"x": 55.0, "y": 45.0, "width": 25.0, "height": 3.8},
                validation_status="EXTRACTED"
            )
        else:
            fields["maturity_date"] = ExtractedField(
                name="maturity_date",
                value="",
                confidence=0.10,
                source_document=source_doc,
                page_number=1,
                validation_status="NOT_FOUND"
            )

        # 7. Joint Beneficiary / Lien Endorsement
        holder_match = re.search(r'(?:Account\s*Name|Joint\s*Holder|In\s*Favor\s*Of|Beneficiary)[:\s]*([^\n\r]+)', clean_text, re.IGNORECASE)
        if holder_match:
            h_val = holder_match.group(1).strip()
            fields["joint_holder_name"] = ExtractedField(
                name="joint_holder_name",
                value=h_val,
                confidence=0.88,
                source_document=source_doc,
                page_number=1,
                bounding_box={"x": 15.0, "y": 24.0, "width": 70.0, "height": 5.0},
                validation_status="EXTRACTED"
            )
        else:
            fields["joint_holder_name"] = ExtractedField(
                name="joint_holder_name",
                value="",
                confidence=0.10,
                source_document=source_doc,
                page_number=1,
                validation_status="NOT_FOUND"
            )

        # 8. Auto-Renewal Clause
        has_renewal = ("auto-renewal" in clean_text.lower() or 
                       "auto renewal" in clean_text.lower() or 
                       "auto rollover" in clean_text.lower() or
                       "automatic renewal" in clean_text.lower())
        
        fields["auto_renewal_clause"] = ExtractedField(
            name="auto_renewal_clause",
            value=has_renewal,
            confidence=0.90 if has_renewal else 0.75,
            source_document=source_doc,
            page_number=1,
            bounding_box={"x": 10.0, "y": 68.0, "width": 80.0, "height": 6.0},
            validation_status="EXTRACTED"
        )

        return fields

    def check_document_quality(self, doc_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assesses document scan quality, DPI, blurriness, and signature/seal visibility.
        Distinguishes quality checks from authenticity verification.
        """
        dpi = doc_metadata.get("dpi", 300)
        file_size_bytes = doc_metadata.get("size_bytes", 250000)
        blur_score = doc_metadata.get("blur_score", 0.05) # Lower is sharper
        has_seal = doc_metadata.get("has_bank_seal", True)
        has_signature = doc_metadata.get("has_officer_signature", True)

        issues = []
        if dpi < 150:
            issues.append("Low scan resolution (< 150 DPI). OCR text extraction confidence reduced.")
        if file_size_bytes < 30000:
            issues.append("Extremely small file size. Possible cropped or incomplete document.")
        if blur_score > 0.35:
            issues.append("Document image blur detected. Key numbers may be misread.")
        if not has_seal:
            issues.append("Physical or digital bank seal not detected in standard location.")
        if not has_signature:
            issues.append("Branch authorized signatory mark missing.")

        return {
            "quality_grade": "POOR" if len(issues) >= 2 else ("ACCEPTABLE" if len(issues) == 1 else "EXCELLENT"),
            "is_readable": len(issues) < 2,
            "detected_issues": issues,
            "authenticity_note": "Document quality passed does NOT imply bank confirmation. Bank confirmation is still pending verification with issuing branch."
        }

    def _normalize_date(self, d_str: str) -> str:
        d_str = d_str.strip()
        # Handle YYYY-MM-DD
        if re.match(r'^\d{4}-\d{2}-\d{2}$', d_str):
            return d_str
        # Handle DD/MM/YYYY or DD-MM-YYYY
        parts = re.split(r'[-/]', d_str)
        if len(parts) == 3:
            if len(parts[0]) == 4:
                return f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}"
            else:
                return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        return d_str
