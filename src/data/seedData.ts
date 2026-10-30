import { FDRApplication, UserProfile, RuleSetting, Institution } from '../types/aicte';

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst_01',
    name: 'Apex Institute of Technology',
    code: '1-9382019481',
    type: 'Private Self-Financing',
    regionalOffice: 'Western Regional Office (WRO), Mumbai',
    city: 'Pune',
    state: 'Maharashtra',
    accreditedPrograms: ['Computer Engineering (UG)', 'Electronics & Telecommunication', 'Mechanical Engineering'],
    totalFdrCount: 1,
    totalDepositAmountInr: 3500000,
    complianceRating: 'COMPLIANT',
    principalName: 'Dr. Suresh Mehta',
    contactEmail: 'registrar@apextech.edu.in',
    contactPhone: '+91 20 2749 9000',
    registeredTrust: 'Apex Educational and Charitable Trust',
    establishedYear: 2014
  },
  {
    id: 'inst_02',
    name: 'Modern Polytechnic Society',
    code: '1-4401827419',
    type: 'Private Polytechnic',
    regionalOffice: 'North-West Regional Office (NWRO), Chandigarh',
    city: 'Chandigarh',
    state: 'Punjab',
    accreditedPrograms: ['Diploma in Civil Engineering', 'Diploma in Electrical Engineering'],
    totalFdrCount: 1,
    totalDepositAmountInr: 1000000,
    complianceRating: 'NON_COMPLIANT',
    principalName: 'Er. Harpreet Singh',
    contactEmail: 'contact@modernpolytechnic.edu.in',
    contactPhone: '+91 172 2600 112',
    registeredTrust: 'Modern Technical Education Society',
    establishedYear: 2018
  },
  {
    id: 'inst_03',
    name: 'Delhi School of Advanced Management',
    code: '1-1092837482',
    type: 'Autonomous Business School',
    regionalOffice: 'Northern Regional Office (NRO), Kanpur',
    city: 'New Delhi',
    state: 'Delhi NCR',
    accreditedPrograms: ['PGDM (Core)', 'PGDM in Financial Markets'],
    totalFdrCount: 1,
    totalDepositAmountInr: 1500000,
    complianceRating: 'NEEDS_ATTENTION',
    principalName: 'Dr. Meenakshi Sundaram',
    contactEmail: 'director@dsam-delhi.org',
    contactPhone: '+91 11 2341 8900',
    registeredTrust: 'Foundation for Advanced Management Studies',
    establishedYear: 2015
  },
  {
    id: 'inst_04',
    name: 'Bangalore Institute of Technology & Research',
    code: '1-884019201',
    type: 'Private University Constituent College',
    regionalOffice: 'South-Western Regional Office (SWRO), Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    accreditedPrograms: ['Artificial Intelligence & Data Science', 'Information Science & Engineering'],
    totalFdrCount: 1,
    totalDepositAmountInr: 3500000,
    complianceRating: 'NEEDS_ATTENTION',
    principalName: 'Prof. K. Venkatesh',
    contactEmail: 'admissions@bitr-blr.edu.in',
    contactPhone: '+91 80 2841 4000',
    registeredTrust: 'Sri Venkateshwara Vidya Samsthe',
    establishedYear: 2010
  },
  {
    id: 'inst_05',
    name: 'Chennai Institute of Engineering & Research',
    code: '1-729104810',
    type: 'Affiliated Technical Institution',
    regionalOffice: 'Southern Regional Office (SRO), Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    accreditedPrograms: ['M.E. VLSI Design', 'M.E. Structural Engineering', 'B.Tech IT'],
    totalFdrCount: 1,
    totalDepositAmountInr: 5000000,
    complianceRating: 'COMPLIANT',
    principalName: 'Dr. S. Radhakrishnan',
    contactEmail: 'dean@cier-chennai.ac.in',
    contactPhone: '+91 44 2250 8080',
    registeredTrust: 'Tamil Nadu Technical Education Trust',
    establishedYear: 2008
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_inst_1',
    name: 'Dr. Suresh Mehta',
    role: 'INSTITUTION_USER',
    title: 'Registrar & Authorized Signatory',
    institutionId: 'inst_01',
    institutionName: 'Apex Institute of Technology',
    regionalOffice: 'Western Regional Office (WRO), Mumbai',
    email: 'registrar@apextech.edu.in'
  },
  {
    id: 'user_officer_1',
    name: 'Dr. Rajesh Sharma',
    role: 'REVIEWING_OFFICER',
    title: 'Senior Scrutiny Officer (Finance & Regulatory)',
    regionalOffice: 'Western Regional Office (WRO), Mumbai',
    email: 'r.sharma.officer@aicte-india.org'
  },
  {
    id: 'user_approver_1',
    name: 'Prof. Anil K. Varma',
    role: 'AUTHORIZED_APPROVER',
    title: 'Regional Director / Approval Bureau',
    regionalOffice: 'Western Regional Office (WRO), Mumbai',
    email: 'director.wro@aicte-india.org'
  },
  {
    id: 'user_admin_1',
    name: 'Smt. Priya Nair',
    role: 'ADMINISTRATOR',
    title: 'National System Administrator & Compliance Controller',
    regionalOffice: 'AICTE Headquarters, New Delhi',
    email: 'admin.smarttrack@aicte-india.org'
  },
  {
    id: 'user_auditor_1',
    name: 'Shri K. Ramanathan',
    role: 'READ_ONLY_AUDITOR',
    title: 'Principal Regulatory Compliance Auditor (CAG / Vigilance)',
    regionalOffice: 'AICTE Vigilance & Audit Directorate, New Delhi',
    email: 'auditor.ramanathan@aicte-india.org'
  }
];

