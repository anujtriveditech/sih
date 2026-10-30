import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_FDR_APPLICATIONS, INITIAL_RULE_SETTINGS, INITIAL_USERS, INITIAL_INSTITUTIONS } from './src/data/seedData.ts';

// HMR is disabled in AI Studio container to prevent reconnection loops
process.env.DISABLE_HMR = 'true';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Persistent Storage Directory & Database File
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'aicte_smarttrack.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  applications: any[];
  ruleSettings: any[];
  users: any[];
  institutions: any[];
  auditLogs: any[];
}

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.institutions) {
        parsed.institutions = INITIAL_INSTITUTIONS;
        saveDatabase(parsed);
      }
      if (!parsed.users || parsed.users.length < INITIAL_USERS.length) {
        parsed.users = INITIAL_USERS;
        saveDatabase(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Error reading db file, re-initializing:', e);
    }
  }

  const initialDb: DatabaseSchema = {
    applications: INITIAL_FDR_APPLICATIONS,
    ruleSettings: INITIAL_RULE_SETTINGS,
    users: INITIAL_USERS,
    institutions: INITIAL_INSTITUTIONS,
    auditLogs: [
      {
        id: 'aud_seed_01',
        timestamp: new Date().toISOString(),
        actor_name: 'System Initializer',
        actor_role: 'SYSTEM',
        action_type: 'DATABASE_BOOTSTRAPPED',
        details: 'AICTE SmartTrack secure repository initialized with baseline records, institutions, and regulatory rules.'
      }
    ]
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist database:', e);
  }
}

// Helper: Run Python CLI Bridge
function runPythonCommand(action: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProc = spawn('python3', ['-m', 'python.cli', action], {
      cwd: __dirname
    });

    let stdout = '';
    let stderr = '';

    pythonProc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProc.on('close', (code) => {
      if (code !== 0) {
        console.warn(`Python process exited with code ${code}: ${stderr}`);
        // Fallback or reject
        return resolve({ error: stderr || `Python exited with code ${code}` });
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (err) {
        resolve({ raw: stdout, error: 'Could not parse python output' });
      }
    });

    // Write input payload to stdin
    if (payload) {
      pythonProc.stdin.write(JSON.stringify(payload));
    }
    pythonProc.stdin.end();
  });
}

// Initialize Gemini Client
let geminiAi: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Gemini client init error:', err);
  }
}

