import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserRole } from '../types/aicte';
import { FDRGuardIcon } from './FDRGuardLogo';
import { 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Settings, 
  Search, 
  Calendar, 
  Bell, 
  FileText, 
  Clock, 
  Unlock, 
  BarChart3, 
  History, 
  CheckSquare, 
  ScanLine,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCopilot: () => void;
  onOpenSettings: () => void;
  pendingCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuthModal?: () => void;
  onOpenBrandShowcase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onSelectTab,
  onOpenCopilot,
  onOpenSettings,
  pendingCount,
  searchQuery,
  onSearchChange,
  onOpenAuthModal,
  onOpenBrandShowcase
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFY, setSelectedFY] = useState('2026-27');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const navItems = [
    { id: 'command_centre', label: 'Command Centre', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'institutions', label: 'Institutions', icon: <Building2 className="w-4 h-4" /> },
    { id: 'portfolio', label: 'FDR Portfolio', icon: <FileText className="w-4 h-4" /> },
    { id: 'document_intelligence', label: 'Document Intelligence', icon: <ScanLine className="w-4 h-4" /> },
    { id: 'verification_queue', label: 'Verification Queue', icon: <CheckSquare className="w-4 h-4" />, count: pendingCount },
    { id: 'maturity_renewals', label: 'Maturity & Renewals', icon: <Clock className="w-4 h-4" /> },
    { id: 'release_management', label: 'Release Requests', icon: <Unlock className="w-4 h-4" /> },
    { id: 'reports_analytics', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'audit_trail', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

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
    <header className="bg-[#0D1828] text-white border-b border-[#14243A] sticky top-0 z-40 select-none shadow-sm">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => onSelectTab('command_centre')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="p-0.5 rounded-lg bg-[#0A192F] border border-[#C5A059]/40 group-hover:border-[#C5A059] transition-all shadow-xs shrink-0">
                <FDRGuardIcon size={34} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-wide text-white font-sans">
                    FDR <span className="text-[#F59E0B]">GUARD</span>
                  </span>
                  <span className="hidden sm:inline text-slate-600 font-mono text-xs">/</span>
                  <span className="hidden sm:inline text-[11px] text-teal-400/90 font-mono tracking-normal">
                    AICTE Regulatory Assurance
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 tracking-tight">
                  Security Deposit &amp; FDR Lifecycle Platform
                </p>
              </div>
            </div>
          </div>

          {/* Zone 2: Global Search & Reporting Period */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search FDR number, institution code, or bank..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#14243A]/80 text-slate-100 placeholder-slate-400 rounded border border-slate-700/80 focus:outline-none focus:border-teal-400 font-sans transition-colors"
              />
            </div>

            {/* Financial Year Selector */}
            <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 bg-[#14243A]/90 border border-slate-700/80 rounded text-xs text-slate-300">
              <Calendar className="w-3 h-3 text-teal-400 shrink-0" />
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none cursor-pointer pr-1"
              >
                <option value="2026-27" className="bg-[#14243A]">FY 2026–27</option>
                <option value="2025-26" className="bg-[#14243A]">FY 2025–26</option>
                <option value="2024-25" className="bg-[#14243A]">FY 2024–25</option>
              </select>
            </div>
          </div>

          {/* Zone 3: AI Copilot & Role Profile */}
          <div className="flex items-center gap-2.5 shrink-0">

            {/* FDR GUARD Brand Showcase Trigger */}
            {onOpenBrandShowcase && (
              <button
                onClick={onOpenBrandShowcase}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#0A1728] border border-amber-500/40 hover:border-amber-400 text-amber-300/90 hover:text-amber-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="View & download FDR GUARD vector logo specifications"
              >
                <FDRGuardIcon size={15} />
                <span className="hidden sm:inline font-sans text-[11px]">Logo Specs</span>
              </button>
            )}

            {/* AI Copilot Trigger */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-950/70 border border-teal-500/50 text-teal-300 hover:bg-teal-900/80 hover:text-teal-200 text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Role Switcher Menu */}
            <div ref={userMenuRef} className="relative">
              <div
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
                aria-label={`Active Persona: ${currentUser.name}, ${currentUser.role}. Click to switch role.`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  } else if (e.key === 'Escape') {
                    setIsUserMenuOpen(false);
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
                  isUserMenuOpen
                    ? 'bg-[#192E48] border-teal-400 ring-2 ring-teal-500/30 text-white shadow-sm'
                    : 'bg-[#14243A] border-slate-700 hover:border-teal-400/70 hover:bg-[#1A2E47] text-slate-100'
                }`}
              >
                <div className={`p-1 rounded transition-colors ${isUserMenuOpen ? 'bg-teal-950/80 border border-teal-500/40 text-teal-300' : 'bg-slate-800'}`}>
                  {getRoleIcon(currentUser.role)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-none truncate max-w-[140px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-teal-400 font-mono leading-tight truncate max-w-[140px] mt-0.5 font-medium">
                    {currentUser.role.replace(/_/g, ' ')}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-teal-400' : 'text-slate-400'}`} />
              </div>

              {/* Persona Switcher Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-76 bg-[#0D1828] border border-slate-700 rounded-lg shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Switch Active Persona</span>
                    <span className="font-mono text-teal-400 text-[9px] bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/50">
                      RBAC Mode
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {allUsers.map((u) => {
                      const isSelected = currentUser.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-teal-950/60 text-teal-300 border-l-2 border-teal-400'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">{getRoleIcon(u.role)}</div>
                          <div className="truncate flex-1">
                            <div className="text-xs font-semibold text-white truncate flex items-center justify-between">
                              <span>{u.name}</span>
                              {isSelected && <span className="text-[10px] text-teal-400 font-mono">Active</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{u.title}</div>
                            <div className="text-[10px] text-teal-400 font-mono mt-0.5">{u.role}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {onOpenAuthModal && (
                    <div className="pt-2 mt-1 border-t border-slate-800 px-3">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuthModal();
                        }}
                        className="w-full py-1.5 px-2.5 bg-[#087F78] hover:bg-[#066560] text-white rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Institutional Login / Onboarding</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Secondary Desktop Navigation Strip (Institutional Precision) */}
      <div className="hidden lg:block bg-[#14243A] border-t border-[#1C2F48] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-teal-400 text-teal-300 font-semibold bg-white/5'
                    : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                <span className={isActive ? 'text-teal-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-[10px] text-amber-400 font-semibold">
                    ({item.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#14243A] border-t border-slate-700 px-4 py-4 space-y-2 shadow-xl">
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search FDRs, institutions, or banks..."
              className="w-full px-3 py-2 text-xs bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-teal-500 font-sans"
            />
          </div>
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-xs transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#087F78] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    {item.count} pending
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
