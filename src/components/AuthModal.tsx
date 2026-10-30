import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/aicte';
import { 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  BarChart3, 
  Lock, 
  Mail, 
  Key, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onLoginSuccess,
  onShowToast
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regRegion, setRegRegion] = useState('Western Regional Office (WRO), Mumbai');
  const [regEmail, setRegEmail] = useState('');
  const [regPrincipal, setRegPrincipal] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Recovery State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        onLoginSuccess(data.data.user);
        onShowToast(`Authenticated as ${data.data.user.name} (${data.data.user.role.replace(/_/g, ' ')})`, 'success');
        onClose();
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error connecting to AICTE Auth Bureau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersonaSelect = (user: UserProfile) => {
    onLoginSuccess(user);
    onShowToast(`Session active: ${user.name} (${user.role.replace(/_/g, ' ')})`, 'success');
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register-institution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          code: regCode,
          regionalOffice: regRegion,
          contactEmail: regEmail,
          principalName: regPrincipal,
          contactPhone: regPhone
        })
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        onLoginSuccess(data.data.user);
        onShowToast(`Institution registered! AICTE ID ${regCode} activated.`, 'success');
        onClose();
      } else {
        setErrorMsg(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await res.json();
      if (data.success) {
        setRecoverySent(true);
        onShowToast(data.message || 'Reset instructions dispatched.', 'info');
      } else {
        setErrorMsg(data.error || 'Failed to request reset');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'INSTITUTION_USER':
        return <Building2 className="w-3.5 h-3.5 text-teal-400" />;
      case 'REVIEWING_OFFICER':
        return <UserCheck className="w-3.5 h-3.5 text-sky-400" />;
      case 'AUTHORIZED_APPROVER':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ADMINISTRATOR':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case 'READ_ONLY_AUDITOR':
        return <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Top Header */}
        <div className="bg-[#0D1828] text-white p-5 border-b border-[#14243A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#087F78]/30 border border-[#087F78] flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">AICTE SmartTrack Security Bureau</div>
              <div className="text-[11px] text-slate-400 font-mono">Official Regulatory Identity & Access Control</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => { setTab('LOGIN'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center font-medium transition-colors cursor-pointer ${
              tab === 'LOGIN' ? 'bg-white text-slate-900 border-b-2 border-teal-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Institutional Sign-In
          </button>
          <button
            onClick={() => { setTab('REGISTER'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center font-medium transition-colors cursor-pointer ${
              tab === 'REGISTER' ? 'bg-white text-slate-900 border-b-2 border-teal-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Onboard Institution
          </button>
          <button
            onClick={() => { setTab('RECOVERY'); setErrorMsg(null); setRecoverySent(false); }}
            className={`flex-1 py-3 text-center font-medium transition-colors cursor-pointer ${
              tab === 'RECOVERY' ? 'bg-white text-slate-900 border-b-2 border-teal-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Security PIN Reset
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'LOGIN' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                    Official Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. registrar@apextech.edu.in or r.sharma.officer@aicte-india.org"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                    Security Passkey / AICTE PIN
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter minimum 4 characters"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#087F78] hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Establish Authenticated Session</span>
                </button>
              </form>

              {/* Quick Persona Switcher for Evaluation */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Quick Persona Selector (Demonstration Clearance)
                  </span>
                  <span className="text-[10px] font-mono text-teal-700">5 Personas Configured</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickPersonaSelect(u)}
                      className={`w-full p-2.5 rounded border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-[#14243A] text-white border-slate-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {getRoleIcon(u.role)}
                        <div className="truncate">
                          <div className="font-semibold truncate">{u.name}</div>
                          <div className={`text-[10px] font-mono ${currentUser.id === u.id ? 'text-teal-300' : 'text-slate-500'}`}>
                            {u.role.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                  Institution Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. National Institute of Technology & Science"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                    AICTE Permanent ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    placeholder="e.g. 1-99482019"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                    Regional Office
                  </label>
                  <select
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none"
                  >
                    <option value="Western Regional Office (WRO), Mumbai">WRO Mumbai</option>
                    <option value="Southern Regional Office (SRO), Chennai">SRO Chennai</option>
                    <option value="Northern Regional Office (NRO), Kanpur">NRO Kanpur</option>
                    <option value="North-West Regional Office (NWRO), Chandigarh">NWRO Chandigarh</option>
                    <option value="South-Western Regional Office (SWRO), Bengaluru">SWRO Bengaluru</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                    Principal / Director *
                  </label>
                  <input
                    type="text"
                    required
                    value={regPrincipal}
                    onChange={(e) => setRegPrincipal(e.target.value)}
                    placeholder="Dr. Full Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                    Official Contact Phone
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 22 2840 0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                  Official Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="registrar@institute.edu.in"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#087F78] hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                <span>Register Institution in National Repository</span>
              </button>
            </form>
          )}

          {/* TAB 3: RECOVERY */}
          {tab === 'RECOVERY' && (
            <div className="space-y-4">
              {recoverySent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-emerald-950">
                    Security Reset PIN Dispatched
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    A 6-digit one-time authorization token has been sent to <strong>{recoveryEmail}</strong>. Follow the instructions to reset your institutional clearance passkey.
                  </p>
                  <button
                    onClick={() => { setRecoverySent(false); setTab('LOGIN'); }}
                    className="px-4 py-1.5 bg-[#14243A] text-white text-xs font-semibold rounded mt-2"
                  >
                    Return to Sign-In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter the registered official email associated with your institution or officer profile. We will verify your AICTE accreditation records and dispatch a security PIN.
                  </p>
                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-slate-600 mb-1">
                      Registered Official Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="registrar@apextech.edu.in"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#087F78] hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    <span>Dispatch Security Reset Token</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
          AICTE National Regulatory Systems · ISO 27001 Certified Security Protocol
        </div>
      </div>
    </div>
  );
};
