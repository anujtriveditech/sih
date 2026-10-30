import React, { useState, useEffect, useCallback } from 'react';
import { FDRApplication, UserProfile, RuleSetting, Institution } from './types/aicte';
import { INITIAL_USERS, INITIAL_RULE_SETTINGS, INITIAL_INSTITUTIONS } from './data/seedData';
import { Header } from './components/Header';
import { FDRCommandCentre } from './components/FDRCommandCentre';
import { InstitutionsDirectory } from './components/InstitutionsDirectory';
import { FDRPortfolio } from './components/FDRPortfolio';
import { DocumentIntelligenceSandbox } from './components/DocumentIntelligenceSandbox';
import { VerificationQueue } from './components/VerificationQueue';
import { RenewalMaturityCalendar } from './components/RenewalMaturityCalendar';
import { ReleaseManagement } from './components/ReleaseManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { AuditTrailView } from './components/AuditTrailView';
import { SubmissionWizard } from './components/SubmissionWizard';
import { CaseReviewWorkspace } from './components/CaseReviewWorkspace';
import { BankConfirmationCentre } from './components/BankConfirmationCentre';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { RuleSettingsModal } from './components/RuleSettingsModal';
import { AuthModal } from './components/AuthModal';
import { LogoBrandShowcase } from './components/LogoBrandShowcase';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[1]); // Default: Reviewing Officer
  const [rules, setRules] = useState<RuleSetting[]>(INITIAL_RULE_SETTINGS);
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  
  const [applications, setApplications] = useState<FDRApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('command_centre');
  const [selectedCase, setSelectedCase] = useState<FDRApplication | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBrandShowcaseOpen, setIsBrandShowcaseOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4500);
  };

  // Fetch applications from server-side persistent database
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/fdr', {
        headers: {
          'x-user-role': currentUser.role,
          'x-institution-id': currentUser.institutionId || ''
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setApplications(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to load FDR records');
      }

      // Also fetch institutions
      const instRes = await fetch('/api/institutions', {
        headers: {
          'x-user-role': currentUser.role,
          'x-institution-id': currentUser.institutionId || ''
        }
      });
      const instData = await instRes.json();
      if (instData.success && Array.isArray(instData.data)) {
        setInstitutions(instData.data);
      }

      // Also fetch users directory
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      if (usersData.success && Array.isArray(usersData.data)) {
        setUsers(usersData.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error fetching data');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // When a user selects a case to inspect
  const handleSelectApplication = (app: FDRApplication) => {
    setSelectedCase(app);
    setActiveTab('case_detail');
  };

  // When new application is submitted
  const handleSubmissionSuccess = (newApp: FDRApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    setSelectedCase(newApp);
    setActiveTab('case_detail');
    showToast(`Application ${newApp.application_number} submitted successfully! Case sent to Scrutiny queue.`, 'success');
  };

  // When an application is updated in CaseReviewWorkspace
  const handleApplicationUpdated = (updatedApp: FDRApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
    setSelectedCase(updatedApp);
    showToast(`Case ${updatedApp.fdr_number} status updated to ${updatedApp.status.replace(/_/g, ' ')}.`, 'success');
  };

  // Claim case in Verification Queue
  const handleClaimCase = async (appId: string) => {
    if (currentUser.role === 'READ_ONLY_AUDITOR') {
      showToast('Access Denied: Read-Only Auditor is restricted from claiming cases.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/fdr/${appId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          action: 'ASSIGN_OFFICER',
          actorName: currentUser.name,
          actorRole: currentUser.role,
          officerId: currentUser.id,
          officerName: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        handleApplicationUpdated(data.data);
        showToast(`Case assigned to ${currentUser.name} for scrutiny.`, 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Error claiming case', 'error');
    }
  };

  // Authorize Release
  const handleAuthorizeRelease = async (appId: string, notes: string) => {
    if (currentUser.role === 'READ_ONLY_AUDITOR') {
      showToast('Access Denied: Read-Only Auditor cannot authorize deposit release.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/fdr/${appId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          action: 'AUTHORIZE_RELEASE',
          actorName: currentUser.name,
          actorRole: currentUser.role,
          notes
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        handleApplicationUpdated(data.data);
        showToast(`Security deposit release NOC authorized.`, 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Error authorizing release', 'error');
    }
  };

  // Request Renewal
  const handleRequestRenewal = async (appId: string) => {
    try {
      const res = await fetch(`/api/fdr/${appId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          action: 'REQUEST_RENEWAL',
          actorName: currentUser.name,
          actorRole: currentUser.role,
          notes: 'Institution requested renewal endorsement for deposit approaching statutory maturity.'
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        handleApplicationUpdated(data.data);
        showToast(`Renewal endorsement petition submitted for scrutiny.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Error requesting renewal', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#14243A] flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[#0D1828] text-white text-xs font-medium rounded-lg shadow-2xl border border-slate-700 animate-slide-in">
          {toastMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
          {toastMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          showToast(`Switched active persona to ${u.name} (${u.role.replace(/_/g, ' ')})`, 'info');
        }}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setSelectedCase(null);
            setActiveTab(tab);
          }
        }}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        pendingCount={applications.filter((a) => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenBrandShowcase={() => setIsBrandShowcaseOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#087F78] animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-800">
              Connecting to AICTE SmartTrack Regulatory Repository...
            </div>
            <div className="text-xs text-slate-500">
              Loading institutions, deposit records, and Python compliance subsystems
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMsg && !isLoading && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center space-y-3 my-8">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <div className="text-sm font-semibold text-red-900">{errorMsg}</div>
            <button
              onClick={fetchApplications}
              className="px-4 py-2 bg-red-700 text-white text-xs font-medium rounded hover:bg-red-800 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Interactive Views */}
        {!isLoading && !errorMsg && (
          <>
            {activeTab === 'command_centre' && (
              <FDRCommandCentre
                applications={applications}
                currentUser={currentUser}
                onSelectApplication={handleSelectApplication}
                onNavigateToTab={(tab) => {
                  setSelectedCase(null);
                  setActiveTab(tab);
                }}
              />
            )}

            {activeTab === 'institutions' && (
              <InstitutionsDirectory
                institutions={institutions}
                applications={applications}
                currentUser={currentUser}
                onSelectApplication={handleSelectApplication}
                onNewSubmission={() => setActiveTab('submission')}
              />
            )}

            {activeTab === 'portfolio' && (
              <FDRPortfolio
                applications={applications}
                currentUser={currentUser}
                onSelectApplication={handleSelectApplication}
                onNewSubmission={() => setActiveTab('submission')}
              />
            )}

            {activeTab === 'document_intelligence' && (
              <DocumentIntelligenceSandbox
                currentUser={currentUser}
                applications={applications}
                onSelectApplication={handleSelectApplication}
              />
            )}

            {activeTab === 'verification_queue' && (
              <VerificationQueue
                applications={applications}
                currentUser={currentUser}
                onSelectApplication={handleSelectApplication}
                onClaimCase={handleClaimCase}
              />
            )}

            {activeTab === 'maturity_renewals' && (
              <RenewalMaturityCalendar
                applications={applications}
                currentUser={currentUser}
                onSelectApplication={handleSelectApplication}
                onRequestRenewal={handleRequestRenewal}
              />
            )}

            {activeTab === 'release_management' && (
              <ReleaseManagement
                applications={applications}
                currentUser={currentUser}
                onSelectApplication={handleSelectApplication}
                onAuthorizeRelease={handleAuthorizeRelease}
              />
            )}

            {activeTab === 'reports_analytics' && (
              <ReportsAnalytics
                applications={applications}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'audit_trail' && (
              <AuditTrailView
                applications={applications}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'submission' && (
              <SubmissionWizard
                currentUser={currentUser}
                onSuccess={handleSubmissionSuccess}
                onCancel={() => setActiveTab('command_centre')}
              />
            )}

            {activeTab === 'case_detail' && selectedCase && (
              <CaseReviewWorkspace
                application={selectedCase}
                currentUser={currentUser}
                onBack={() => setActiveTab('portfolio')}
                onApplicationUpdated={handleApplicationUpdated}
              />
            )}
          </>
        )}
      </main>

      {/* AI Compliance Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentUser={currentUser}
        currentCase={selectedCase || undefined}
      />

      {/* Compliance Rule Settings Modal */}
      <RuleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        rules={rules}
        onSaveRules={(updated) => {
          setRules(updated);
          showToast('Compliance deposit thresholds updated in national registry.', 'success');
        }}
      />

      {/* Institutional Authentication & Security Bureau Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          fetchApplications();
        }}
        onShowToast={showToast}
      />



      {/* FDR GUARD Brand Identity & Vector Showcase Modal */}
      <LogoBrandShowcase
        isOpen={isBrandShowcaseOpen}
        onClose={() => setIsBrandShowcaseOpen(false)}
      />

      {/* Refined Institutional Footer */}
      <footer className="bg-[#0D1828] text-slate-400 border-t border-[#14243A] py-5 text-xs select-none mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-100 font-sans tracking-wide">
              FDR <span className="text-[#C5A059]">GUARD</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Institutional Security Deposit &amp; Fixed Deposit Assurance Platform</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <button
              onClick={() => setIsBrandShowcaseOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Vector Brand Identity Specs
            </button>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>APH 2026–27 Table 2.1 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
