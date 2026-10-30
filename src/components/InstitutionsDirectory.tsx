import React, { useState, useMemo } from 'react';
import { Institution, FDRApplication, UserProfile } from '../types/aicte';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Clock,
  Landmark,
  FileText
} from 'lucide-react';

interface InstitutionsDirectoryProps {
  institutions: Institution[];
  applications: FDRApplication[];
  currentUser: UserProfile;
  onSelectApplication: (app: FDRApplication) => void;
  onNewSubmission: (institutionId?: string) => void;
}

export const InstitutionsDirectory: React.FC<InstitutionsDirectoryProps> = ({
  institutions,
  applications,
  currentUser,
  onSelectApplication,
  onNewSubmission
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  // Region options
  const regions = useMemo(() => {
    return Array.from(new Set(institutions.map((i) => i.regionalOffice).filter(Boolean)));
  }, [institutions]);

  // Filtered institutions
  const filteredInsts = useMemo(() => {
    return institutions.filter((inst) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inst.name.toLowerCase().includes(q) ||
        inst.code.toLowerCase().includes(q) ||
        inst.city.toLowerCase().includes(q) ||
        inst.state.toLowerCase().includes(q);

      const matchesRegion = regionFilter === 'ALL' || inst.regionalOffice === regionFilter;
      const matchesRating = ratingFilter === 'ALL' || inst.complianceRating === ratingFilter;

      return matchesSearch && matchesRegion && matchesRating;
    });
  }, [institutions, searchQuery, regionFilter, ratingFilter]);

  // Get active FDRs for selected institution
  const selectedInstFdrs = useMemo(() => {
    if (!selectedInst) return [];
    return applications.filter((a) => a.institution_id === selectedInst.id || a.institution_name === selectedInst.name);
  }, [selectedInst, applications]);

  const formatLakhs = (amt: number) => {
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    return `₹${(amt / 100000).toFixed(2)} Lakhs`;
  };

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'COMPLIANT':
        return (
          <span className="text-xs font-semibold text-emerald-700 font-mono inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
            Compliant
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="text-xs font-semibold text-amber-700 font-mono inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
            Action Required
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="text-xs font-semibold text-rose-700 font-mono inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block"></span>
            Non-Compliant
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="bg-[#14243A] text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-teal-400 font-medium flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>AICTE Approved Institutions Directory · Regulatory Compliance Profiles</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Institutions & Security Deposit Standing
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Registered technical institutes, mandatory security deposit totals, active FDR receipts, and compliance audit history.
          </p>
        </div>

        {currentUser.role === 'INSTITUTION_USER' && (
          <button
            onClick={() => onNewSubmission()}
            className="px-4 py-2 bg-[#087F78] hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            + Submit New FDR for Approval
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-[#E0E5E9] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by institution name, AICTE ID, city, or state..."
            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded text-xs bg-slate-50/50 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-700 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Regional Offices</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded bg-white text-xs text-slate-700 focus:outline-none focus:border-teal-600"
          >
            <option value="ALL">All Compliance Ratings</option>
            <option value="COMPLIANT">Fully Compliant</option>
            <option value="NEEDS_ATTENTION">Action Required</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-[#14243A] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'cards' ? 'bg-[#14243A] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Card View
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong>{filteredInsts.length}</strong> of {institutions.length} institutions</span>
        <span className="font-mono">APH 2026–27 Surveillance Standard</span>
      </div>

      {/* TABLE VIEW (High-density Institutional Enterprise Grid) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-[#E0E5E9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#14243A] text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">AICTE Permanent ID</th>
                  <th className="py-3 px-4">Institution Name & Type</th>
                  <th className="py-3 px-4">Regional Office</th>
                  <th className="py-3 px-4 text-right">Active FDR Total</th>
                  <th className="py-3 px-4 text-center">Receipts</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredInsts.map((inst) => {
                  const instFdrs = applications.filter((a) => a.institution_id === inst.id || a.institution_name === inst.name);
                  const totalDeposit = instFdrs.reduce((sum, a) => sum + (Number(a.deposit_amount_inr) || 0), 0);

                  return (
                    <tr
                      key={inst.id}
                      onClick={() => setSelectedInst(inst)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {inst.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors text-sm">
                          {inst.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {inst.type} · Est. {inst.establishedYear}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{inst.regionalOffice}</div>
                        <div className="text-[11px] text-slate-400">{inst.city}, {inst.state}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatLakhs(totalDeposit || inst.totalDepositAmountInr)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {instFdrs.length}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRatingBadge(inst.complianceRating)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInst(inst);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-[#14243A] text-slate-700 hover:text-white font-medium rounded transition-colors text-xs cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInsts.map((inst) => {
            const instFdrs = applications.filter((a) => a.institution_id === inst.id || a.institution_name === inst.name);
            const totalDeposit = instFdrs.reduce((sum, a) => sum + (Number(a.deposit_amount_inr) || 0), 0);

            return (
              <div
                key={inst.id}
                onClick={() => setSelectedInst(inst)}
                className="bg-white rounded-lg border border-[#E0E5E9] hover:border-teal-600 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase">
                        AICTE ID: {inst.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug">
                        {inst.name}
                      </h3>
                    </div>
                    {getRatingBadge(inst.complianceRating)}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{inst.city}, {inst.state}</span>
                      <span aria-hidden="true">·</span>
                      <span>{inst.regionalOffice}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {inst.type} · Est. {inst.establishedYear}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Active Deposits</div>
                      <div className="font-bold text-slate-900 tabular-nums">
                        {formatLakhs(totalDeposit || inst.totalDepositAmountInr)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-sans uppercase">FDR Receipts</div>
                      <div className="font-bold text-slate-900">
                        {instFdrs.length} Records
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-800 font-semibold group-hover:text-teal-950">
                  <span>View Regulatory Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPREHENSIVE INSTITUTION PROFILE MODAL */}
      {selectedInst && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 font-semibold uppercase">
                    AICTE Permanent ID: {selectedInst.code}
                  </span>
                  {getRatingBadge(selectedInst.complianceRating)}
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedInst.name}
                </h2>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedInst.city}, {selectedInst.state}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedInst.regionalOffice}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInst(null)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Institution Administrative Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Category Type</span>
                <div className="font-semibold text-slate-800 mt-0.5">{selectedInst.type}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Head of Institution</span>
                <div className="font-semibold text-slate-800 mt-0.5">{selectedInst.principalName}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Official Contact</span>
                <div className="font-mono text-slate-800 mt-0.5 truncate">{selectedInst.contactPhone}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Established</span>
                <div className="font-mono text-slate-800 mt-0.5">{selectedInst.establishedYear}</div>
              </div>
            </div>

            {/* Accredited Programs */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                AICTE Approved Programs & Intake
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedInst.accreditedPrograms.map((prog, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {prog}
                  </span>
                ))}
              </div>
            </div>

            {/* Submitted Security Deposits / FDR Records */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Security Deposits & FDR Registry ({selectedInstFdrs.length})
                </h4>
                <div className="text-xs font-mono font-semibold text-slate-900">
                  Total Value: {formatLakhs(selectedInstFdrs.reduce((s, a) => s + (Number(a.deposit_amount_inr) || 0), 0))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                {selectedInstFdrs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No FDR records submitted yet for this institution.
                  </div>
                ) : (
                  selectedInstFdrs.map((fdr) => (
                    <div
                      key={fdr.id}
                      className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{fdr.fdr_number}</span>
                          <span className="text-[11px] text-slate-500 font-sans">({fdr.bank_name})</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Principal: ₹{(fdr.deposit_amount_inr || 0).toLocaleString('en-IN')} · Matures: {fdr.maturity_date}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border bg-slate-100 text-slate-700">
                          {fdr.status.replace(/_/g, ' ')}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedInst(null);
                            onSelectApplication(fdr);
                          }}
                          className="px-2.5 py-1 bg-[#087F78] hover:bg-teal-700 text-white font-semibold text-xs rounded"
                        >
                          Inspect Case
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedInst(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