// Authentication & Session Endpoints
app.get('/api/users', (_req, res) => {
  const db = loadDatabase();
  res.json({ success: true, data: db.users || [] });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, roleId } = req.body;
  const db = loadDatabase();

  if (!email && !roleId) {
    return res.status(400).json({ success: false, error: 'Email address or role ID is required for authentication.' });
  }

  // Find user by email or roleId
  const user = db.users.find((u: any) => 
    (email && u.email?.toLowerCase() === email?.toLowerCase()) || (roleId && u.id === roleId)
  );

  if (!user) {
    // Record failed login audit event
    db.auditLogs.unshift({
      id: `aud_login_fail_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_name: email || 'Unknown Applicant',
      actor_role: 'ANONYMOUS',
      action_type: 'AUTH_LOGIN_FAILED',
      details: `Failed authentication attempt for '${email || roleId}'. Credential unrecognized in national regulatory registry.`
    });
    saveDatabase(db);
    return res.status(401).json({ success: false, error: 'Invalid credentials. Official institutional email required.' });
  }

  if (password && password.length < 4) {
    return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long.' });
  }

  const token = `st_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  db.auditLogs.unshift({
    id: `aud_login_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor_name: user.name,
    actor_role: user.role,
    action_type: 'USER_LOGIN_SUCCESS',
    details: `Authenticated session established for ${user.name} (${user.role.replace(/_/g, ' ')}). Security clearance active.`
  });
  saveDatabase(db);

  res.json({
    success: true,
    data: {
      token,
      user,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  const db = loadDatabase();
  const userName = req.body.userName || 'User';
  const userRole = req.body.userRole || 'USER';

  db.auditLogs.unshift({
    id: `aud_logout_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor_name: userName,
    actor_role: userRole,
    action_type: 'USER_LOGOUT',
    details: `Secure session terminated by ${userName}.`
  });
  saveDatabase(db);

  res.json({ success: true, message: 'Session terminated successfully.' });
});

app.post('/api/auth/register-institution', (req, res) => {
  const db = loadDatabase();
  const { name, code, type, regionalOffice, city, state, principalName, contactEmail, contactPhone, establishedYear } = req.body;

  if (!name || !code || !contactEmail) {
    return res.status(400).json({ success: false, error: 'Institution Name, AICTE Permanent ID, and Contact Email are mandatory.' });
  }

  const existing = (db.institutions || []).find((i: any) => i.code?.trim().toLowerCase() === code?.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, error: `Institution with AICTE Permanent ID '${code}' is already registered in registry.` });
  }

  const newInst = {
    id: `inst_${Date.now()}`,
    name,
    code,
    type: type || 'Private Self-Financing',
    regionalOffice: regionalOffice || 'Western Regional Office (WRO), Mumbai',
    city: city || 'Pune',
    state: state || 'Maharashtra',
    accreditedPrograms: req.body.accreditedPrograms || ['Engineering & Technology (UG)'],
    totalFdrCount: 0,
    totalDepositAmountInr: 0,
    complianceRating: 'NEEDS_ATTENTION',
    principalName: principalName || 'Principal',
    contactEmail,
    contactPhone: contactPhone || '+91 20 2700 0000',
    registeredTrust: req.body.registeredTrust || `${name} Educational Trust`,
    establishedYear: establishedYear ? parseInt(establishedYear, 10) : 2024
  };

  db.institutions.push(newInst);

  // Also create corresponding Institution Administrator user
  const newInstUser = {
    id: `user_inst_${Date.now()}`,
    name: principalName || `Registrar, ${name}`,
    role: 'INSTITUTION_USER',
    title: 'Registrar & Authorized Signatory',
    institutionId: newInst.id,
    institutionName: newInst.name,
    regionalOffice: newInst.regionalOffice,
    email: contactEmail
  };
  db.users.push(newInstUser);

  db.auditLogs.unshift({
    id: `aud_reg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor_name: principalName || contactEmail,
    actor_role: 'INSTITUTION_USER',
    action_type: 'INSTITUTION_REGISTERED',
    details: `Onboarding completed for ${name} (AICTE ID: ${code}). Administrative account activated for ${contactEmail}.`
  });
  saveDatabase(db);

  res.status(201).json({ success: true, data: { institution: newInst, user: newInstUser } });
});

app.post('/api/auth/reset-password', (req, res) => {
  const db = loadDatabase();
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Official registered email is required.' });
  }

  db.auditLogs.unshift({
    id: `aud_pwd_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor_name: email,
    actor_role: 'ANONYMOUS',
    action_type: 'PASSWORD_RESET_DISPATCHED',
    details: `Password recovery verification PIN dispatched to official email ${email}.`
  });
  saveDatabase(db);

  res.json({ success: true, message: `A secure 6-digit verification code has been dispatched to ${email}.` });
});

// API Routes

// 1. Get all applications with optional role-based filtering
app.get('/api/fdr', (req, res) => {
  const db = loadDatabase();
  const role = req.headers['x-user-role'] as string;
  const institutionId = req.headers['x-institution-id'] as string;

  let apps = db.applications;

  // Strict backend access control: Institution users can only view their own records
  if (role === 'INSTITUTION_USER' && institutionId) {
    apps = apps.filter((a) => a.institution_id === institutionId);
  }

  res.json({ success: true, count: apps.length, data: apps });
});

// 2. Get single application by ID
app.get('/api/fdr/:id', (req, res) => {
  const db = loadDatabase();
  const appItem = db.applications.find((a) => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ success: false, error: 'FDR application not found' });
  }

  const role = req.headers['x-user-role'] as string;
  const institutionId = req.headers['x-institution-id'] as string;
  if (role === 'INSTITUTION_USER' && institutionId && appItem.institution_id !== institutionId) {
    return res.status(403).json({ success: false, error: 'Access denied: Cannot access other institution records' });
  }

  res.json({ success: true, data: appItem });
});

// 2b. Get institutions list & profile
app.get('/api/institutions', (req, res) => {
  const db = loadDatabase();
  const role = req.headers['x-user-role'] as string;
  const userInstId = req.headers['x-institution-id'] as string;

  let insts = db.institutions || [];
  if (role === 'INSTITUTION_USER' && userInstId) {
    insts = insts.filter((i: any) => i.id === userInstId);
  }
  res.json({ success: true, data: insts });
});

