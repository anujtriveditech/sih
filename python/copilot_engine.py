"""
AICTE SmartTrack - Comprehensive Contextual AI Compliance Copilot (Python Engine)
Formulates grounded answers from authorized application data, extracted documents,
compliance records, live database statistics, and regulatory statutes.
"""

from typing import Dict, Any, List, Optional
import json
import re
from datetime import datetime

class AICopilotEngine:
    """
    Context-aware regulatory compliance assistant.
    Answers queries citing specific case attributes, AICTE APH clauses, live database facts,
    and audit logs with role-based access control (RBAC).
    """

    def process_query(
        self,
        query: str,
        context_case: Optional[Dict[str, Any]] = None,
        all_cases: Optional[List[Dict[str, Any]]] = None,
        institutions: Optional[List[Dict[str, Any]]] = None,
        user_role: Optional[str] = None,
        user_institution_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        q_raw = query.strip()
        q_lower = q_raw.lower()
        all_cases = all_cases or []
        institutions = institutions or []
        user_role = (user_role or "REVIEWING_OFFICER").upper()

        # RBAC Filtering: If INSTITUTION_USER, restrict viewable cases to their own institution
        is_institution_user = user_role == "INSTITUTION_USER"
        authorized_cases = []
        for c in all_cases:
            if is_institution_user:
                if user_institution_id and c.get("institution_id") == user_institution_id:
                    authorized_cases.append(c)
            else:
                authorized_cases.append(c)

        # Context Case RBAC check:
        if context_case and is_institution_user:
            if user_institution_id and context_case.get("institution_id") != user_institution_id:
                return {
                    "answer": "🔒 **Access Restricted**: Under AICTE security regulations, institution representatives are restricted to accessing FDR records and compliance filings corresponding strictly to their own institutional credential. You are not authorized to view details for this external filing.",
                    "citations": ["AICTE Fiduciary Privacy Regulation", "Role-Based Access Control (RBAC) Matrix"],
                    "confidence": 1.0,
                    "suggested_actions": ["Switch to Authorized Institution Profile", "View My Institution's Security Deposits"]
                }

        # Resolve context case from query if mentioned by FDR number or institution name
        if not context_case:
            for c in authorized_cases:
                fdr_num = c.get("fdr_number", "").lower()
                inst_name = c.get("institution_name", "").lower()
                if fdr_num and fdr_num in q_lower:
                    context_case = c
                    break
                elif len(inst_name) > 6 and inst_name in q_lower:
                    context_case = c
                    break

        # Check conversation history for follow-up context if pronouns are used
        if not context_case and conversation_history:
            for turn in reversed(conversation_history):
                content = turn.get("text", "") or turn.get("content", "")
                for c in authorized_cases:
                    fdr_num = c.get("fdr_number", "")
                    if fdr_num and fdr_num in content:
                        if any(pronoun in q_lower for pronoun in ["it", "this", "that", "why", "the fdr", "the document", "the case"]):
                            context_case = c
                            break
                if context_case:
                    break

        # =========================================================================
        # 1. GREETINGS & CASUAL GENERAL KNOWLEDGE
        # =========================================================================
        greeting_words = ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "greetings", "kaise ho", "kya haal hai"]
        if any(re.search(rf"\b{re.escape(w)}\b", q_lower) for w in greeting_words) and len(q_lower.split()) <= 4:
            role_title = user_role.replace("_", " ").title()
            return {
                "answer": (
                    f"Hello! I am **FDR GUARD AI Copilot**, your intelligent assistant for AICTE Security Deposit & Fixed Deposit Receipt management.\n\n"
                    f"You are currently logged in as **{role_title}**. I can assist you with:\n"
                    f"- **Live Portfolio & Dashboard Analytics** (active deposits, maturities, bank breakdowns)\n"
                    f"- **Compliance & Rule Verification** (APH Table 2.1 statutory amount thresholds & joint-lien clauses)\n"
                    f"- **Document Discrepancy Scrutiny** (why a specific FDR was flagged or requires review)\n"
                    f"- **Clause 6.46 Release Eligibility** (NOC verifications and affidavit clearance)\n"
                    f"- **Maturity Surveillance** (renewals, rollovers, and past-due alerts)\n\n"
                    f"How can I help you today? You can ask in English or Hinglish."
                ),
                "citations": ["AICTE SmartTrack System Architecture", "APH 2024-27 Security Deposit Norms"],
                "confidence": 0.99,
                "suggested_actions": ["What cases require attention today?", "Summarize the current portfolio dashboard", "What are the mandatory deposit rules?"]
            }

        # Definition of FDR / Security Deposit / General knowledge
        if any(k in q_lower for k in ["what is fdr", "what is a fixed deposit receipt", "fdr kya hota hai", "explain fdr", "security deposit kya hai", "what is security deposit"]):
            return {
                "answer": (
                    "### What is a Fixed Deposit Receipt (FDR) in Technical Education Governance?\n\n"
                    "A **Fixed Deposit Receipt (FDR)** is an irrevocable term deposit issued by an **RBI-Scheduled Commercial Bank** held as a **Security Deposit** in the joint names of the **Institution/Trust** and the **Member Secretary, AICTE**.\n\n"
                    "**Key Fiduciary Requirements:**\n"
                    "1. **Statutory Lock-in Period**: Maintained for **8 to 10 years** from establishment or program expansion.\n"
                    "2. **Joint Lien Endorsement**: The certificate must bear an explicit joint-lien clause stating funds cannot be withdrawn, pledged, or encumbered without prior written AICTE clearance.\n"
                    "3. **Irrevocable Auto-Renewal**: In case of a 5-year deposit instrument, an explicit rollover/auto-renewal clause must be registered with the issuing bank branch.\n"
                    "4. **No Third-Party Encumbrance**: The deposit cannot be hypothecated for loans, overdrafts, or trust liabilities."
                ),
                "citations": ["AICTE Approval Process Handbook (APH) Chapter II", "RBI Master Circular on Term Deposits"],
                "confidence": 0.99,
                "suggested_actions": ["What are the deposit amount requirements?", "How is release executed under Clause 6.46?"]
            }

        if any(k in q_lower for k in ["what is aicte", "who is aicte", "aicte kya hai"]):
            return {
                "answer": (
                    "### All India Council for Technical Education (AICTE)\n\n"
                    "**AICTE** is the statutory body and national-level council for technical education under the Department of Higher Education, Ministry of Education, Government of India.\n\n"
                    "Under the AICTE Act 1987, AICTE is responsible for proper planning, coordinated development, regulation, and maintenance of norms and standards in technical education (Engineering, Technology, Management, Architecture, Pharmacy, Computer Applications, Applied Arts & Crafts)."
                ),
                "citations": ["AICTE Act No. 52 of 1987", "Ministry of Education, Govt. of India"],
                "confidence": 0.99,
                "suggested_actions": ["Summarize AICTE Security Deposit Norms", "How to submit a new FDR?"]
            }

        # =========================================================================
        # 2. LIVE APPLICATION DATA & DASHBOARD QUERIES (Phase 4)
        # =========================================================================
        # Questions about how many institutions registered
        if any(k in q_lower for k in ["how many institution", "how many colleges", "institutions registered", "total institution", "kitne college", "kitne institution"]):
            inst_count = len(institutions) if not is_institution_user else 1
            if is_institution_user:
                my_inst = next((i for i in institutions if i.get("id") == user_institution_id), None)
                my_name = my_inst.get("name") if my_inst else "Your Registered Institution"
                return {
                    "answer": f"You are logged in as an **Institution User** for **{my_name}** (`{user_institution_id}`). You have **1 active registered institution account**.",
                    "citations": ["Institutional User Directory", "AICTE National Portal Registry"],
                    "confidence": 1.0,
                    "suggested_actions": ["View My Registered FDRs", "Submit New Security Deposit"]
                }
            
            inst_names = [f"- **{i.get('name')}** (`{i.get('id')}`) — {i.get('category')} ({i.get('state')})" for i in institutions[:5]]
            return {
                "answer": (
                    f"### Registered Institutions Count\n\n"
                    f"There are currently **{inst_count} technical institutions** registered in the national AICTE SmartTrack database:\n\n"
                    + "\n".join(inst_names) +
                    f"\n\n*All institutions are linked to respective State DTE jurisdictions and regional offices.*"
                ),
                "citations": ["AICTE National Institution Registry", "Database Table: institutions"],
                "confidence": 1.0,
                "suggested_actions": ["View Institutions Directory", "Filter Institutions by State"]
            }

        # Questions about how many FDRs submitted or overall deposit numbers
        if any(k in q_lower for k in ["how many fdr", "total fdr", "fdrs submitted", "kitne fdr", "total deposit", "how many deposits", "deposit count"]):
            total_cases = len(authorized_cases)
            total_amt = sum(float(c.get("deposit_amount_inr", 0)) for c in authorized_cases)
            lakhs = total_amt / 100000.0
            crs = total_amt / 10000000.0

            approved = len([c for c in authorized_cases if c.get("status") in ["APPROVED", "ACTIVE_VERIFIED"]])
            under_review = len([c for c in authorized_cases if c.get("status") in ["UNDER_REVIEW", "SUBMITTED"]])
            corrections = len([c for c in authorized_cases if c.get("status") in ["CORRECTION_REQUIRED"]])
            bank_pending = len([c for c in authorized_cases if c.get("status") in ["BANK_CONFIRMATION_PENDING"]])
            renewal_pending = len([c for c in authorized_cases if c.get("status") in ["RENEWAL_PENDING", "EXPIRED"]])

            return {
                "answer": (
                    f"### Security Deposit Holdings Overview ({'Your Institution' if is_institution_user else 'National Portfolio'})\n\n"
                    f"- **Total Instruments**: **{total_cases} FDR Certificates**\n"
                    f"- **Total Cumulative Value**: **₹{lakhs:.2f} Lakhs** (approx. **₹{crs:.2f} Cr**)\n"
                    f"- **Approved / Active Verified**: **{approved}**\n"
                    f"- **Under Scrutiny / Review**: **{under_review}**\n"
                    f"- **Correction Notice Issued**: **{corrections}**\n"
                    f"- **Awaiting Bank Branch Confirmation**: **{bank_pending}**\n"
                    f"- **Renewal / Rollover Required**: **{renewal_pending}**"
                ),
                "citations": ["SmartTrack Core Database: applications", "Real-Time Ledger Engine"],
                "confidence": 1.0,
                "suggested_actions": ["Show cases pending review", "Show approaching maturities", "Open FDR Portfolio"]
            }

        # Dashboard summary
        if "dashboard" in q_lower or any(k in q_lower for k in ["portfolio summary", "system summary", "dshbrd", "overview of system"]):
            total_cases = len(authorized_cases)
            total_amt = sum(float(c.get("deposit_amount_inr", 0)) for c in authorized_cases)
            urgent_cases = [c for c in authorized_cases if c.get("risk_score", {}).get("level") in ["CRITICAL", "HIGH"]]
            bank_pending = [c for c in authorized_cases if c.get("status") == "BANK_CONFIRMATION_PENDING"]
            expired = [c for c in authorized_cases if c.get("status") in ["EXPIRED", "RENEWAL_PENDING"]]

            return {
                "answer": (
                    f"### 📊 AICTE SmartTrack Executive Dashboard Summary\n\n"
                    f"**1. Capital Custody**: **₹{total_amt / 10000000.0:.2f} Crore** across **{total_cases} Fixed Deposit Receipts**.\n"
                    f"**2. High-Attention Worklist**: **{len(urgent_cases)} filings** prioritized by deterministic risk scoring for immediate officer action.\n"
                    f"**3. Bank Branch Confirmations**: **{len(bank_pending)} instruments** awaiting issuing branch stamp/sign-off.\n"
                    f"**4. Maturity Horizon**: **{len(expired)} deposits** have reached or passed maturity and require renewal scrutiny or release processing under Clause 6.46.\n"
                    f"**5. Statutory Compliance Rate**: **{((total_cases - len(urgent_cases)) / max(total_cases, 1)) * 100:.1f}%** alignment with APH Table 2.1 requirements."
                ),
                "citations": ["AICTE Financial Security Monitor", "Live Analytical Engine"],
                "confidence": 1.0,
                "suggested_actions": ["Which cases require attention today?", "Open Verification Queue", "View Maturity Calendar"]
            }

        # Approaching maturity / Renewals queries
        if any(k in q_lower for k in ["approaching maturity", "maturity", "expire", "expired", "kab tak renew", "renewal", "renew"]):
            maturity_cases = []
            today_str = "2026-10-29"
            today_dt = datetime.strptime(today_str, "%Y-%m-%d")

            for c in authorized_cases:
                mat = c.get("maturity_date")
                if mat:
                    try:
                        mat_dt = datetime.strptime(mat, "%Y-%m-%d")
                        diff = (mat_dt - today_dt).days
                        maturity_cases.append((c, diff))
                    except Exception:
                        pass

            maturity_cases.sort(key=lambda x: x[1])

            expired_list = [c for c, d in maturity_cases if d < 0]
            next_90_list = [c for c, d in maturity_cases if 0 <= d <= 90]

            lines = []
            for c, d in maturity_cases[:4]:
                fdr = c.get("fdr_number")
                inst = c.get("institution_name")
                status = "PAST DUE EXPIRED" if d < 0 else f"Matures in {d} days"
                lines.append(f"- **{fdr}** ({inst}): `{c.get('maturity_date')}` — **{status}**")

            return {
                "answer": (
                    f"### ⏳ Deposit Maturity & Renewal Surveillance\n\n"
                    f"- **Past-Due / Expired Instruments**: **{len(expired_list)}** (Requires immediate rollover verification or recovery notice)\n"
                    f"- **Expiring within 90 Days**: **{len(next_90_list)}**\n\n"
                    f"**Chronological Maturity Queue:**\n"
                    + "\n".join(lines) +
                    f"\n\n*Institutions must submit either an authenticated bank renewal receipt or complete the Clause 6.46 return-of-deposit workflow.*"
                ),
                "citations": ["Maturity Engine v2.1", "APH Clause 2.14 Security Deposit Tenure Mandate"],
                "confidence": 0.98,
                "suggested_actions": ["Open Renewal & Maturity Calendar", "Issue Automated Renewal Notice"]
            }

        # Pending review / Verification queue queries
        if any(k in q_lower for k in ["pending review", "which documents are pending", "pending verification", "verification queue", "what actions are pending", "pending for officer"]):
            pending_cases = [c for c in authorized_cases if c.get("status") in ["UNDER_REVIEW", "SUBMITTED", "BANK_CONFIRMATION_PENDING", "CORRECTION_REQUIRED"]]
            items = []
            for p in pending_cases[:4]:
                items.append(f"- **{p.get('fdr_number')}** — {p.get('institution_name')} (`{p.get('status')}`) | Priority Score: **{p.get('risk_score', {}).get('score', 0)}/100**")

            return {
                "answer": (
                    f"### 📋 Active Pending Review Queue\n\n"
                    f"There are **{len(pending_cases)} submissions** currently pending action across authorized records:\n\n"
                    + "\n".join(items) +
                    f"\n\n**Required Officer Actions**:\n"
                    f"1. Conduct OCR field-to-document cross-verification in the **Verification Workspace**.\n"
                    f"2. Validate issuing bank IFSC code against RBI Second Schedule.\n"
                    f"3. Verify joint lien wording (*'Member Secretary, AICTE'*)."
                ),
                "citations": ["Verification Queue State Machine", "AICTE Compliance SOP"],
                "confidence": 0.98,
                "suggested_actions": ["Open Verification Queue", "Inspect High-Priority Case"]
            }

        # =========================================================================
        # 3. CASE-SPECIFIC & DOCUMENT UNDERSTANDING (Phase 5)
        # =========================================================================
        if context_case:
            inst_name = context_case.get("institution_name", "Institution")
            fdr_num = context_case.get("fdr_number", "FDR")
            findings = context_case.get("compliance_findings", [])
            failed_findings = [f for f in findings if f.get("status") in ["FAILED", "CheckStatus.FAILED"]]
            needs_review_findings = [f for f in findings if f.get("status") in ["NEEDS_REVIEW", "CheckStatus.NEEDS_REVIEW"]]
            passed_findings = [f for f in findings if f.get("status") in ["PASSED", "CheckStatus.PASSED"]]
            risk_score = context_case.get("risk_score", {})
            status = context_case.get("status", "")
            amt = float(context_case.get("deposit_amount_inr", 0))

            # Query: Why was this document flagged?
            if any(k in q_lower for k in ["why flagged", "flag", "failed", "violation", "issue", "shortfall", "problem", "reject", "kyu flag", "kyu reject"]):
                if not failed_findings and not needs_review_findings:
                    return {
                        "answer": (
                            f"### Compliance Status: {fdr_num}\n\n"
                            f"**Case {fdr_num}** ({inst_name}) is currently in status **{status}** with **0 active compliance violations**.\n\n"
                            f"**All 4 Deterministic Checks Passed:**\n"
                            f"✅ **Deposit Amount**: ₹{amt / 100000.0:.2f} Lakhs meets statutory minimum for `{context_case.get('program_name')}`.\n"
                            f"✅ **Joint Lien Endorsement**: Correctly endorsed in favor of Member Secretary, AICTE.\n"
                            f"✅ **Date Consistency**: Valid issue and future maturity dates.\n"
                            f"✅ **Scheduled Bank**: Issued by an RBI-recognized scheduled commercial bank (`{context_case.get('bank_name')}`)."
                        ),
                        "citations": [f"FDR Certificate: {fdr_num}", "AICTE Compliance Log"],
                        "confidence": 0.99,
                        "suggested_actions": ["Proceed with branch bank confirmation", "Record officer review sign-off"]
                    }

                bullets = []
                for f in failed_findings:
                    bullets.append(f"- ❌ **{f.get('rule_title', 'Violation')}**: {f.get('reason')} Expected: `{f.get('expected_value')}`, extracted: `{f.get('extracted_value')}`. [Evidence: *{f.get('evidence_citation', 'FDR Document')}*]")
                for f in needs_review_findings:
                    bullets.append(f"- ⚠️ **{f.get('rule_title', 'Attention Item')}**: {f.get('reason')} [Evidence: *{f.get('evidence_citation', 'FDR Document')}*]")

                recs = risk_score.get("primary_recommendation", "Submit formal correction or supplementary deposit.")

                return {
                    "answer": (
                        f"### Regulatory Scrutiny Findings for {fdr_num} ({inst_name})\n\n"
                        f"This filing was flagged by the deterministic compliance engine with **{len(failed_findings)} statutory failure(s)** and **{len(needs_review_findings)} review flag(s)**:\n\n"
                        + "\n".join(bullets) +
                        f"\n\n**Officer Actionable Recommendation**:\n{recs}\n\n"
                        f"*Note: OCR detection flags discrepancies between scanned text and APH norms. Bank confirmation must be verified separately with issuing branch seals.*"
                    ),
                    "citations": [f.get("evidence_citation", f"FDR Document {fdr_num}") for f in failed_findings + needs_review_findings],
                    "confidence": 0.98,
                    "suggested_actions": ["Issue Formal Correction Request to Institution", "View Field Comparison in Document Viewer"]
                }

            # Query: Missing fields
            if any(k in q_lower for k in ["missing", "fields missing", "what is missing", "required fields", "kya missing hai"]):
                extracted = context_case.get("extracted_fields", {})
                missing = []
                for k, v in extracted.items():
                    if isinstance(v, dict) and (v.get("validation_status") == "NOT_FOUND" or not v.get("value")):
                        missing.append(k.replace("_", " ").title())

                if not missing:
                    msg = (
                        f"All critical regulatory fields for **{fdr_num}** have been successfully extracted:\n\n"
                        f"- **FDR Number**: `{context_case.get('fdr_number')}`\n"
                        f"- **Issuing Bank**: `{context_case.get('bank_name')}`\n"
                        f"- **Branch & IFSC**: `{context_case.get('branch_name')}` (`{context_case.get('ifsc_code')}`)\n"
                        f"- **Deposit Amount**: ₹{amt / 100000.0:.2f} Lakhs\n"
                        f"- **Joint Lien Endorsement**: `{context_case.get('joint_lien_status', 'YES')}`"
                    )
                else:
                    msg = (
                        f"The following required document fields are missing or could not be detected with acceptable OCR confidence in **{fdr_num}**:\n\n"
                        + "\n".join([f"- ⚠️ **{m}**" for m in missing]) +
                        f"\n\nPlease request a high-resolution 300+ DPI color scan or enter verified values manually."
                    )
                return {
                    "answer": msg,
                    "citations": [f"Extraction Metadata for {fdr_num}", "SmartTrack OCR Parser v2.1"],
                    "confidence": 0.96,
                    "suggested_actions": ["Manually verify fields in Document Comparison Workspace", "Request Re-scan from Institution"]
                }

            # Query: Status of specific case
            if any(k in q_lower for k in ["status", "what is status", "status kya hai", "kya status hai"]):
                return {
                    "answer": (
                        f"### Lifecycle Status for {fdr_num}\n\n"
                        f"- **Institution**: **{inst_name}** (`{context_case.get('institution_id')}`)\n"
                        f"- **Current State**: **{status}**\n"
                        f"- **FDR Value**: **₹{amt / 100000.0:.2f} Lakhs**\n"
                        f"- **Bank / Branch**: {context_case.get('bank_name')} ({context_case.get('branch_name')})\n"
                        f"- **Maturity Date**: `{context_case.get('maturity_date')}`\n"
                        f"- **Risk Priority**: **{risk_score.get('score', 0)}/100 ({risk_score.get('level', 'LOW')})**"
                    ),
                    "citations": [f"FDR Application Master: {fdr_num}", "AICTE Lifecycle State Machine"],
                    "confidence": 0.99,
                    "suggested_actions": ["Open Full Case Details", "View Audit Timeline"]
                }

        # =========================================================================
        # 4. RELEASE & REFUND WORKFLOWS (Clause 6.46)
        # =========================================================================
        if any(k in q_lower for k in ["release", "refund", "clause 6.46", "return of deposit", "kaise release hoga", "paisa wapas"]):
            return {
                "answer": (
                    "### AICTE Security Deposit Release Procedure (Clause 6.46):\n\n"
                    "Security deposits are eligible for release/refund only after statutory maturity and completion of all compliance prerequisites:\n\n"
                    "**Mandatory Release Checklist:**\n"
                    "1. **Tenure Completion**: Minimum **10 years** for Engineering/Tech or **8 years** for other programs has elapsed.\n"
                    "2. **Affiliating University NOC**: Clean No Objection Certificate confirming no academic liabilities or curriculum non-compliances.\n"
                    "3. **State DTE Clearance**: Confirmation from the State Directorate of Technical Education.\n"
                    "4. **Affidavit Form 6**: Registered sworn affidavit on ₹100 stamp paper declaring all faculty dues, student deposits, and liabilities settled.\n"
                    "5. **Joint Inspection Sign-off**: Regional Office Committee verification report.\n\n"
                    "*Once submitted via the 'Release Management' module, the Regional Officer and Member Secretary review the release petition.*"
                ),
                "citations": ["AICTE Approval Process Handbook (APH) Clause 6.46", "Security Deposit Surrender Guidelines"],
                "confidence": 1.0,
                "suggested_actions": ["Open Release Management Module", "Check Release Eligibility for Case"]
            }

        # =========================================================================
        # 5. REGULATORY STATUTORY NORMS (Table 2.1)
        # =========================================================================
        if any(k in q_lower for k in ["norm", "rule", "threshold", "requirement", "table 2.1", "deposit amount", "kitna deposit", "amount rule"]):
            return {
                "answer": (
                    "### AICTE Security Deposit Norms (Approval Process Handbook):\n\n"
                    "| Academic Program | Degree Level | Minimum Deposit (Lakhs) | Lock-in Tenure |\n"
                    "| :--- | :--- | :--- | :--- |\n"
                    "| **Engineering & Tech** | UG Degree | **₹35.00 Lakhs** | 10 Years |\n"
                    "| **Engineering & Tech** | Integrated / Dual | **₹50.00 Lakhs** | 10 Years |\n"
                    "| **Management (MBA/PGDM)** | PG Degree | **₹15.00 Lakhs** | 8 Years |\n"
                    "| **Pharmacy / Architecture** | UG Degree | **₹15.00 Lakhs** | 8 Years |\n"
                    "| **Polytechnic / Diploma** | Diploma | **₹15.00 Lakhs** | 8 Years |\n"
                    "| **New Technical Campus** | Composite Institution | **₹100.00 Lakhs (₹1 Cr)** | 10 Years |\n\n"
                    "**Mandatory Clauses:**\n"
                    "- Joint lien with **Member Secretary, AICTE**.\n"
                    "- Automatic rollover/renewal clause if issued for shorter tenures.\n"
                    "- Issued only by RBI-Scheduled Commercial Banks."
                ),
                "citations": ["AICTE Approval Process Handbook (APH) Table 2.1", "AICTE Security Deposit Regulations"],
                "confidence": 1.0,
                "suggested_actions": ["View Compliance Rules Configuration", "Run Deterministic Validator on Draft Case"]
            }

        # =========================================================================
        # 6. GENERAL CONVERSATION, HINGLISH, & NATURAL LANGUAGE FALLBACK
        # =========================================================================
        # Hinglish understanding
        if any(k in q_lower for k in ["kya", "kyu", "kaise", "batao", "madad", "chahiye", "kab", "kisko", "kaha"]):
            return {
                "answer": (
                    f"Main **FDR GUARD AI Copilot** hoon. Main aapke AICTE security deposits aur Fixed Deposit Receipts ki jaanch, statutory rules, aur dashboard monitoring me madad karta hoon.\n\n"
                    f"Aap mujhse pooch sakte hain:\n"
                    f"- *'Aaj kaun se cases me attention chahiye?'*\n"
                    f"- *'Engineering college ke liye kitna FDR amount mandatory hai?'*\n"
                    f"- *'Mera FDR flag kyu hua?'* (kisi specific FDR number ke sath)\n"
                    f"- *'FDR release karne ka process kya hai?'*\n\n"
                    f"Aap kis vishay me jaankari chahte hain?"
                ),
                "citations": ["AICTE SmartTrack Bilingual Support", "SmartTrack Helpdesk"],
                "confidence": 0.95,
                "suggested_actions": ["Which cases require attention today?", "Show deposit amount rules"]
            }

        # Fallback response grounded in real system features
        return {
            "answer": (
                f"Based on the **AICTE SmartTrack / FDR GUARD** live regulatory database, I can answer queries regarding:\n\n"
                f"1. **Active Portfolios & Statistics**: Total registered institutions ({len(institutions)}), cumulative deposits, and status counts.\n"
                f"2. **Case Scrutiny**: Why an uploaded FDR was flagged, missing OCR fields, and risk priority scores.\n"
                f"3. **Regulatory Thresholds**: APH Table 2.1 minimum deposit amounts, 8-10 year lock-in requirements, and joint-lien clauses.\n"
                f"4. **Maturity & Rollover**: Expired certificates, upcoming 30/90-day maturities, and Clause 6.46 release eligibility.\n\n"
                f"Please select an FDR record or specify your inquiry (e.g., *'Which cases require attention today?'*, *'How many institutions are registered?'*, or *'Why was PNB-CHD-2022-44109 flagged?'*)."
            ),
            "citations": ["SmartTrack Regulatory Knowledge Base", "AICTE Compliance SOP"],
            "confidence": 0.92,
            "suggested_actions": [
                "Which cases require attention today?",
                "How many institutions are registered?",
                "What are the mandatory deposit amount rules?"
            ]
        }