export const INITIAL_RULE_SETTINGS: RuleSetting[] = [
  {
    id: 'rule_eng_ug',
    category: 'Engineering & Technology (UG)',
    minimum_amount_inr: 3500000,
    standard_tenure_years: 8,
    mandatory_auto_renewal: true,
    joint_lien_mandatory: true
  },
  {
    id: 'rule_eng_pg',
    category: 'Engineering & Technology (PG/Integrated)',
    minimum_amount_inr: 5000000,
    standard_tenure_years: 8,
    mandatory_auto_renewal: true,
    joint_lien_mandatory: true
  },
  {
    id: 'rule_mgmt',
    category: 'Management (MBA/PGDM)',
    minimum_amount_inr: 1500000,
    standard_tenure_years: 8,
    mandatory_auto_renewal: true,
    joint_lien_mandatory: true
  },
  {
    id: 'rule_pharm',
    category: 'Pharmacy (B.Pharm)',
    minimum_amount_inr: 1500000,
    standard_tenure_years: 8,
    mandatory_auto_renewal: true,
    joint_lien_mandatory: true
  },
  {
    id: 'rule_poly',
    category: 'Polytechnic / Diploma',
    minimum_amount_inr: 1500000,
    standard_tenure_years: 8,
    mandatory_auto_renewal: true,
    joint_lien_mandatory: true
  },
  {
    id: 'rule_comp',
    category: 'New Technical Institution (Comprehensive)',
    minimum_amount_inr: 10000000,
    standard_tenure_years: 8,
    mandatory_auto_renewal: true,
    joint_lien_mandatory: true
  }
];

