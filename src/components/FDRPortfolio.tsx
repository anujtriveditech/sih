import React, { useState, useMemo } from 'react';
import { FDRApplication, UserProfile, LifecycleState, RiskLevel } from '../types/aicte';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Landmark
} from 'lucide-react';

interface FDRPortfolioProps {
  applications: FDRApplication[];
  currentUser: UserProfile;
  onSelectApplication: (app: FDRApplication) => void;
  onNewSubmission: () => void;
}

export const FDRPortfolio: React.FC<FDRPortfolioProps> = ({
  applications,
  currentUser,
  onSelectApplication,
  onNewSubmission
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bankFilter, setBankFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'risk' | 'status'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Unique bank options
  const uniqueBanks = useMemo(() => {
    const set = new Set(applications.map((a) => a.bank_name).filter(Boolean));
    return Array.from(set);
  }, [applications]);

  // Filtering
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.fdr_number.toLowerCase().includes(q) ||
        app.institution_name.toLowerCase().includes(q) ||
        app.bank_name.toLowerCase().includes(q) ||
        app.application_number.toLowerCase().includes(q);

      // Status
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

      // Bank
      const matchesBank = bankFilter === 'ALL' || app.bank_name === bankFilter;

      // Risk
      const matchesRisk = riskFilter === 'ALL' || app.risk_score?.level === riskFilter;

      return matchesSearch && matchesStatus && matchesBank && matchesRisk;
    });
  }, [applications, searchQuery, statusFilter, bankFilter, riskFilter]);

  // Sorting
  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'amount') {
        comparison = (a.deposit_amount_inr || 0) - (b.deposit_amount_inr || 0);
      } else if (sortBy === 'date') {
        comparison = new Date(a.issue_date || '').getTime() - new Date(b.issue_date || '').getTime();
      } else if (sortBy === 'risk') {
        comparison = (a.risk_score?.score || 0) - (b.risk_score?.score || 0);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredApps, sortBy, sortOrder]);

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['Application Number', 'FDR Reference', 'Institution Name', 'Program Category', 'Bank', 'Branch IFSC', 'Deposit Amount (INR)', 'Issue Date', 'Maturity Date', 'Status', 'Risk Score', 'Risk Level'];
    const rows = sortedApps.map((a) => [
      `"${a.application_number}"`,
      `"${a.fdr_number}"`,
      `"${a.institution_name}"`,
      `"${a.program_category}"`,
      `"${a.bank_name}"`,
      `"${a.branch_ifsc}"`,
      a.deposit_amount_inr,
      `"${a.issue_date}"`,
      `"${a.maturity_date}"`,
      `"${a.status}"`,
      a.risk_score?.score || 0,
      `"${a.risk_score?.level || 'LOW'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_SmartTrack_Portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: LifecycleState) => {
    const config: Record<LifecycleState, { text: string; dot: string; label: string }> = {
      APPROVED: { text: 'text-emerald-700 font-semibold', dot: 'bg-emerald-600', label: 'Approved' },
      UNDER_REVIEW: { text: 'text-sky-700 font-semibold', dot: 'bg-sky-600', label: 'Under Review' },
      SUBMITTED: { text: 'text-slate-700 font-semibold', dot: 'bg-slate-500', label: 'Submitted' },
      CORRECTION_REQUIRED: { text: 'text-rose-700 font-semibold', dot: 'bg-rose-600', label: 'Correction Required' },
      BANK_CONFIRMATION_PENDING: { text: 'text-amber-700 font-semibold', dot: 'bg-amber-500', label: 'Bank Confirmation Pending' },
      REJECTED: { text: 'text-red-700 font-semibold', dot: 'bg-red-600', label: 'Rejected' },
      RENEWAL_PENDING: { text: 'text-purple-700 font-semibold', dot: 'bg-purple-600', label: 'Renewal Pending' },
      RELEASE_PENDING: { text: 'text-indigo-700 font-semibold', dot: 'bg-indigo-600', label: 'Release Pending' },
      RELEASED: { text: 'text-teal-700 font-semibold', dot: 'bg-teal-600', label: 'Released' },
      EXPIRED: { text: 'text-red-800 font-bold', dot: 'bg-red-700', label: 'Expired' },
      DRAFT: { text: 'text-slate-500', dot: 'bg-slate-400', label: 'Draft' }
    };

    const cfg = config[status] || { text: 'text-slate-600', dot: 'bg-slate-400', label: status.replace(/_/g, ' ') };

    return (
      <span className={`text-xs inline-flex items-center gap-1.5 whitespace-nowrap font-mono ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`}></span>
        {cfg.label}
      </span>
    );
  };

  const getRiskBadge = (level?: RiskLevel, score?: number) => {
    if (!level) return null;
    const colors: Record<RiskLevel, string> = {
      CRITICAL: 'text-red-700 font-bold',
      HIGH: 'text-amber-700 font-semibold',
      MEDIUM: 'text-slate-700 font-medium',
      LOW: 'text-slate-500'
    };
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
        <span className={colors[level]}>{score ?? 0}</span>
        <span className="text-[10px] text-slate-500 uppercase">({level})</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Global Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by FDR receipt number, institution name, or issuing bank..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-teal-600 bg-slate-50/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onNewSubmission}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <span>+ New Submission</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
              Workflow Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 text-xs border border-slate-200 rounded bg-white"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              <option value="APPROVED">Approved</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CORRECTION_REQUIRED">Correction Required</option>
              <option value="BANK_CONFIRMATION_PENDING">Bank Confirmation Pending</option>
              <option value="RENEWAL_PENDING">Renewal Pending</option>
              <option value="RELEASE_PENDING">Release Pending</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Bank Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
              Issuing Bank
            </label>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="w-full p-1.5 text-xs border border-slate-200 rounded bg-white"
            >
              <option value="ALL">All Scheduled Banks</option>
              {uniqueBanks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
              Risk Urgency
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full p-1.5 text-xs border border-slate-200 rounded bg-white"
            >
              <option value="ALL">All Risk Priorities</option>
              <option value="CRITICAL">Critical Urgency</option>
              <option value="HIGH">High Urgency</option>
              <option value="MEDIUM">Medium Urgency</option>
              <option value="LOW">Low Urgency</option>
            </select>
          </div>

          {/* Sort Control */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
              Sort Order
            </label>
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="flex-1 p-1.5 text-xs border border-slate-200 rounded bg-white"
              >
                <option value="risk">Risk Priority Score</option>
                <option value="amount">Deposit Amount</option>
                <option value="date">Issue Date</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-600"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#17263B] text-slate-200 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">FDR Ref / Application</th>
                <th className="py-3 px-4">Institution Details</th>
                <th className="py-3 px-4">Bank & Branch</th>
                <th className="py-3 px-4 text-right">Deposit Amount</th>
                <th className="py-3 px-4">Maturity Horizon</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No FDR records found matching the active search and filter criteria.
                  </td>
                </tr>
              ) : (
                sortedApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: FDR Ref */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-900">{app.fdr_number}</div>
                      <div className="text-[10px] text-slate-400">{app.application_number}</div>
                    </td>

                    {/* Column 2: Institution */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-medium text-slate-800 truncate" title={app.institution_name}>
                        {app.institution_name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {app.program_category}
                      </div>
                    </td>

                    {/* Column 3: Bank */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{app.bank_name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{app.branch_ifsc}</div>
                    </td>

                    {/* Column 4: Amount */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      ₹{(app.deposit_amount_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Column 5: Maturity */}
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <div>{app.maturity_date || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        Tenure: {app.tenure_years} Yrs
                      </div>
                    </td>

                    {/* Column 6: Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Column 7: Priority Score */}
                    <td className="py-3 px-4">
                      {getRiskBadge(app.risk_score?.level, app.risk_score?.score)}
                    </td>

                    {/* Column 8: Action button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(app);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-[#14B8A6] hover:text-slate-950 text-slate-700 font-medium rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Strip */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{sortedApps.length}</span> of <span className="font-semibold text-slate-700">{applications.length}</span> total FDR records
          </div>
          <div className="font-mono text-[11px]">
            Filtered Volume: ₹{(sortedApps.reduce((sum, a) => sum + (a.deposit_amount_inr || 0), 0) / 100000).toFixed(2)} Lakhs
          </div>
        </div>
      </div>
    </div>
  );
};
