"use client";

/**
 * Custom SVG loading animations that replace generic spinners.
 * Each animation is a pure SVG + CSS composition — no extra dependencies.
 */

/* ── Camera Startup Animation ── */
export function CameraLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-20 h-20 flex items-center justify-center ${className}`}>
      {/* Outer pulsing ring */}
      <svg className="absolute inset-0 w-full h-full animate-camera-ring" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" stroke="var(--accent)" strokeWidth="2" strokeDasharray="12 8" opacity="0.3" />
      </svg>
      {/* Second ring counter-rotating */}
      <svg className="absolute inset-0 w-full h-full animate-camera-ring-reverse" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="32" stroke="var(--accent-light)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.4" />
      </svg>
      {/* Camera body */}
      <svg className="relative z-10 w-10 h-10" viewBox="0 0 40 32" fill="none">
        {/* Camera body */}
        <rect x="2" y="8" width="36" height="22" rx="4" stroke="var(--accent)" strokeWidth="2" fill="none" />
        {/* Viewfinder */}
        <rect x="6" y="11" width="28" height="16" rx="2" stroke="var(--accent-light)" strokeWidth="1.5" fill="none" opacity="0.5" />
        {/* Flash */}
        <rect x="28" y="5" width="6" height="3" rx="1" fill="var(--accent)" opacity="0.4" className="animate-camera-flash" />
        {/* Lens */}
        <circle cx="20" cy="19" r="6" stroke="var(--accent)" strokeWidth="1.5" fill="none" className="animate-camera-lens" />
        <circle cx="20" cy="19" r="3" stroke="var(--accent-light)" strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="20" cy="19" r="1" fill="var(--accent)" opacity="0.3" />
        {/* Aperture lines */}
        <line x1="20" y1="13" x2="20" y2="15" stroke="var(--accent-light)" strokeWidth="1" opacity="0.4" />
        <line x1="20" y1="23" x2="20" y2="25" stroke="var(--accent-light)" strokeWidth="1" opacity="0.4" />
        <line x1="14" y1="19" x2="16" y2="19" stroke="var(--accent-light)" strokeWidth="1" opacity="0.4" />
        <line x1="24" y1="19" x2="26" y2="19" stroke="var(--accent-light)" strokeWidth="1" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ── Photo Processing Animation ── */
export function ProcessingLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-20 h-20 flex items-center justify-center ${className}`}>
      {/* Outer spinning arc */}
      <svg className="absolute inset-0 w-full h-full animate-processing-arc" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="36" stroke="url(#procGrad)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="56 170" />
        <defs>
          <linearGradient id="procGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-light)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Photo icon */}
      <svg className="relative z-10 w-9 h-9" viewBox="0 0 36 30" fill="none">
        {/* Photo frame */}
        <rect x="2" y="4" width="32" height="24" rx="3" stroke="var(--accent)" strokeWidth="2" fill="none" />
        {/* Mountains/landscape inside */}
        <path d="M2 22l8-10 6 8 5-6 11 8v2H2z" fill="var(--accent-light)" opacity="0.15" />
        {/* Scan line */}
        <rect x="2" y="4" width="32" height="2" fill="var(--accent)" opacity="0.4" className="animate-processing-scan" rx="1" />
        {/* Sun */}
        <circle cx="24" cy="11" r="3" fill="var(--accent)" opacity="0.2" className="animate-processing-pulse" />
      </svg>
    </div>
  );
}

/* ── QR Loading Animation ── */
export function QRLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-20 h-20 flex items-center justify-center ${className}`}>
      {/* Grid squares that fill in wave pattern */}
      <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
        {Array.from({ length: 25 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const delay = (row + col) * 0.12;
          return (
            <rect
              key={i}
              x={8 + col * 14}
              y={8 + row * 14}
              width={10}
              height={10}
              rx={2}
              fill="var(--accent)"
              opacity="0"
              className="animate-qr-cell"
              style={{ animationDelay: `${delay}s` }}
            />
          );
        })}
        {/* Center indicator */}
        <rect x="33" y="33" width="14" height="14" rx="3" stroke="var(--accent-light)" strokeWidth="1.5" fill="none"
          className="animate-qr-center" />
      </svg>
      {/* Scanning corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent animate-qr-corner" style={{ borderColor: "var(--accent)" }} />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent animate-qr-corner" style={{ borderColor: "var(--accent)", animationDelay: "0.3s" }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent animate-qr-corner" style={{ borderColor: "var(--accent)", animationDelay: "0.6s" }} />
    </div>
  );
}
