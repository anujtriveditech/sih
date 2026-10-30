import React from 'react';

export interface FDRGuardIconProps {
  size?: number | string;
  variant?: 'color' | 'gold' | 'monochrome-white' | 'monochrome-navy' | 'light-bg';
  className?: string;
  title?: string;
}

/**
 * FDR GUARD - High-Security Hexagonal Vault & Deposit Custody Emblem
 * Modeled after the authoritative hexagonal vault door:
 * 1. Precision beveled hexagonal chassis (impenetrable regulatory security)
 * 2. Luminous golden perimeter energy ring & locking lugs
 * 3. Multi-ring circular bank vault mechanism with 6 radial locking wheel spokes
 * 4. Radiant golden central core with security keyhole node
 */
export const FDRGuardIcon: React.FC<FDRGuardIconProps> = ({
  size = 40,
  variant = 'color',
  className = '',
  title = 'FDR GUARD Vault Emblem'
}) => {
  const isLightBg = variant === 'light-bg';
  const isMonoWhite = variant === 'monochrome-white';
  const isMonoNavy = variant === 'monochrome-navy';
  const isGoldOnly = variant === 'gold';

  // Master color parameters
  let outerHexFill = 'url(#vaultDarkChassis)';
  let outerHexStroke = 'url(#vaultChassisBevel)';
  let glowChannelStroke = 'url(#vaultGoldGlow)';
  let vaultDoorFill = 'url(#vaultDoorSteel)';
  let vaultDoorStroke = '#C5A059';
  let spokesColor = 'url(#spokeGradient)';
  let coreGlow = 'url(#vaultCoreGold)';
  let keyholeFill = '#07101E';

  if (isLightBg) {
    outerHexFill = '#081322';
    outerHexStroke = '#C5A059';
    glowChannelStroke = '#D97706';
    vaultDoorFill = '#0F2038';
    vaultDoorStroke = '#C5A059';
    spokesColor = '#E2E8F0';
    coreGlow = 'url(#vaultCoreGold)';
    keyholeFill = '#081322';
  } else if (isMonoWhite) {
    outerHexFill = 'none';
    outerHexStroke = '#FFFFFF';
    glowChannelStroke = '#FFFFFF';
    vaultDoorFill = 'none';
    vaultDoorStroke = '#FFFFFF';
    spokesColor = '#FFFFFF';
    coreGlow = '#FFFFFF';
    keyholeFill = '#000000';
  } else if (isMonoNavy) {
    outerHexFill = 'none';
    outerHexStroke = '#0A192F';
    glowChannelStroke = '#0A192F';
    vaultDoorFill = 'none';
    vaultDoorStroke = '#0A192F';
    spokesColor = '#0A192F';
    coreGlow = '#0A192F';
    keyholeFill = '#FFFFFF';
  } else if (isGoldOnly) {
    outerHexFill = 'none';
    outerHexStroke = '#C5A059';
    glowChannelStroke = '#E5B94E';
    vaultDoorFill = 'none';
    vaultDoorStroke = '#C5A059';
    spokesColor = '#C5A059';
    coreGlow = '#E5B94E';
    keyholeFill = '#0A192F';
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-label={title}
      role="img"
    >
      <title>{title}</title>
      <defs>
        {/* Outer Chassis Dark Metal Gradient */}
        <linearGradient id="vaultDarkChassis" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="50%" stopColor="#0B1320" />
          <stop offset="100%" stopColor="#040810" />
        </linearGradient>

        {/* Outer Bevel Metallic Edge */}
        <linearGradient id="vaultChassisBevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="35%" stopColor="#C5A059" />
          <stop offset="70%" stopColor="#334155" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Luminous Gold Neon Glow */}
        <linearGradient id="vaultGoldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Circular Vault Door Steel Radial */}
        <radialGradient id="vaultDoorSteel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2A374A" />
          <stop offset="60%" stopColor="#131F30" />
          <stop offset="100%" stopColor="#080F1A" />
        </radialGradient>

        {/* Spoke Metallic Chrome Gradient */}
        <linearGradient id="spokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Radiant Center Gold Core */}
        <radialGradient id="vaultCoreGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="35%" stopColor="#FBBF24" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>

        {/* Glow Filter for Golden Light Channel */}
        <filter id="goldAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. OUTER HEXAGONAL ARMORED SHIELD CHASSIS */}
      <polygon
        points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
        fill={outerHexFill}
        stroke={outerHexStroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Hexagonal Inner Bevel Rim */}
      <polygon
        points="50,10.5 85,30 85,70 50,89.5 15,70 15,30"
        fill="none"
        stroke="#1E293B"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* 2. LUMINOUS GOLDEN INNER PERIMETER GLOW CHANNEL */}
      <polygon
        points="50,15 80.5,32.5 80.5,67.5 50,85 19.5,67.5 19.5,32.5"
        fill="none"
        stroke={glowChannelStroke}
        strokeWidth="2"
        strokeDasharray="9 2.5"
        filter={variant === 'color' || variant === 'light-bg' ? 'url(#goldAura)' : undefined}
      />

      {/* 6 Perimeter Vault Locking Corner Lugs */}
      {/* Top lug */}
      <rect x="47.5" y="11" width="5" height="4" rx="1" fill="#F59E0B" />
      {/* Bottom lug */}
      <rect x="47.5" y="85" width="5" height="4" rx="1" fill="#F59E0B" />
      {/* Top-Right lug */}
      <circle cx="80.5" cy="32.5" r="2.5" fill="#F59E0B" />
      {/* Bottom-Right lug */}
      <circle cx="80.5" cy="67.5" r="2.5" fill="#F59E0B" />
      {/* Bottom-Left lug */}
      <circle cx="19.5" cy="67.5" r="2.5" fill="#F59E0B" />
      {/* Top-Left lug */}
      <circle cx="19.5" cy="32.5" r="2.5" fill="#F59E0B" />

      {/* 3. HEAVY CIRCULAR BANK VAULT DOOR MECHANISM */}
      {/* Outer Vault Door Plate */}
      <circle
        cx="50"
        cy="50"
        r="28"
        fill={vaultDoorFill}
        stroke={vaultDoorStroke}
        strokeWidth="2"
      />

      {/* Concentric Precision Dial Track */}
      <circle
        cx="50"
        cy="50"
        r="23"
        fill="none"
        stroke="#475569"
        strokeWidth="1"
        strokeDasharray="1.5 2"
      />

      <circle
        cx="50"
        cy="50"
        r="19"
        fill="none"
        stroke="#C5A059"
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />

      {/* 4. SIX RADIAL VAULT WHEEL SPOKES / LOCKING BOLTS */}
      {/* Vertical Spokes (90° & 270°) */}
      <g>
        {/* Top Spoke */}
        <line x1="50" y1="38" x2="50" y2="22" stroke={spokesColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="22" r="2.2" fill="#F59E0B" />
        <circle cx="50" cy="31" r="1.5" fill="#94A3B8" />

        {/* Bottom Spoke */}
        <line x1="50" y1="62" x2="50" y2="78" stroke={spokesColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="78" r="2.2" fill="#F59E0B" />
        <circle cx="50" cy="69" r="1.5" fill="#94A3B8" />

        {/* Top-Right Spoke (30°) */}
        <line x1="60.4" y1="44" x2="74.2" y2="36" stroke={spokesColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="74.2" cy="36" r="2.2" fill="#F59E0B" />

        {/* Bottom-Right Spoke (330°) */}
        <line x1="60.4" y1="56" x2="74.2" y2="64" stroke={spokesColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="74.2" cy="64" r="2.2" fill="#F59E0B" />

        {/* Bottom-Left Spoke (210°) */}
        <line x1="39.6" y1="56" x2="25.8" y2="64" stroke={spokesColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="25.8" cy="64" r="2.2" fill="#F59E0B" />

        {/* Top-Left Spoke (150°) */}
        <line x1="39.6" y1="44" x2="25.8" y2="36" stroke={spokesColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="25.8" cy="36" r="2.2" fill="#F59E0B" />
      </g>

      {/* 5. RADIANT GOLDEN CENTRAL CORE & KEYHOLE */}
      {/* Central Vault Hub Ring */}
      <circle
        cx="50"
        cy="50"
        r="11.5"
        fill={coreGlow}
        stroke="#FDE68A"
        strokeWidth="1.2"
        filter={variant === 'color' || variant === 'light-bg' ? 'url(#goldAura)' : undefined}
      />

      {/* Inner Metallic Bezel */}
      <circle
        cx="50"
        cy="50"
        r="8.5"
        fill="none"
        stroke="#78350F"
        strokeWidth="0.8"
        strokeOpacity="0.7"
      />

      {/* Sovereign Golden Keyhole Silhouette */}
      {/* Keyhole Top Circle */}
      <circle
        cx="50"
        cy="47.5"
        r="3"
        fill={keyholeFill}
      />
      {/* Keyhole Lower Stem */}
      <polygon
        points="48,47.5 52,47.5 53.2,54 46.8,54"
        fill={keyholeFill}
      />

      {/* Micro Sparkle Accent at Top Pinnacle */}
      {(variant === 'color' || variant === 'light-bg') && (
        <circle cx="50" cy="5" r="1.5" fill="#FFFBEB" />
      )}
    </svg>
  );
};

export interface FDRGuardLogoProps {
  variant?: 'horizontal' | 'stacked' | 'compact' | 'icon-only';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  subtitle?: string;
}

/**
 * FDR GUARD - Full Corporate Brand Identity Component
 * Renders horizontal wordmark, stacked badge, or compact navbar identity.
 */
export const FDRGuardLogo: React.FC<FDRGuardLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  size = 'md',
  className = '',
  subtitle = 'SECURITY DEPOSIT & REGULATORY ASSURANCE'
}) => {
  const isDark = theme === 'dark';

  // Dimension scaling
  const iconSizes = {
    sm: 28,
    md: 40,
    lg: 52,
    xl: 68
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const subtitleSizes = {
    sm: 'text-[8px] tracking-[0.22em]',
    md: 'text-[9.5px] tracking-[0.25em]',
    lg: 'text-[11px] tracking-[0.28em]',
    xl: 'text-[12px] tracking-[0.3em]'
  };

  if (variant === 'icon-only') {
    return (
      <FDRGuardIcon
        size={iconSizes[size]}
        variant={isDark ? 'color' : 'light-bg'}
        className={className}
      />
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <FDRGuardIcon
          size={iconSizes[size] * 1.35}
          variant={isDark ? 'color' : 'light-bg'}
          className="mb-2.5"
        />
        <div className="flex items-center tracking-tight font-sans font-bold">
          <span className={isDark ? 'text-white' : 'text-[#0D1828]'}>FDR</span>
          <span className="text-[#F59E0B] ml-1.5 font-black">GUARD</span>
        </div>
        {subtitle && (
          <p
            className={`font-mono uppercase font-semibold mt-1 text-slate-400 ${subtitleSizes[size]}`}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <FDRGuardIcon
        size={iconSizes[size]}
        variant={isDark ? 'color' : 'light-bg'}
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight font-sans leading-none">
          <span
            className={`font-black ${textSizes[size]} ${
              isDark ? 'text-white' : 'text-[#0A192F]'
            } tracking-wider`}
          >
            FDR
          </span>
          <span className={`font-black ${textSizes[size]} text-[#F59E0B] ml-1.5 tracking-wider`}>
            GUARD
          </span>
        </div>
        {subtitle && (
          <p
            className={`font-mono uppercase font-semibold leading-none mt-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${subtitleSizes[size]}`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