export const INITIAL_FDR_APPLICATIONS: FDRApplication[] = [
  {
    id: 'app_001',
    application_number: 'AICTE/FDR/2024/09182',
    institution_id: 'inst_01',
    institution_name: 'Apex Institute of Technology',
    institution_code: '1-9382019481',
    program_category: 'Engineering & Technology (UG)',
    regional_office: 'Western Regional Office (WRO), Mumbai',
    fdr_number: 'HDFC-ND-2024-88491',
    bank_name: 'HDFC Bank',
    branch_name: 'Connaught Place Branch, New Delhi',
    branch_ifsc: 'HDFC0000003',
    deposit_amount_inr: 3500000,
    deposit_amount_words: 'Rupees Thirty Five Lakhs Only',
    issue_date: '2024-03-15',
    maturity_date: '2032-03-15',
    tenure_years: 8,
    joint_holder_name: 'Member Secretary, AICTE and Apex Institute of Technology',
    auto_renewal_clause: true,
    status: 'APPROVED',
    assigned_officer_id: 'user_officer_1',
    assigned_officer_name: 'Dr. Rajesh Sharma',
    extracted_fields: {
      fdr_number: {
        name: 'fdr_number',
        value: 'HDFC-ND-2024-88491',
        confidence: 0.98,
        source_document: 'FDR_Certificate_HDFC.pdf',
        page_number: 1,
        bounding_box: { x: 62.0, y: 14.5, width: 32.0, height: 4.5 },
        validation_status: 'MATCHED'
      },
      deposit_amount_inr: {
        name: 'deposit_amount_inr',
        value: 3500000,
        confidence: 0.99,
        source_document: 'FDR_Certificate_HDFC.pdf',
        page_number: 1,
        bounding_box: { x: 20.0, y: 32.0, width: 30.0, height: 4.5 },
        validation_status: 'MATCHED'
      },
      bank_name: {
        name: 'bank_name',
        value: 'HDFC Bank',
        confidence: 0.99,
        source_document: 'FDR_Certificate_HDFC.pdf',
        page_number: 1,
        validation_status: 'MATCHED'
      },
      joint_holder_name: {
        name: 'joint_holder_name',
        value: 'Member Secretary, AICTE and Apex Institute of Technology',
        confidence: 0.96,
        source_document: 'FDR_Certificate_HDFC.pdf',
        page_number: 1,
        validation_status: 'MATCHED'
      }
    },
    compliance_findings: [
      {
        rule_id: 'RULE-AMT-002',
        rule_title: 'AICTE Mandatory Deposit Sufficiency',
        check_item: 'Prescribed Threshold for Engineering & Technology (UG)',
        extracted_value: '₹35,00,000.00',
        expected_value: '>= ₹35,00,000.00',
        status: 'PASSED',
        reason: 'FDR principal satisfies and exceeds the prescribed requirement of ₹35,00,000.00.',
        evidence_citation: 'AICTE Approval Process Handbook & FDR Certificate Amount Box',
        recommended_action: 'No action needed. Amount is compliant.',
        severity: 'LOW'
      },
      {
        rule_id: 'RULE-LIEN-001',
        rule_title: 'Joint Name / AICTE Lien Endorsement',
        check_item: 'AICTE Lien Representation',
        extracted_value: 'Member Secretary, AICTE and Apex Institute of Technology',
        expected_value: 'Lien marked to AICTE',
        status: 'PASSED',
        reason: 'FDR has verified joint lien endorsement in favor of AICTE.',
        evidence_citation: 'FDR Certificate - Account Holder designation',
        recommended_action: 'Verify physical signature and branch seal during bank confirmation.',
        severity: 'LOW'
      },
      {
        rule_id: 'RULE-BANK-001',
        rule_title: 'Issuing Bank Eligibility',
        check_item: 'Scheduled Commercial Bank Status',
        extracted_value: 'HDFC Bank',
        expected_value: 'RBI Approved Scheduled Commercial Bank',
        status: 'PASSED',
        reason: 'HDFC Bank is a recognized Scheduled Commercial Bank under RBI regulations.',
        evidence_citation: 'RBI Master Circular on Banking Institutions',
        recommended_action: 'Proceed to branch verification.',
        severity: 'LOW'
      }
    ],
    risk_score: {
      score: 12,
      level: 'LOW',
      breakdown: [
        {
          factor_name: 'Extended Remaining Tenure',
          points_added: 0,
          max_points: 35,
          explanation: 'Maturity is in 2032 (more than 5 years remaining). No expiry risk.',
          severity: 'LOW'
        }
      ],
      summary: 'Low attention: Fully compliant, active deposit with extended tenure remaining.',
      primary_recommendation: 'Routine periodic monitoring; no immediate manual intervention needed.'
    },
    bank_confirmation: {
      status: 'VERIFIED',
      reference_number: 'HDFC/CP/CONF/2024-1182',
      branch_officer_name: 'S. K. Kulkarni, Chief Manager',
      branch_contact: '+91 11 2334 9901',
      verification_date: '2024-03-20',
      confirmation_letter_url: '/docs/hdfc_conf_letter.pdf',
      notes: 'Branch confirmed joint lien marking and irrevocable auto-renewal mandate on CBS.',
      is_verified: true
    },
    audit_trail: [
      {
        id: 'aud_01',
        timestamp: '2024-03-16T10:15:00Z',
        actor_name: 'Dr. Suresh Mehta',
        actor_role: 'INSTITUTION_USER',
        action_type: 'APPLICATION_SUBMITTED',
        details: 'Submitted FDR application with ₹35 Lakh deposit certificate.',
        previous_state: 'DRAFT',
        new_state: 'SUBMITTED'
      },
      {
        id: 'aud_02',
        timestamp: '2024-03-18T14:30:00Z',
        actor_name: 'Dr. Rajesh Sharma',
        actor_role: 'REVIEWING_OFFICER',
        action_type: 'SCRUTINY_COMPLETED',
        details: 'All compliance checks passed. Dispatched bank confirmation request.',
        previous_state: 'SUBMITTED',
        new_state: 'BANK_CONFIRMATION_PENDING'
      },
      {
        id: 'aud_03',
        timestamp: '2024-03-21T11:00:00Z',
        actor_name: 'Prof. Anil K. Varma',
        actor_role: 'AUTHORIZED_APPROVER',
        action_type: 'FINAL_APPROVAL',
        details: 'Approved security deposit based on CBS bank confirmation letter.',
        previous_state: 'BANK_CONFIRMATION_PENDING',
        new_state: 'APPROVED'
      }
    ],
    documents: [
      {
        id: 'doc_01',
        type: 'FDR_CERTIFICATE',
        name: 'HDFC_Term_Deposit_Receipt_35L.pdf',
        size: '1.4 MB',
        upload_date: '2024-03-16',
        status: 'VERIFIED'
      },
      {
        id: 'doc_02',
        type: 'BANK_CONFIRMATION_LETTER',
        name: 'HDFC_Branch_Lien_Confirmation.pdf',
        size: '890 KB',
        upload_date: '2024-03-20',
        status: 'VERIFIED'
      }
    ],
    created_at: '2024-03-16T10:00:00Z',
    updated_at: '2024-03-21T11:00:00Z'
  },
  {
    id: 'app_002',
    application_number: 'AICTE/FDR/2026/01149',
    institution_id: 'inst_02',
    institution_name: 'Modern Polytechnic Society',
    institution_code: '1-4401827419',
    program_category: 'Polytechnic / Diploma',
    regional_office: 'North-West Regional Office (NWRO), Chandigarh',
    fdr_number: 'PNB-CHD-2022-44109',
    bank_name: 'Punjab National Bank',
    branch_name: 'Sector 17 Main Branch, Chandigarh',
    branch_ifsc: 'PUNB0012300',
    deposit_amount_inr: 1000000,
    deposit_amount_words: 'Rupees Ten Lakhs Only',
    issue_date: '2022-06-01',
    maturity_date: '2025-06-01',
    tenure_years: 3,
    joint_holder_name: 'Modern Polytechnic Society Only',
    auto_renewal_clause: false,
    status: 'CORRECTION_REQUIRED',
    assigned_officer_id: 'user_officer_1',
    assigned_officer_name: 'Dr. Rajesh Sharma',
    extracted_fields: {
      deposit_amount_inr: {
        name: 'deposit_amount_inr',
        value: 1000000,
        confidence: 0.94,
        source_document: 'PNB_Receipt.pdf',
        page_number: 1,
        validation_status: 'SHORTFALL'
      },
      joint_holder_name: {
        name: 'joint_holder_name',
        value: 'Modern Polytechnic Society Only',
        confidence: 0.92,
        source_document: 'PNB_Receipt.pdf',
        page_number: 1,
        validation_status: 'MISSING_AICTE'
      }
    },
    compliance_findings: [
      {
        rule_id: 'RULE-AMT-002',
        rule_title: 'AICTE Mandatory Deposit Sufficiency',
        check_item: 'Prescribed Threshold for Polytechnic / Diploma',
        extracted_value: '₹10,00,000.00',
        expected_value: '₹15,00,000.00',
        status: 'FAILED',
        reason: 'FDR principal amount is ₹5,00,000.00 below the AICTE prescribed minimum threshold (₹15 Lakhs).',
        evidence_citation: 'AICTE Approval Process Handbook Table 2.1 & PNB Receipt',
        recommended_action: 'Submit supplementary FDR of ₹5,00,000.00 or re-issue full deposit.',
        severity: 'HIGH'
      },
      {
        rule_id: 'RULE-LIEN-001',
        rule_title: 'Joint Name / AICTE Lien Endorsement',
        check_item: 'AICTE Lien Representation',
        extracted_value: 'Modern Polytechnic Society Only',
        expected_value: 'Must include AICTE or Member Secretary, AICTE',
        status: 'FAILED',
        reason: 'FDR is drawn solely in the name of the society without AICTE joint lien endorsement.',
        evidence_citation: 'PNB Receipt - Account Title',
        recommended_action: 'Obtain Lien Marking Certificate from bank branch honoring AICTE first charge.',
        severity: 'HIGH'
      },
      {
        rule_id: 'RULE-TENURE-001',
        rule_title: 'Minimum Prescribed Tenure',
        check_item: 'Tenure Duration',
        extracted_value: '3.0 years',
        expected_value: '>= 5.0 years (standard 8 years)',
        status: 'NEEDS_REVIEW',
        reason: 'Deposit tenure of 3.0 years is under the recommended standard (8 years). Auto-renewal mandate is mandatory.',
        evidence_citation: 'AICTE APH Guidelines Chapter 2, Clause 2.14',
        recommended_action: 'Ensure irrevocable auto-renewal mandate is on file.',
        severity: 'MEDIUM'
      }
    ],
    risk_score: {
      score: 82,
      level: 'CRITICAL',
      breakdown: [
        {
          factor_name: 'Deterministic Compliance Violations',
          points_added: 30,
          max_points: 30,
          explanation: '2 mandatory compliance checks failed: ₹5L amount shortfall and missing AICTE joint lien.',
          severity: 'HIGH'
        },
        {
          factor_name: 'FDR Past Maturity Date',
          points_added: 45,
          max_points: 45,
          explanation: 'FDR expired in June 2025 without registered rollover. Security deposit coverage lapsed.',
          severity: 'CRITICAL'
        },
        {
          factor_name: 'Pending Institution Correction',
          points_added: 10,
          max_points: 15,
          explanation: 'Notice issued to institution; resubmission pending.',
          severity: 'MEDIUM'
        }
      ],
      summary: 'Critical urgency: Immediate officer intervention required before regulatory deadline.',
      primary_recommendation: 'Issue show-cause or emergency compliance demand to submit supplementary ₹5 Lakhs FDR with AICTE lien.'
    },
    audit_trail: [
      {
        id: 'aud_11',
        timestamp: '2026-09-10T09:00:00Z',
        actor_name: 'Dr. Rajesh Sharma',
        actor_role: 'REVIEWING_OFFICER',
        action_type: 'CORRECTION_DEMANDED',
        details: 'Flagged ₹5 Lakh shortfall and absence of AICTE joint lien endorsement.',
        previous_state: 'UNDER_REVIEW',
        new_state: 'CORRECTION_REQUIRED'
      }
    ],
    documents: [
      {
        id: 'doc_11',
        type: 'FDR_CERTIFICATE',
        name: 'PNB_FDR_Ten_Lakh.pdf',
        size: '1.1 MB',
        upload_date: '2026-09-08',
        status: 'DEFECTIVE'
      }
    ],
    created_at: '2026-09-08T11:00:00Z',
    updated_at: '2026-09-10T09:00:00Z'
  },
  {
    id: 'app_003',
    application_number: 'AICTE/FDR/2026/02901',
    institution_id: 'inst_03',
    institution_name: 'Delhi School of Advanced Management',
    institution_code: '1-1092837482',
    program_category: 'Management (MBA/PGDM)',
    regional_office: 'Northern Regional Office (NRO), Kanpur',
    fdr_number: 'CAN-DEL-2023-99120',
    bank_name: 'Canara Bank',
    branch_name: 'Barakhamba Road Branch, New Delhi',
    branch_ifsc: 'CNRB0001928',
    deposit_amount_inr: 1500000,
    deposit_amount_words: 'Rupees Fifteen Lakhs Only',
    issue_date: '2023-04-10',
    maturity_date: '2031-04-10',
    tenure_years: 8,
    joint_holder_name: 'Member Secretary, AICTE & Delhi School of Advanced Management',
    auto_renewal_clause: true,
    status: 'BANK_CONFIRMATION_PENDING',
    assigned_officer_id: 'user_officer_1',
    assigned_officer_name: 'Dr. Rajesh Sharma',
    extracted_fields: {
      fdr_number: {
        name: 'fdr_number',
        value: 'CAN-DEL-2023-99120',
        confidence: 0.97,
        source_document: 'Canara_FDR_Scan.pdf',
        page_number: 1,
        validation_status: 'EXTRACTED'
      },
      deposit_amount_inr: {
        name: 'deposit_amount_inr',
        value: 1500000,
        confidence: 0.98,
        source_document: 'Canara_FDR_Scan.pdf',
        page_number: 1,
        validation_status: 'MATCHED'
      }
    },
    compliance_findings: [
      {
        rule_id: 'RULE-AMT-002',
        rule_title: 'AICTE Mandatory Deposit Sufficiency',
        check_item: 'Prescribed Threshold for Management (MBA/PGDM)',
        extracted_value: '₹15,00,000.00',
        expected_value: '>= ₹15,00,000.00',
        status: 'PASSED',
        reason: 'Deposit principal satisfies AICTE norm of ₹15 Lakhs for MBA/PGDM.',
        evidence_citation: 'AICTE APH Table 2.1 & Canara Bank FDR Certificate',
        recommended_action: 'Proceed to branch verification.',
        severity: 'LOW'
      },
      {
        rule_id: 'RULE-LIEN-001',
        rule_title: 'Joint Name / AICTE Lien Endorsement',
        check_item: 'AICTE Lien Representation',
        extracted_value: 'Member Secretary, AICTE & Delhi School of Advanced Management',
        expected_value: 'Lien marked to AICTE',
        status: 'PASSED',
        reason: 'Explicit joint account title in favor of Member Secretary AICTE detected.',
        evidence_citation: 'Canara Bank FDR Certificate Title',
        recommended_action: 'Verify with branch manager via official letter.',
        severity: 'LOW'
      }
    ],
    risk_score: {
      score: 35,
      level: 'MEDIUM',
      breakdown: [
        {
          factor_name: 'Bank Confirmation Unresolved',
          points_added: 15,
          max_points: 15,
          explanation: 'Authenticity is not yet verified via issuing branch confirmation letter or banking portal.',
          severity: 'MEDIUM'
        }
      ],
      summary: 'Moderate attention: Standard administrative steps pending in normal cycle.',
      primary_recommendation: 'Complete branch confirmation verification to finalize approval.'
    },
    bank_confirmation: {
      status: 'DISPATCHED_TO_BRANCH',
      reference_number: 'AICTE/WRO/BC/2026/410',
      branch_officer_name: 'Pending Branch Response',
      verification_date: undefined,
      notes: 'Verification dispatch sent to Canara Bank Barakhamba Branch manager via speed post and registered email.',
      is_verified: false
    },
    audit_trail: [
      {
        id: 'aud_21',
        timestamp: '2026-10-15T14:20:00Z',
        actor_name: 'Dr. Rajesh Sharma',
        actor_role: 'REVIEWING_OFFICER',
        action_type: 'DISPATCHED_BANK_VERIFICATION',
        details: 'Dispatched formal verification request to Canara Bank branch.',
        previous_state: 'UNDER_REVIEW',
        new_state: 'BANK_CONFIRMATION_PENDING'
      }
    ],
    documents: [
      {
        id: 'doc_21',
        type: 'FDR_CERTIFICATE',
        name: 'Canara_Bank_FDR_Receipt.pdf',
        size: '1.6 MB',
        upload_date: '2026-10-12',
        status: 'SUBMITTED'
      }
    ],
    created_at: '2026-10-12T09:30:00Z',
    updated_at: '2026-10-15T14:20:00Z'
  },
  {
    id: 'app_004',
    application_number: 'AICTE/FDR/2018/00552',
    institution_id: 'inst_04',
    institution_name: 'Bangalore Institute of Technology & Research',
    institution_code: '1-884019201',
    program_category: 'Engineering & Technology (UG)',
    regional_office: 'South-Western Regional Office (SWRO), Bengaluru',
    fdr_number: 'SBI-BLR-2018-99014',
    bank_name: 'State Bank of India',
    branch_name: 'Whitefield Branch, Bengaluru',
    branch_ifsc: 'SBIN0004134',
    deposit_amount_inr: 3500000,
    deposit_amount_words: 'Rupees Thirty Five Lakhs Only',
    issue_date: '2018-11-20',
    maturity_date: '2026-11-20', // Matures in ~22 days from current local time 2026-10-29!
    tenure_years: 8,
    joint_holder_name: 'Member Secretary, AICTE and Bangalore Institute of Technology',
    auto_renewal_clause: true,
    status: 'RENEWAL_PENDING',
    assigned_officer_id: 'user_officer_1',
    assigned_officer_name: 'Dr. Rajesh Sharma',
    extracted_fields: {
      maturity_date: {
        name: 'maturity_date',
        value: '2026-11-20',
        confidence: 0.98,
        source_document: 'SBI_FDR_Scan.pdf',
        page_number: 1,
        validation_status: 'APPROACHING_MATURITY'
      }
    },
    compliance_findings: [
      {
        rule_id: 'RULE-TENURE-001',
        rule_title: 'Maturity Monitoring Alert',
        check_item: '8-Year Term Expiration Window',
        extracted_value: '2026-11-20 (22 days remaining)',
        expected_value: 'Active Rollover or Renewal Extension',
        status: 'NEEDS_REVIEW',
        reason: 'Original 8-year deposit matures in 22 days. Auto-renewal execution check required.',
        evidence_citation: 'FDR Maturity Date Block & CBS Core Banking Instructions',
        recommended_action: 'Issue renewal reminder and verify bank automatic rollover mandate.',
        severity: 'HIGH'
      }
    ],
    risk_score: {
      score: 72,
      level: 'HIGH',
      breakdown: [
        {
          factor_name: 'Critical Maturity Window (<= 30 days)',
          points_added: 35,
          max_points: 35,
          explanation: 'Maturity due in 22 days (2026-11-20). Urgent renewal or rollover confirmation required.',
          severity: 'CRITICAL'
        },
        {
          factor_name: 'Active Renewal Authorization Required',
          points_added: 20,
          max_points: 25,
          explanation: 'Renewal extension requested by institution requires committee approval.',
          severity: 'HIGH'
        }
      ],
      summary: 'High urgency: Compliance mismatches or approaching maturity require resolution.',
      primary_recommendation: 'Verify SBI rollover execution or authorize 5-year renewal extension.'
    },
    bank_confirmation: {
      status: 'VERIFIED',
      reference_number: 'SBI/WFD/REV/8821',
      branch_officer_name: 'V. S. Rao, AGM',
      verification_date: '2018-12-01',
      is_verified: true
    },
    audit_trail: [
      {
        id: 'aud_31',
        timestamp: '2026-10-20T10:00:00Z',
        actor_name: 'SmartTrack Automated Cron',
        actor_role: 'SYSTEM',
        action_type: 'MATURITY_ALERT_TRIGGERED',
        details: 'Triggered 30-day pre-maturity warning notification to institution registrar and SWRO officer.',
        previous_state: 'APPROVED',
        new_state: 'RENEWAL_PENDING'
      }
    ],
    documents: [
      {
        id: 'doc_31',
        type: 'FDR_CERTIFICATE',
        name: 'SBI_Whitefield_FDR_35L.pdf',
        size: '2.1 MB',
        upload_date: '2018-11-25',
        status: 'VERIFIED'
      }
    ],
    created_at: '2018-11-25T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z'
  },
  {
    id: 'app_005',
    application_number: 'AICTE/FDR/2016/00109',
    institution_id: 'inst_05',
    institution_name: 'Chennai Institute of Engineering & Research',
    institution_code: '1-729104810',
    program_category: 'Engineering & Technology (PG/Integrated)',
    regional_office: 'Southern Regional Office (SRO), Chennai',
    fdr_number: 'CAN-CHE-2016-11940',
    bank_name: 'Canara Bank',
    branch_name: 'Mount Road Branch, Chennai',
    branch_ifsc: 'CNRB0000102',
    deposit_amount_inr: 5000000,
    deposit_amount_words: 'Rupees Fifty Lakhs Only',
    issue_date: '2016-04-10',
    maturity_date: '2026-04-10',
    tenure_years: 10,
    joint_holder_name: 'Member Secretary, AICTE and Chennai Institute of Engg',
    auto_renewal_clause: true,
    status: 'RELEASE_PENDING',
    assigned_officer_id: 'user_officer_1',
    assigned_officer_name: 'Dr. Rajesh Sharma',
    extracted_fields: {
      deposit_amount_inr: {
        name: 'deposit_amount_inr',
        value: 5000000,
        confidence: 0.99,
        source_document: 'Canara_Maturity_Release.pdf',
        page_number: 1,
        validation_status: 'RELEASE_ELIGIBLE'
      }
    },
    compliance_findings: [
      {
        rule_id: 'RULE-RELEASE-001',
        rule_title: '10-Year Regulatory Completion Release',
        check_item: 'Statutory Lock-in Period & Closure Compliance',
        extracted_value: 'Tenure Completed (10 Years)',
        expected_value: 'Eligible for NOC Release on Formal Request',
        status: 'PASSED',
        reason: 'Institution has completed statutory 10-year lock-in without regulatory defaults or pending penalties.',
        evidence_citation: 'AICTE Regulation on Security Deposit Release Clause 4.8',
        recommended_action: 'Regional Director / Authorized Approver to review and sign release order.',
        severity: 'LOW'
      }
    ],
    risk_score: {
      score: 42,
      level: 'MEDIUM',
      breakdown: [
        {
          factor_name: 'Release Authorization Queue',
          points_added: 25,
          max_points: 30,
          explanation: 'Formal security release application submitted; pending final Authorized Approver authorization.',
          severity: 'MEDIUM'
        }
      ],
      summary: 'Moderate attention: Standard administrative steps pending in normal cycle.',
      primary_recommendation: 'Authorize FDR release NOC if no vigilance or accreditation penalties are pending.'
    },
    bank_confirmation: {
      status: 'VERIFIED',
      reference_number: 'CAN/MNT/REL/901',
      branch_officer_name: 'P. Ramanathan, AGM',
      verification_date: '2016-04-15',
      is_verified: true
    },
    audit_trail: [
      {
        id: 'aud_41',
        timestamp: '2026-10-02T11:00:00Z',
        actor_name: 'Registrar, Chennai Institute',
        actor_role: 'INSTITUTION_USER',
        action_type: 'RELEASE_REQUEST_SUBMITTED',
        details: 'Submitted formal application for release of ₹50 Lakh FDR after 10 years of compliant operation.',
        previous_state: 'APPROVED',
        new_state: 'RELEASE_PENDING'
      }
    ],
    documents: [
      {
        id: 'doc_41',
        type: 'RELEASE_APPLICATION',
        name: 'Formal_Release_Petition_10Years.pdf',
        size: '1.2 MB',
        upload_date: '2026-10-02',
        status: 'UNDER_SCRUTINY'
      }
    ],
    created_at: '2016-04-10T10:00:00Z',
    updated_at: '2026-10-02T11:00:00Z'
  }
];
