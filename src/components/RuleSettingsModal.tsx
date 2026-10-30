import React, { useState } from 'react';
import { RuleSetting, UserProfile } from '../types/aicte';
import { Settings, ShieldCheck, X, Check, Save, Terminal, Play } from 'lucide-react';

interface RuleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  rules: RuleSetting[];
  onSaveRules: (updatedRules: RuleSetting[]) => void;
}

export const RuleSettingsModal: React.FC<RuleSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  rules,
  onSaveRules
}) => {
  const [localRules, setLocalRules] = useState<RuleSetting[]>(rules);
  const [testAmount, setTestAmount] = useState<number>(3500000);
  const [testCategory, setTestCategory] = useState<string>('Engineering & Technology (UG)');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'ADMINISTRATOR';

  const handleAmountChange = (id: string, newAmt: number) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, minimum_amount_inr: newAmt } : r))
    );
  };

  const handleSave = () => {
    onSaveRules(localRules);
    onClose();
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/python/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application: {
            program_category: testCategory,
            deposit_amount_inr: testAmount,
            joint_holder_name: 'Member Secretary AICTE and Test Institution',
            bank_name: 'State Bank of India',
            issue_date: '2024-01-01',
            maturity_date: '2032-01-01',
            tenure_years: 8,
            auto_renewal_clause: true,
            fdr_number: 'TEST-SIM-001'
          }
        })
      });
      const data = await res.json();
      setTestResult(data.data);
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Compliance Rule Settings & Python Engine Inspector
              </h3>
              <p className="text-xs text-slate-500">
                AICTE Approval Process Handbook (APH) Table 2.1 Prescribed Thresholds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rule Editor */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Mandatory Security Deposit Thresholds by Program Category
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {localRules.map((r) => (
              <div key={r.id} className="p-3 flex items-center justify-between gap-4 text-xs bg-white">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900">{r.category}</div>
                  <div className="text-[10px] text-slate-500">
                    Standard Tenure: {r.standard_tenure_years} Years · Auto-Renewal: Mandatory
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={r.minimum_amount_inr}
                    disabled={!isAdmin}
                    onChange={(e) => handleAmountChange(r.id, parseFloat(e.target.value) || 0)}
                    className="w-32 p-1.5 text-xs border border-slate-300 rounded font-mono tabular-nums text-right disabled:bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400 w-16">
                    ({(r.minimum_amount_inr / 100000).toFixed(0)} L)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!isAdmin && (
            <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
              *Read-only mode. Switch active role to <strong>Administrator</strong> to modify compliance thresholds.
            </div>
          )}
        </div>

        {/* Live Python Algorithm Tester */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Terminal className="w-4 h-4 text-teal-600" />
            <span>Interactive Python Rules Engine Simulator</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Category
              </label>
              <select
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              >
                {localRules.map((r) => (
                  <option key={r.id} value={r.category}>{r.category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Test Principal Amount (INR)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
              />
            </div>
          </div>

          <button
            onClick={handleRunTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17263B] text-teal-400 font-medium text-xs rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3" />
            <span>{isTesting ? 'Evaluating...' : 'Execute Test in Python'}</span>
          </button>

          {testResult && (
            <div className="mt-2 p-2.5 bg-white rounded border border-slate-200 text-xs font-mono max-h-40 overflow-y-auto">
              <div className="text-[10px] text-slate-400 mb-1">Python Output:</div>
              {Array.isArray(testResult) ? (
                testResult.map((f: any, i: number) => (
                  <div key={i} className="py-0.5">
                    <span className={f.status === 'PASSED' ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                      [{f.status}]
                    </span>{' '}
                    {f.rule_title}: {f.reason}
                  </div>
                ))
              ) : (
                <div>{JSON.stringify(testResult)}</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          {isAdmin && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-bold text-xs rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