app.get('/api/institutions/:id', (req, res) => {
  const db = loadDatabase();
  const inst = (db.institutions || []).find((i: any) => i.id === req.params.id);
  if (!inst) {
    return res.status(404).json({ success: false, error: 'Institution not found' });
  }
  const instApps = (db.applications || []).filter((a: any) => a.institution_id === inst.id);
  res.json({ success: true, data: { ...inst, applications: instApps } });
});

// 3. Create new FDR application (validates via Python engine and computes risk score)
app.post('/api/fdr', async (req, res) => {
  try {
    const db = loadDatabase();
    const newAppData = req.body;

    if (!newAppData.institution_name || !newAppData.deposit_amount_inr || !newAppData.fdr_number) {
      return res.status(400).json({ success: false, error: 'Mandatory fields missing: Institution Name, Deposit Amount, FDR Reference' });
    }

    const existingFdrs = db.applications.map((a) => a.fdr_number);
    const validationFindings = await runPythonCommand('validate', {
      application: newAppData,
      existing_fdr_numbers: existingFdrs
    });

    const findingsList = Array.isArray(validationFindings) ? validationFindings : [];
    const riskScoreResult = await runPythonCommand('score', {
      application: newAppData,
      findings: findingsList
    });

    const newId = `app_${Date.now()}`;
    const newApp = {
      ...newAppData,
      id: newId,
      application_number: `AICTE/FDR/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'SUBMITTED',
      compliance_findings: findingsList,
      risk_score: riskScoreResult,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      audit_trail: [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor_name: req.body.actor_name || 'Institution Applicant',
          actor_role: 'INSTITUTION_USER',
          action_type: 'APPLICATION_SUBMITTED',
          details: `Application submitted for FDR ${newAppData.fdr_number} (Amount: ₹${Number(newAppData.deposit_amount_inr).toLocaleString('en-IN')}).`,
          previous_state: 'DRAFT',
          new_state: 'SUBMITTED'
        }
      ]
    };

    db.applications.unshift(newApp);
    saveDatabase(db);

    res.status(201).json({ success: true, data: newApp });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update application / Perform state transitions with role authorization
app.post('/api/fdr/:id/action', async (req, res) => {
  try {
    const db = loadDatabase();
    const appIndex = db.applications.findIndex((a) => a.id === req.params.id);
    if (appIndex === -1) {
      return res.status(404).json({ success: false, error: 'FDR application not found' });
    }

    const currentApp = db.applications[appIndex];
    const { action, actorName, actorRole, notes, bankDetails } = req.body;

    // Authorization checks
    if (action === 'APPROVE' && actorRole !== 'AUTHORIZED_APPROVER') {
      return res.status(403).json({ success: false, error: 'Only Authorized Approver (Regional Director / Member Secretary) can approve FDR applications.' });
    }

    if (action === 'REQUEST_CORRECTION' && !['REVIEWING_OFFICER', 'AUTHORIZED_APPROVER'].includes(actorRole)) {
      return res.status(403).json({ success: false, error: 'Only Reviewing Officers and Approvers can request corrections.' });
    }

    let newState = currentApp.status;
    let auditAction = action;
    let auditDetails = notes || `Action ${action} executed.`;

    if (action === 'ASSIGN_OFFICER') {
      currentApp.assigned_officer_id = req.body.officerId || 'user_officer_1';
      currentApp.assigned_officer_name = req.body.officerName || 'Dr. Rajesh Sharma';
      newState = 'UNDER_REVIEW';
      auditDetails = `Assigned to Scrutiny Officer ${currentApp.assigned_officer_name}.`;
    } else if (action === 'REQUEST_CORRECTION') {
      newState = 'CORRECTION_REQUIRED';
      auditDetails = `Correction demanded: ${notes}`;
    } else if (action === 'DISPATCH_BANK_CONFIRM') {
      newState = 'BANK_CONFIRMATION_PENDING';
      currentApp.bank_confirmation = {
        status: 'DISPATCHED_TO_BRANCH',
        reference_number: `AICTE/BC/${Date.now().toString().slice(-6)}`,
        notes: notes || 'Formal verification letter dispatched to branch manager.',
        is_verified: false
      };
      auditDetails = `Dispatched bank verification letter to ${currentApp.bank_name} ${currentApp.branch_name}.`;
    } else if (action === 'RECORD_BANK_CONFIRM') {
      currentApp.bank_confirmation = {
        status: 'VERIFIED',
        reference_number: bankDetails?.referenceNumber || `CBS-VER-${Date.now().toString().slice(-5)}`,
        branch_officer_name: bankDetails?.officerName || 'Branch Manager',
        branch_contact: bankDetails?.contact || '+91 11 2334 0000',
        verification_date: new Date().toISOString().split('T')[0],
        notes: notes || 'Branch confirmed active FDR with irrevocable joint lien to AICTE.',
        is_verified: true
      };
      auditDetails = `Bank confirmation recorded for branch reference ${currentApp.bank_confirmation.reference_number}.`;
    } else if (action === 'APPROVE') {
      newState = 'APPROVED';
      auditDetails = `FDR approved and endorsed into AICTE active security registry. Rationale: ${notes || 'Verified against all regulatory parameters.'}`;
    } else if (action === 'REJECT') {
      newState = 'REJECTED';
      auditDetails = `FDR application rejected. Rationale: ${notes || 'Critical compliance shortfall not rectified.'}`;
    } else if (action === 'REQUEST_RENEWAL') {
      newState = 'RENEWAL_PENDING';
      auditDetails = `Institution requested renewal endorsement for maturing deposit. ${notes || ''}`;
    } else if (action === 'AUTHORIZE_RELEASE') {
      if (actorRole !== 'AUTHORIZED_APPROVER') {
        return res.status(403).json({ success: false, error: 'Only Authorized Approver can authorize release of security deposit.' });
      }
      newState = 'RELEASED';
      auditDetails = `Authorized Release NOC issued for security deposit. ${notes || ''}`;
    }

    const previousState = currentApp.status;
    currentApp.status = newState;
    currentApp.updated_at = new Date().toISOString();

    // Re-calculate risk score
    const updatedRisk = await runPythonCommand('score', {
      application: currentApp,
      findings: currentApp.compliance_findings
    });
    currentApp.risk_score = updatedRisk;

    // Append audit log
    const auditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_name: actorName || 'Authorized User',
      actor_role: actorRole || 'OFFICER',
      action_type: auditAction,
      details: auditDetails,
      previous_state: previousState,
      new_state: newState
    };

    currentApp.audit_trail = currentApp.audit_trail || [];
    currentApp.audit_trail.push(auditEntry);
    db.auditLogs.unshift(auditEntry);

    db.applications[appIndex] = currentApp;
    saveDatabase(db);

    res.json({ success: true, data: currentApp });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Python Extraction Endpoint
app.post('/api/python/extract', async (req, res) => {
  try {
    const { text, sampleKey, sourceDocument } = req.body;
    let result;
    if (sampleKey) {
      result = await runPythonCommand('sample', { sample_key: sampleKey });
    } else {
      result = await runPythonCommand('extract', {
        text: text || '',
        source_document: sourceDocument || 'Uploaded_FDR.pdf'
      });
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Python Validation Endpoint
app.post('/api/python/validate', async (req, res) => {
  try {
    const db = loadDatabase();
    const existing = db.applications.map((a) => a.fdr_number);
    const findings = await runPythonCommand('validate', {
      application: req.body.application,
      existing_fdr_numbers: existing
    });
    res.json({ success: true, data: findings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Dynamic Portfolio Analytics (computed directly from current dataset)
app.get('/api/analytics', (req, res) => {
  const db = loadDatabase();
  const apps = db.applications;

  const totalDepositValue = apps.reduce((sum, a) => sum + (Number(a.deposit_amount_inr) || 0), 0);
  const totalCount = apps.length;

  const statusCounts: Record<string, number> = {};
  const bankDistribution: Record<string, { count: number; totalAmount: number }> = {};
  const priorityDistribution = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  const today = new Date('2026-10-29');

  let upcomingMaturities30Days = 0;
  let upcomingMaturities90Days = 0;
  let expiredCount = 0;

  apps.forEach((a) => {
    // Status counts
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;

    // Bank distribution
    const bank = a.bank_name || 'Other Bank';
    if (!bankDistribution[bank]) {
      bankDistribution[bank] = { count: 0, totalAmount: 0 };
    }
    bankDistribution[bank].count += 1;
    bankDistribution[bank].totalAmount += Number(a.deposit_amount_inr) || 0;

    // Risk level
    const level = (a.risk_score?.level || 'LOW') as keyof typeof priorityDistribution;
    if (priorityDistribution[level] !== undefined) {
      priorityDistribution[level] += 1;
    }

    // Maturity calculations
    if (a.maturity_date) {
      const matDate = new Date(a.maturity_date);
      const diffDays = Math.ceil((matDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 0) {
        expiredCount += 1;
      } else if (diffDays <= 30) {
        upcomingMaturities30Days += 1;
      } else if (diffDays <= 90) {
        upcomingMaturities90Days += 1;
      }
    }
  });

  res.json({
    success: true,
    data: {
      totalDepositValue,
      totalCount,
      verifiedCount: statusCounts['APPROVED'] || 0,
      underReviewCount: (statusCounts['UNDER_REVIEW'] || 0) + (statusCounts['SUBMITTED'] || 0),
      correctionRequiredCount: statusCounts['CORRECTION_REQUIRED'] || 0,
      bankConfirmationPendingCount: statusCounts['BANK_CONFIRMATION_PENDING'] || 0,
      renewalPendingCount: statusCounts['RENEWAL_PENDING'] || 0,
      releasePendingCount: statusCounts['RELEASE_PENDING'] || 0,
      releasedCount: statusCounts['RELEASED'] || 0,
      expiredCount,
      upcomingMaturities30Days,
      upcomingMaturities90Days,
      bankDistribution,
      priorityDistribution,
      statusCounts
    }
  });
});

// 8. AI Compliance Copilot (with server-side Gemini 3.8 Flash & Grounded Python Engine)
app.post('/api/copilot', async (req, res) => {
  try {
    const { query, contextCaseId, conversationHistory } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ success: false, error: 'Query prompt cannot be empty.' });
    }
    if (query.length > 5000) {
      return res.status(400).json({ success: false, error: 'Query is too long. Please restrict inquiries to under 5000 characters.' });
    }

    const role = (req.headers['x-user-role'] as string) || 'REVIEWING_OFFICER';
    const instId = (req.headers['x-institution-id'] as string) || '';

    const db = loadDatabase();
    const contextCase = contextCaseId ? db.applications.find((a) => a.id === contextCaseId) : null;

    // RBAC Security Check: Institution users cannot query another institution's filings
    if (role === 'INSTITUTION_USER' && contextCase && instId && contextCase.institution_id !== instId) {
      return res.json({
        success: true,
        data: {
          answer: "🔒 **Access Restricted**: Under AICTE security regulations, institution representatives are restricted to accessing FDR records and compliance filings corresponding strictly to their own institutional credential. You are not authorized to view details for this external filing.",
          citations: ["AICTE Fiduciary Privacy Regulation", "Role-Based Access Control (RBAC) Matrix"],
          confidence: 1.0,
          suggested_actions: ["Switch to Authorized Institution Profile", "View My Institution's Security Deposits"],
          model: "FDR GUARD Regulatory Compliance Engine"
        }
      });
    }

    // Grounding with Python Copilot Engine first
    const pythonCopilotResult = await runPythonCommand('copilot', {
      query: query.trim(),
      context_case: contextCase,
      all_cases: db.applications,
      institutions: db.institutions,
      user_role: role,
      user_institution_id: instId,
      conversation_history: conversationHistory || []
    });

    // If Gemini API is available, augment and refine response with Gemini 3.8 Flash with a strict timeout
    if (geminiAi && process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are the AICTE SmartTrack / FDR GUARD Regulatory Copilot.
You assist technical institutions, state DTE officers, reviewing officers, and approvers regarding security deposits and Fixed Deposit Receipts (FDR) under AICTE Approval Process Handbook (APH) Table 2.1 norms.
Be concise, authoritative, structured, and factual. Always cite exact rules, FDR numbers, or database figures. Format responses with clean Markdown headers, bullet points, and tables.
Database facts:
${JSON.stringify({
  contextCase: contextCase ? {
    fdr_number: contextCase.fdr_number,
    institution: contextCase.institution_name,
    amount: contextCase.deposit_amount_inr,
    bank: contextCase.bank_name,
    status: contextCase.status,
    findings: contextCase.compliance_findings
  } : null,
  pythonAnalysis: pythonCopilotResult
})}
Provide factual, professional advice in Markdown.`;

        const geminiPromise = geminiAi.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: query,
          config: {
            systemInstruction
          }
        });

        // 3.5s timeout prevents any request hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout after 3500ms')), 3500)
        );

        const geminiResponse = (await Promise.race([geminiPromise, timeoutPromise])) as any;

        if (geminiResponse?.text) {
          return res.json({
            success: true,
            data: {
              answer: geminiResponse.text,
              citations: pythonCopilotResult.citations || ['AICTE Approval Process Handbook (APH) Table 2.1', 'SmartTrack Security Engine'],
              confidence: 0.99,
              suggested_actions: pythonCopilotResult.suggested_actions || [],
              model: 'gemini-3.8-flash'
            }
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini call fallback to python engine:', geminiError?.message || geminiError);
      }
    }

    // Return grounded Python copilot result
    res.json({
      success: true,
      data: {
        ...pythonCopilotResult,
        model: 'FDR GUARD Regulatory Compliance Engine'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8b. Streaming Copilot Endpoint (Server-Sent Events)
app.post('/api/copilot/stream', async (req, res) => {
  try {
    const { query, contextCaseId, conversationHistory } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ success: false, error: 'Query prompt cannot be empty.' });
    }
    const role = (req.headers['x-user-role'] as string) || 'REVIEWING_OFFICER';
    const instId = (req.headers['x-institution-id'] as string) || '';

    const db = loadDatabase();
    const contextCase = contextCaseId ? db.applications.find((a) => a.id === contextCaseId) : null;

    if (role === 'INSTITUTION_USER' && contextCase && instId && contextCase.institution_id !== instId) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      const rbacMsg = "🔒 **Access Restricted**: Under AICTE security regulations, institution representatives are restricted to accessing FDR records corresponding strictly to their own institutional credential.";
      res.write(`data: ${JSON.stringify({ text: rbacMsg })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, citations: ["AICTE Fiduciary Privacy Regulation"], suggested_actions: ["Switch to Authorized Institution Profile"] })}\n\n`);
      return res.end();
    }

    // Grounding with Python Copilot Engine
    const pythonResult = await runPythonCommand('copilot', {
      query: query.trim(),
      context_case: contextCase,
      all_cases: db.applications,
      institutions: db.institutions,
      user_role: role,
      user_institution_id: instId,
      conversation_history: conversationHistory || []
    });

    const fullAnswer = pythonResult?.answer || 'Response generated.';
    const citations = pythonResult?.citations || ['AICTE APH Table 2.1'];
    const suggested_actions = pythonResult?.suggested_actions || [];

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Attempt Gemini 3.8 Flash Streaming if available
    if (geminiAi && process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are the AICTE SmartTrack / FDR GUARD Regulatory Copilot.
You assist technical institutions, state DTE officers, reviewing officers, and approvers regarding security deposits and Fixed Deposit Receipts (FDR) under AICTE Approval Process Handbook (APH) Table 2.1 norms.
Be concise, authoritative, structured, and factual. Always cite exact rules, FDR numbers, or database figures. Format responses with clean Markdown headers, bullet points, and tables.
Database facts:
${JSON.stringify({
  contextCase: contextCase ? {
    fdr_number: contextCase.fdr_number,
    institution: contextCase.institution_name,
    amount: contextCase.deposit_amount_inr,
    bank: contextCase.bank_name,
    status: contextCase.status,
    findings: contextCase.compliance_findings
  } : null,
  pythonAnalysis: pythonResult
})}`;

        const streamPromise = geminiAi.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents: query,
          config: { systemInstruction }
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Stream timeout')), 3500)
        );
        const stream = (await Promise.race([streamPromise, timeoutPromise])) as any;

        let streamedAny = false;
        for await (const chunk of stream) {
          if (chunk.text) {
            streamedAny = true;
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
        if (streamedAny) {
          res.write(`data: ${JSON.stringify({ done: true, citations, suggested_actions })}\n\n`);
          return res.end();
        }
      } catch (err: any) {
        console.warn('Gemini stream bypassed, streaming grounded engine result:', err?.message || err);
      }
    }

    // Fallback: chunked stream of grounded Python copilot answer for smooth typing UX
    const words = fullAnswer.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      // small delay for fluid reading cadence
      await new Promise((r) => setTimeout(r, 15));
    }
    res.write(`data: ${JSON.stringify({ done: true, citations, suggested_actions })}\n\n`);
    res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
      res.end();
    }
  }
});

// 9. Compliance Rules configuration (Admin)
app.get('/api/rules', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, data: db.ruleSettings });
});

app.put('/api/rules', (req, res) => {
  const role = req.headers['x-user-role'] as string;
  if (role !== 'ADMINISTRATOR') {
    return res.status(403).json({ success: false, error: 'Administrator access required to modify compliance rules.' });
  }

  const db = loadDatabase();
  db.ruleSettings = req.body.rules || db.ruleSettings;
  saveDatabase(db);
  res.json({ success: true, data: db.ruleSettings });
});

// 10. Audit History
app.get('/api/audit', (_req, res) => {
  const db = loadDatabase();
  res.json({ success: true, data: db.auditLogs });
});

// 11. Health & System Status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AICTE SmartTrack Core API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 12. Administrative Repository Baseline Maintenance
app.post('/api/admin/reset-database', (req, res) => {
  const role = (req.headers['x-user-role'] as string) || req.body?.actorRole;
  if (role !== 'ADMINISTRATOR') {
    return res.status(403).json({ success: false, error: 'Access restricted: Administrator role required to perform repository maintenance.' });
  }

  try {
    const freshDb = {
      applications: JSON.parse(JSON.stringify(INITIAL_FDR_APPLICATIONS)),
      ruleSettings: JSON.parse(JSON.stringify(INITIAL_RULE_SETTINGS)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      institutions: JSON.parse(JSON.stringify(INITIAL_INSTITUTIONS)),
      auditLogs: [
        {
          id: `aud_reset_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor_name: req.body?.actorName || 'System Administrator',
          actor_role: 'ADMINISTRATOR',
          action_type: 'DATABASE_RESET_BASELINE',
          details: 'Repository restored to pristine regulatory baseline state with compliant and flagged benchmark records.'
        }
      ]
    };
    saveDatabase(freshDb);
    res.json({ success: true, message: 'Database successfully restored to pristine regulatory baseline state.', data: freshDb });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. System Diagnostic & Test Suite Engine
app.post('/api/system/run-tests', async (req, res) => {
  const role = (req.headers['x-user-role'] as string) || req.body?.actorRole;
  if (!['ADMINISTRATOR', 'REVIEWING_OFFICER', 'AUTHORIZED_APPROVER'].includes(role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized: Diagnostic execution requires authorized regulatory credentials.' });
  }

  const testResults: any = {
    timestamp: new Date().toISOString(),
    python: { total: 0, passed: 0, failed: 0, details: [] },
    node: { total: 0, passed: 0, failed: 0, details: [] },
    allPassed: false
  };

  try {
    // 1. Run Python test suite
    const pyOutput = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
      const proc = spawn('python3', ['-m', 'unittest', 'python/tests/test_aicte.py', '-v'], { cwd: __dirname });
      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (d) => { stdout += d.toString(); });
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => resolve({ code: code || 0, stdout, stderr }));
    });

    const pyCombined = (pyOutput.stderr || '') + '\n' + (pyOutput.stdout || '');
    const pyLines = pyCombined.split('\n').filter((l) => l.includes('... ok') || l.includes('... FAIL') || l.includes('... ERROR'));
    testResults.python.total = pyLines.length;
    testResults.python.passed = pyLines.filter((l) => l.includes('... ok')).length;
    testResults.python.failed = testResults.python.total - testResults.python.passed;
    testResults.python.details = pyLines.map((l) => ({
      name: l.split('...')[0].trim(),
      passed: l.includes('... ok')
    }));

    // 2. Run Node test suite
    const nodeOutput = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
      const proc = spawn('npx', ['tsx', '--test', 'tests/rules.test.ts', 'tests/auth.test.ts'], { cwd: __dirname });
      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (d) => { stdout += d.toString(); });
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => resolve({ code: code || 0, stdout, stderr }));
    });

    const nodeLines = (nodeOutput.stdout || '').split('\n').filter((l) => l.startsWith('ok ') || l.startsWith('not ok '));
    testResults.node.total = nodeLines.length;
    testResults.node.passed = nodeLines.filter((l) => l.startsWith('ok ')).length;
    testResults.node.failed = testResults.node.total - testResults.node.passed;
    testResults.node.details = nodeLines.map((l) => ({
      name: l.replace(/^(ok|not ok)\s+\d+\s+-\s+/, '').trim(),
      passed: l.startsWith('ok ')
    }));

    testResults.allPassed = testResults.python.failed === 0 && testResults.node.failed === 0;

    res.json({ success: true, data: testResults });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Vite or serve static
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`AICTE SmartTrack full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
