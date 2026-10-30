import React, { useState } from 'react';
import { FDRGuardIcon, FDRGuardLogo } from './FDRGuardLogo';
import { 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  X, 
  Layers, 
  Eye, 
  Palette, 
  FileCode,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface LogoBrandShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoBrandShowcase: React.FC<LogoBrandShowcaseProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'specs' | 'svg-code'>('preview');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = async (type: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const RAW_ICON_SVG = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vaultDarkChassis" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="50%" stop-color="#0B1320" />
      <stop offset="100%" stop-color="#040810" />
    </linearGradient>
    <linearGradient id="vaultChassisBevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#64748B" />
      <stop offset="35%" stop-color="#C5A059" />
      <stop offset="70%" stop-color="#334155" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <linearGradient id="vaultGoldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <radialGradient id="vaultDoorSteel" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2A374A" />
      <stop offset="60%" stop-color="#131F30" />
      <stop offset="100%" stop-color="#080F1A" />
    </radialGradient>
    <linearGradient id="spokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="50%" stop-color="#CBD5E1" />
      <stop offset="100%" stop-color="#64748B" />
    </linearGradient>
    <radialGradient id="vaultCoreGold" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="35%" stop-color="#FBBF24" />
      <stop offset="75%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </radialGradient>
  </defs>
  <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="url(#vaultDarkChassis)" stroke="url(#vaultChassisBevel)" stroke-width="2.5" stroke-linejoin="round" />
  <polygon points="50,10.5 85,30 85,70 50,89.5 15,70 15,30" fill="none" stroke="#1E293B" stroke-width="1.2" opacity="0.8" />
  <polygon points="50,15 80.5,32.5 80.5,67.5 50,85 19.5,67.5 19.5,32.5" fill="none" stroke="url(#vaultGoldGlow)" stroke-width="2" stroke-dasharray="9 2.5" />
  <rect x="47.5" y="11" width="5" height="4" rx="1" fill="#F59E0B" />
  <rect x="47.5" y="85" width="5" height="4" rx="1" fill="#F59E0B" />
  <circle cx="80.5" cy="32.5" r="2.5" fill="#F59E0B" />
  <circle cx="80.5" cy="67.5" r="2.5" fill="#F59E0B" />
  <circle cx="19.5" cy="67.5" r="2.5" fill="#F59E0B" />
  <circle cx="19.5" cy="32.5" r="2.5" fill="#F59E0B" />
  <circle cx="50" cy="50" r="28" fill="url(#vaultDoorSteel)" stroke="#C5A059" stroke-width="2" />
  <circle cx="50" cy="50" r="23" fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="1.5 2" />
  <circle cx="50" cy="50" r="19" fill="none" stroke="#C5A059" stroke-width="0.8" stroke-opacity="0.6" />
  <line x1="50" y1="38" x2="50" y2="22" stroke="url(#spokeGradient)" stroke-width="3" stroke-linecap="round" />
  <circle cx="50" cy="22" r="2.2" fill="#F59E0B" />
  <line x1="50" y1="62" x2="50" y2="78" stroke="url(#spokeGradient)" stroke-width="3" stroke-linecap="round" />
  <circle cx="50" cy="78" r="2.2" fill="#F59E0B" />
  <line x1="60.4" y1="44" x2="74.2" y2="36" stroke="url(#spokeGradient)" stroke-width="3" stroke-linecap="round" />
  <circle cx="74.2" cy="36" r="2.2" fill="#F59E0B" />
  <line x1="60.4" y1="56" x2="74.2" y2="64" stroke="url(#spokeGradient)" stroke-width="3" stroke-linecap="round" />
  <circle cx="74.2" cy="64" r="2.2" fill="#F59E0B" />
  <line x1="39.6" y1="56" x2="25.8" y2="64" stroke="url(#spokeGradient)" stroke-width="3" stroke-linecap="round" />
  <circle cx="25.8" cy="64" r="2.2" fill="#F59E0B" />
  <line x1="39.6" y1="44" x2="25.8" y2="36" stroke="url(#spokeGradient)" stroke-width="3" stroke-linecap="round" />
  <circle cx="25.8" cy="36" r="2.2" fill="#F59E0B" />
  <circle cx="50" cy="50" r="11.5" fill="url(#vaultCoreGold)" stroke="#FDE68A" stroke-width="1.2" />
  <circle cx="50" cy="50" r="8.5" fill="none" stroke="#78350F" stroke-width="0.8" stroke-opacity="0.7" />
  <circle cx="50" cy="47.5" r="3" fill="#07101E" />
  <polygon points="48,47.5 52,47.5 53.2,54 46.8,54" fill="#07101E" />
  <circle cx="50" cy="5" r="1.5" fill="#FFFBEB" />
</svg>`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-[#0B1524] text-white rounded-xl max-w-4xl w-full border border-slate-700/80 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#08101C]">
          <div className="flex items-center gap-3">
            <FDRGuardIcon size={32} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  FDR GUARD
                </h3>
                <span className="text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                  Brand Identity &amp; Vector System
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional Financial Security Deposit &amp; Fixed Deposit Receipt Vector Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/fdr-guard-icon.svg"
              download="fdr-guard-icon.svg"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>SVG Icon</span>
            </a>
            <a
              href="/fdr-guard-logo-horizontal.svg"
              download="fdr-guard-logo-horizontal.svg"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>SVG Horizontal</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-[#09121F] text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Brand Assets &amp; Layouts
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Design Specs &amp; Geometry
          </button>
          <button
            onClick={() => setActiveTab('svg-code')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'svg-code'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Embed SVG Code
          </button>
        </div>

        {/* Tab 1: Preview Showcase */}
        {activeTab === 'preview' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Primary Horizontal Showcase */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                1. Horizontal Corporate Lockups
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dark Theme Background */}
                <div className="p-6 rounded-lg bg-[#071322] border border-slate-800 flex flex-col justify-center items-center gap-3">
                  <FDRGuardLogo variant="horizontal" theme="dark" size="lg" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Dark Background (Navbar &amp; Digital Portal)
                  </span>
                </div>

                {/* Light Theme Background */}
                <div className="p-6 rounded-lg bg-[#F8FAFC] border border-slate-200 flex flex-col justify-center items-center gap-3">
                  <FDRGuardLogo variant="horizontal" theme="light" size="lg" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Light Background (Certificates &amp; Reports)
                  </span>
                </div>
              </div>
            </div>

            {/* Stacked Emblem Lockup */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                2. Sovereign Stacked Emblem
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-8 rounded-lg bg-[#0A1728] border border-slate-800 flex flex-col items-center justify-center">
                  <FDRGuardLogo variant="stacked" theme="dark" size="lg" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase mt-4">
                    Primary Display Emblem
                  </span>
                </div>

                <div className="p-8 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center">
                  <FDRGuardLogo variant="stacked" theme="light" size="lg" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase mt-4">
                    Official Document Seal
                  </span>
                </div>
              </div>
            </div>

            {/* Standalone Icon Scalability (16px to 96px) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                3. Responsive Size Hierarchy (Small to Display)
              </div>
              <div className="p-5 rounded-lg bg-[#0D1828] border border-slate-800 flex flex-wrap items-end justify-between gap-6">
                
                {/* 16px Favicon */}
                <div className="text-center space-y-1.5">
                  <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto">
                    <FDRGuardIcon size={16} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">16px</span>
                  <span className="text-[9px] text-slate-500 block">Favicon</span>
                </div>

                {/* 24px Navbar Icon */}
                <div className="text-center space-y-1.5">
                  <div className="w-10 h-10 rounded bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto">
                    <FDRGuardIcon size={24} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">24px</span>
                  <span className="text-[9px] text-slate-500 block">Mobile Nav</span>
                </div>

                {/* 36px Standard Applet */}
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto">
                    <FDRGuardIcon size={36} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">36px</span>
                  <span className="text-[9px] text-slate-500 block">Desktop Bar</span>
                </div>

                {/* 48px Header */}
                <div className="text-center space-y-1.5">
                  <div className="w-16 h-16 rounded bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto">
                    <FDRGuardIcon size={48} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">48px</span>
                  <span className="text-[9px] text-slate-500 block">Splash</span>
                </div>

                {/* 80px Large Hero */}
                <div className="text-center space-y-1.5">
                  <div className="w-24 h-24 rounded bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto">
                    <FDRGuardIcon size={76} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">80px</span>
                  <span className="text-[9px] text-slate-500 block">Hero / Login</span>
                </div>
              </div>
            </div>

            {/* Monochromatic Variants */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                4. Monochrome &amp; Specialized Outputs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                  <FDRGuardIcon size={40} variant="monochrome-white" />
                  <div className="text-[11px] font-medium text-slate-300">Monochrome White</div>
                  <div className="text-[9px] font-mono text-slate-500">For stamps &amp; inverted print</div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-slate-200 text-center space-y-2">
                  <FDRGuardIcon size={40} variant="monochrome-navy" />
                  <div className="text-[11px] font-medium text-slate-900">Monochrome Navy</div>
                  <div className="text-[9px] font-mono text-slate-600">For official black &amp; white letterheads</div>
                </div>

                <div className="p-4 rounded-lg bg-[#0A192F] border border-amber-500/30 text-center space-y-2">
                  <FDRGuardIcon size={40} variant="gold" />
                  <div className="text-[11px] font-medium text-amber-300">Metallic Gold Outline</div>
                  <div className="text-[9px] font-mono text-amber-400/80">For VIP &amp; regulatory seals</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Design Specs & Symbolism */}
        {activeTab === 'specs' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Symbolism Breakdown */}
            <div className="p-4 rounded-lg bg-[#0F1E33] border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Iconography &amp; Institutional Governance Rationale
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs leading-relaxed text-slate-300">
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <div className="font-semibold text-amber-300 mb-1">1. Hexagonal Armored Vault Chassis</div>
                  Heavy-duty beveled polygon chassis engineered for impenetrable regulatory security deposit safeguarding, multi-year non-encumbrance assurance, and structural resilience.
                </div>
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <div className="font-semibold text-amber-300 mb-1">2. Luminous Gold Surveillance Channel</div>
                  Perimeter glowing amber/gold energy channel with 6 precision corner locking lugs, denoting continuous real-time surveillance, automated banking reconciliation, and audit compliance.
                </div>
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <div className="font-semibold text-amber-300 mb-1">3. Concentric Vault &amp; Keyhole Hub</div>
                  Circular bank vault door plate with 6 chrome radial wheel spokes and central golden keyhole, symbolizing authorized regulatory access, cryptographic integrity, and deposit release controls.
                </div>
              </div>
            </div>

            {/* Color Palette Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Color Palette Architecture
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border border-slate-800 bg-[#0A192F] space-y-1">
                  <div className="w-6 h-6 rounded bg-[#040810] border border-slate-600 mb-2"></div>
                  <div className="font-bold text-white">Titanium Chassis</div>
                  <div className="text-slate-400 text-[11px]">#040810 / #1E293B</div>
                  <div className="text-[10px] text-slate-500 font-sans">Armored Hexagonal Body</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-[#071322] space-y-1">
                  <div className="w-6 h-6 rounded bg-[#F59E0B] border border-amber-300 mb-2"></div>
                  <div className="font-bold text-amber-300">Luminous Amber</div>
                  <div className="text-slate-400 text-[11px]">#F59E0B / #FDE68A</div>
                  <div className="text-[10px] text-slate-500 font-sans">Active Channel Glow</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-[#0A192F] space-y-1">
                  <div className="w-6 h-6 rounded bg-[#CBD5E1] border border-slate-400 mb-2"></div>
                  <div className="font-bold text-white">Chrome Vault Spokes</div>
                  <div className="text-slate-400 text-[11px]">#F8FAFC / #CBD5E1</div>
                  <div className="text-[10px] text-slate-500 font-sans">6 Radial Wheel Bolts</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-[#0A192F] space-y-1">
                  <div className="w-6 h-6 rounded bg-[#D97706] border border-amber-400 mb-2"></div>
                  <div className="font-bold text-amber-400">Radiant Core Gold</div>
                  <div className="text-slate-400 text-[11px]">#D97706 / #78350F</div>
                  <div className="text-[10px] text-slate-500 font-sans">Central Keyhole Hub</div>
                </div>
              </div>
            </div>

            {/* Typography Rules */}
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-white">Typography Standards</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
                <li><strong className="text-white">FDR:</strong> Heavyweight modern sans-serif (Font-weight: 900, Tracking: +0.08em).</li>
                <li><strong className="text-amber-300">GUARD:</strong> Metallic Gold accent in bold uppercase (Font-weight: 900, Tracking: +0.08em).</li>
                <li><strong className="text-slate-400">Subtitle:</strong> Monospace micro-tracking uppercase (Font-weight: 700, Tracking: +0.25em to +0.30em) &quot;SECURITY DEPOSIT &amp; REGULATORY ASSURANCE&quot;.</li>
              </ul>
            </div>

          </div>
        )}

        {/* Tab 3: Raw SVG Embed Code */}
        {activeTab === 'svg-code' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Standalone Pure Vector SVG Code</h4>
                <p className="text-xs text-slate-400">Ready to copy into any HTML, JSX, Illustrator, or Figma project.</p>
              </div>
              <button
                onClick={() => handleCopyCode('icon', RAW_ICON_SVG)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors cursor-pointer"
              >
                {copiedType === 'icon' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'icon' ? 'Copied to Clipboard!' : 'Copy SVG'}</span>
              </button>
            </div>

            <pre className="p-4 bg-[#050D18] border border-slate-800 rounded-lg text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed max-h-96">
              {RAW_ICON_SVG}
            </pre>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#08101C] flex items-center justify-between text-xs text-slate-400">
          <span>Vector Emblem: 100% Scalable &amp; Resolution-Independent</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
