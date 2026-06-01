export function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="mx-auto h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      <circle cx="80" cy="60" r="8" fill="#b8cdfb" opacity="0.6" />
      <circle cx="320" cy="100" r="6" fill="#b8cdfb" opacity="0.5" />
      <text x="300" y="180" fill="#b8cdfb" fontSize="20" opacity="0.5">
        +
      </text>
      <text x="60" y="200" fill="#b8cdfb" fontSize="16" opacity="0.4">
        +
      </text>
      {/* Desk */}
      <line x1="100" y1="280" x2="300" y2="280" stroke="#64748b" strokeWidth="3" />
      <line x1="130" y1="280" x2="130" y2="310" stroke="#64748b" strokeWidth="2" />
      <line x1="270" y1="280" x2="270" y2="310" stroke="#64748b" strokeWidth="2" />
      {/* Character body (test tube) */}
      <rect x="175" y="140" width="50" height="120" rx="25" fill="#5c8ef2" opacity="0.85" />
      <circle cx="190" cy="175" r="4" fill="white" />
      <circle cx="210" cy="175" r="4" fill="white" />
      <path d="M188 195 Q200 205 212 195" stroke="white" strokeWidth="2" fill="none" />
      {/* Laptop */}
      <rect x="155" y="230" width="90" height="50" rx="4" fill="#334155" />
      <rect x="160" y="235" width="80" height="38" rx="2" fill="#94a3b8" />
      <rect x="190" y="278" width="20" height="4" fill="#64748b" />
    </svg>
  )
}
