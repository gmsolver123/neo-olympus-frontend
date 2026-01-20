interface CrystalLogoProps {
  className?: string;
  size?: number;
}

export function CrystalLogo({ className = '', size = 32 }: CrystalLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer glow */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1"/>
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9"/>
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      
      {/* Background circle with subtle fill */}
      <circle cx="50" cy="50" r="45" fill="url(#innerGradient)" opacity="0.5"/>
      
      {/* Main crystal structure - geometric wireframe star */}
      <g filter="url(#glow)" stroke="url(#crystalGradient)" strokeWidth="1.5" fill="none">
        {/* Central octahedron shape */}
        <path d="M50 10 L90 50 L50 90 L10 50 Z" opacity="0.8"/>
        <path d="M50 10 L50 90" opacity="0.4"/>
        <path d="M10 50 L90 50" opacity="0.4"/>
        
        {/* Inner diamond */}
        <path d="M50 25 L75 50 L50 75 L25 50 Z" opacity="0.9"/>
        
        {/* Corner spikes */}
        <path d="M50 10 L35 30 L50 25 L65 30 Z" opacity="0.7"/>
        <path d="M90 50 L70 35 L75 50 L70 65 Z" opacity="0.7"/>
        <path d="M50 90 L65 70 L50 75 L35 70 Z" opacity="0.7"/>
        <path d="M10 50 L30 65 L25 50 L30 35 Z" opacity="0.7"/>
        
        {/* Inner details - grid lines */}
        <path d="M35 30 L50 50 L65 30" opacity="0.5"/>
        <path d="M70 35 L50 50 L70 65" opacity="0.5"/>
        <path d="M65 70 L50 50 L35 70" opacity="0.5"/>
        <path d="M30 65 L50 50 L30 35" opacity="0.5"/>
        
        {/* Center point glow */}
        <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9"/>
        <circle cx="50" cy="50" r="8" stroke="#ffffff" strokeWidth="0.5" opacity="0.4"/>
      </g>
    </svg>
  );
}
