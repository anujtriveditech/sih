import React, { useState } from 'react';
import { UserProfile } from '../types/aicte';
import { 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  Unlock, 
  BarChart3, 
  History, 
  Sparkles, 
  X,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface SIHEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSwitchUser: (role: string) => void;
  onResetComplete: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SIHEvaluatorModal: React.FC<SIHEvaluatorModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSwitchUser,
  onResetComplete,
  onShowToast
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  if (!isOpen) return null;

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName: 'SIH Evaluator', actorRole: 'ADMINISTRATOR' })
      });
      const data = await res.json();
      if (data.success) {
        onResetComplete();
        onShowToast('Database successfully restored to SIH26265 benchmark state.', 'success');
      } else {
        onShowToast(data.error || 'Failed to reset database', 'error');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Network error resetting database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleRunLiveTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/system/run-tests', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTestResults(data.data);
        onShowToast(`Test Suite Executed: ${data.data.python.passed + data.data.node.passed} / ${data.data.python.total + data.data.node.total} tests passing!`, 'success');
      } else {
        onShowToast(data.error || 'Failed to execute test suite', 'error');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Network error running tests', 'error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const DEMO_STEPS = [
    {
      step: 1,
      title: 'Set A vs Set B Discrepancy Lab',
      desc: 'Verify deterministic compliance checks against AICTE Approval Process Handbook (SBI ₹35L vs PNB ₹12L).',
      actionLabel: 'Launch Document Intelligence',
      role: 'REVIEWING_OFFICER',
      tab: 'document_intelligence'
    },
    {
      step: 2,
      title: 'Institution FDR Submission Wizard',
      desc: 'Test 4-stage guided submission with Python OCR pre-fill and live rule validation.',
      actionLabel: 'Open Submission Wizard',
      role: 'INSTITUTION_USER',
      tab: 'submission_wizard'
    },
    {
      step: 3,
      title: 'Officer Scrutiny & Discrepancy Review',
      desc: 'Review document side-by-side, demand corrections, or dispatch bank verification letters.',
      actionLabel: 'Open Verification Queue',
      role: 'REVIEWING_OFFICER',
      tab: 'verification_queue'
    },
    {
      step: 4,
      title: 'Bank Confirmation & CBS Recording',
      desc: 'Simulate branch letter dispatch and record core-banking verification reference numbers.',
      actionLabel: 'Open Bank Confirmation',
      role: 'REVIEWING_OFFICER',
      tab: 'bank_confirmation'
    },
    {
      step: 5,
      title: 'Maturity, Renewal & Escalation Engine',
      desc: 'Inspect 30/60/90-day upcoming maturities, overdue deposits, and rollover tracking.',
      actionLabel: 'Open Maturity Calendar',
      role: 'REVIEWING_OFFICER',
      tab: 'maturity_renewals'
    },
    {
      step: 6,
      title: 'Clause 6.46 Release & Eligibility Workflow',
      desc: 'Evidence-based security deposit refund workflow requiring Affidavit 6 and University NOC.',
      actionLabel: 'Open Release Requests',
      role: 'AUTHORIZED_APPROVER',
      tab: 'release_management'
    },
    {
      step: 7,
      title: 'Regulatory Audit Trail & Traceability',
      desc: 'Immutable append-only log recording every submission, scrutiny observation, and approval.',
      actionLabel: 'Open Audit Trail',
      role: 'READ_ONLY_AUDITOR',
      tab: 'audit_trail'
    },
    {
      step: 8,
      title: 'FDR Command Centre & Portfolio Analytics',
      desc: 'Live institutional breakdown, bank distribution, and regulatory risk priority matrix.',
      actionLabel: 'Open Command Centre',
      role: 'ADMINISTRATOR',
      tab: 'command_centre'
    }
  ];

  const handleStepClick = (stepItem: typeof DEMO_STEPS[0]) => {
    onSwitchUser(stepItem.role);
    onSelectTab(stepItem.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0D1828] text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#087F78]/20 border border-[#087F78]/50 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  SIH26265 Evaluation & Demonstration Console
                </h2>
                <span className="font-mono text-[10px] text-teal-400 border border-teal-500/40 px-2 py-0.5 rounded bg-teal-950/50">
                  Problem: SIH26265 (AICTE)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Smart India Hackathon 2026: Streamline of Security Deposit / FDR Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Reset & Live Tests */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-teal-700 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Restoring Benchmark...' : 'Reset Database to Benchmark'}</span>
            </button>

            <button
              onClick={handleRunLiveTests}
              disabled={isRunningTests}
              className="px-3.5 py-1.5 bg-[#087F78] hover:bg-teal-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Cpu className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Executing 20 Unit Tests...' : 'Run Live Automated Test Suite'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Deterministic Engine: Python 3.10 · API: Node.js TS · APH Norms: 2024–27
          </div>
        </div>

        {/* Live Test Results Accordion if run */}
        {testResults && (
          <div className="bg-slate-900 text-slate-200 p-4 border-b border-slate-800 max-h-52 overflow-y-auto font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-teal-400 font-bold border-b border-slate-800 pb-1">
              <span>LIVE TEST EXECUTION RESULTS ({testResults.python.passed + testResults.node.passed} / {testResults.python.total + testResults.node.total} PASSED)</span>
              <span className="text-[10px] text-slate-400">{testResults.timestamp}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="text-[11px] text-teal-300 font-bold mb-1">
                  Python Compliance Engine ({testResults.python.passed}/{testResults.python.total})
                </div>
                <div className="space-y-1">
                  {testResults.python.details.map((t: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 truncate max-w-[280px]">{t.name}</span>
                      <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {t.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-sky-300 font-bold mb-1">
                  TypeScript Security & Rules ({testResults.node.passed}/{testResults.node.total})
                </div>
                <div className="space-y-1">
                  {testResults.node.details.map((t: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 truncate max-w-[280px]">{t.name}</span>
                      <span className={t.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {t.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body: Guided Evaluator Walk-through */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Evaluator Walk-through Sequence
            </h3>
            <p className="text-xs text-slate-500">
              Click any stage below to automatically switch to the designated user role and open the corresponding workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {DEMO_STEPS.map((step) => (
              <div 
                key={step.step}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-teal-500 bg-white hover:bg-slate-50/50 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                      STAGE {step.step}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Role: {step.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleStepClick(step)}
                  className="w-full py-1.5 px-2 bg-slate-900 hover:bg-[#087F78] text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600">
          <span>AICTE SmartTrack · SIH26265 Competition Prototype</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs cursor-pointer transition-colors"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
