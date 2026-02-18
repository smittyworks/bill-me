export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="18" width="60" height="42" rx="7" fill="currentColor"/>
      <path d="M24 18 L28 10 L44 10 L48 18Z" fill="currentColor"/>
      <circle cx="36" cy="40" r="16" fill="white" opacity="0.15"/>
      <circle cx="36" cy="40" r="13" fill="white" opacity="0.15"/>
      <circle cx="36" cy="40" r="10" fill="white"/>
      <text x="36" y="45" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="system-ui">$</text>
      <circle cx="56" cy="26" r="4" fill="white" opacity="0.5"/>
    </svg>
  );
}
