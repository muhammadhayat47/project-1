export default function Logo({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      role="img"
      aria-label="CareerOS logo"
    >
      <defs>
        <linearGradient id="careerosLogoBg" x1="4" y1="36" x2="36" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="55%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="careerosLogoPeak" x1="10" y1="30" x2="30" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Rounded square badge */}
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#careerosLogoBg)" />

      {/* Ascending bar-chart peaks — career growth, cleaner "path forward" motif */}
      <rect x="9" y="22" width="5.2" height="9" rx="1.5" fill="white" fillOpacity="0.55" />
      <rect x="17.4" y="16" width="5.2" height="15" rx="1.5" fill="white" fillOpacity="0.8" />
      <rect x="25.8" y="9" width="5.2" height="22" rx="1.5" fill="url(#careerosLogoPeak)" />

      {/* Orbiting node marking the current position on the climb */}
      <circle cx="28.4" cy="9" r="3.1" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="28.4" cy="9" r="1.1" fill="white" />
    </svg>
  );
}
