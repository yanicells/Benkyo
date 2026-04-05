const cls = {
  chrome: "fill-[var(--surface-low)] stroke-[var(--outline-variant)]",
  accent: "fill-[var(--primary)]",
  accentLight: "fill-[var(--primary-container)]",
  text: "fill-[var(--on-surface)]",
  textMuted: "fill-[var(--on-surface-variant)]",
  surface: "fill-[var(--surface-lowest)]",
  success: "fill-[var(--success)]",
  highlight: "stroke-[var(--primary)] stroke-2",
};

/* ── iOS ──────────────────────────────────────────────── */

export function IosShareIcon() {
  return (
    <svg viewBox="0 0 220 160" className="w-full max-w-[220px]" aria-hidden>
      {/* Phone frame */}
      <rect x="40" y="8" width="140" height="144" rx="16" className={cls.chrome} strokeWidth="1.5" />
      {/* Safari address bar */}
      <rect x="54" y="20" width="112" height="22" rx="8" className={cls.surface} />
      <text x="110" y="35" textAnchor="middle" className={`${cls.textMuted} text-[8px]`}>benkyo.app</text>
      {/* Content placeholder lines */}
      <rect x="58" y="54" width="80" height="6" rx="3" className={cls.accentLight} />
      <rect x="58" y="66" width="104" height="6" rx="3" opacity="0.3" className={cls.accentLight} />
      <rect x="58" y="78" width="64" height="6" rx="3" opacity="0.2" className={cls.accentLight} />
      {/* Bottom Safari toolbar */}
      <rect x="40" y="118" width="140" height="34" rx="0" className={cls.surface} />
      <line x1="40" y1="118" x2="180" y2="118" className="stroke-[var(--outline-variant)]" strokeWidth="0.5" />
      {/* Share button — highlighted */}
      <g transform="translate(110, 127)">
        <circle r="13" className="fill-[var(--primary)] opacity-15" />
        {/* Share icon: square with up arrow */}
        <rect x="-5" y="-2" width="10" height="9" rx="1.5" fill="none" className={cls.highlight} strokeWidth="1.5" />
        <line x1="0" y1="-7" x2="0" y2="3" className={cls.highlight} strokeWidth="1.5" />
        <polyline points="-3,-4 0,-7 3,-4" fill="none" className={cls.highlight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Pulse ring */}
      <circle cx="110" cy="127" r="16" fill="none" className="stroke-[var(--primary)]" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" from="13" to="20" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function IosAddToHome() {
  return (
    <svg viewBox="0 0 220 180" className="w-full max-w-[220px]" aria-hidden>
      {/* Share sheet background */}
      <rect x="24" y="8" width="172" height="164" rx="16" className={cls.surface} />
      <rect x="24" y="8" width="172" height="164" rx="16" fill="none" className="stroke-[var(--outline-variant)]" strokeWidth="0.5" />
      {/* Drag handle */}
      <rect x="94" y="16" width="32" height="4" rx="2" className="fill-[var(--outline-variant)] opacity-40" />
      {/* Share sheet rows */}
      {[
        { y: 34, label: "Copy", icon: "copy", highlight: false },
        { y: 58, label: "Add Bookmark", icon: "bookmark", highlight: false },
        { y: 82, label: "Add to Home Screen", icon: "plus", highlight: true },
        { y: 106, label: "Find on Page", icon: "search", highlight: false },
      ].map((row) => (
        <g key={row.label}>
          {row.highlight && (
            <rect x="32" y={row.y - 2} width="156" height="22" rx="8" className="fill-[var(--primary)] opacity-8" />
          )}
          <rect x="38" y={row.y} width="18" height="18" rx="5" className={row.highlight ? cls.accent : cls.chrome} strokeWidth="0" />
          {row.highlight ? (
            /* Plus icon */
            <g transform={`translate(47, ${row.y + 9})`}>
              <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ) : (
            <circle cx="47" cy={row.y + 9} r="3" className={cls.textMuted} opacity="0.3" />
          )}
          <text x="64" y={row.y + 13} className={`${row.highlight ? cls.accent : cls.textMuted} text-[9px] font-semibold`}>
            {row.label}
          </text>
          {row.highlight && (
            <>
              {/* Arrow indicator */}
              <text x="172" y={row.y + 13} textAnchor="end" className={`${cls.accent} text-[9px]`}>›</text>
              {/* Highlight border */}
              <rect x="32" y={row.y - 2} width="156" height="22" rx="8" fill="none" className={cls.highlight} strokeWidth="1" opacity="0.5" />
            </>
          )}
        </g>
      ))}
      {/* Divider */}
      <line x1="38" y1="132" x2="182" y2="132" className="stroke-[var(--outline-variant)]" strokeWidth="0.5" opacity="0.4" />
      <text x="38" y="148" className={`${cls.textMuted} text-[8px]`}>Cancel</text>
    </svg>
  );
}

export function IosConfirm() {
  return (
    <svg viewBox="0 0 220 160" className="w-full max-w-[220px]" aria-hidden>
      {/* Dialog card */}
      <rect x="30" y="12" width="160" height="136" rx="16" className={cls.surface} />
      <rect x="30" y="12" width="160" height="136" rx="16" fill="none" className="stroke-[var(--outline-variant)]" strokeWidth="0.5" />
      {/* Header */}
      <text x="110" y="36" textAnchor="middle" className={`${cls.text} text-[10px] font-bold`}>Add to Home Screen</text>
      {/* App icon preview */}
      <rect x="88" y="48" width="44" height="44" rx="10" className={cls.accentLight} />
      <text x="110" y="75" textAnchor="middle" className={`${cls.accent} text-[12px] font-bold`}>B</text>
      {/* App name */}
      <text x="110" y="104" textAnchor="middle" className={`${cls.text} text-[9px]`}>Benkyo</text>
      {/* Add button */}
      <rect x="68" y="116" width="84" height="24" rx="8" className={cls.accent} />
      <text x="110" y="132" textAnchor="middle" fill="white" className="text-[10px] font-bold">Add</text>
    </svg>
  );
}

/* ── Android ──────────────────────────────────────────── */

export function AndroidMenu() {
  return (
    <svg viewBox="0 0 220 160" className="w-full max-w-[220px]" aria-hidden>
      {/* Phone frame */}
      <rect x="40" y="8" width="140" height="144" rx="16" className={cls.chrome} strokeWidth="1.5" />
      {/* Chrome toolbar */}
      <rect x="40" y="8" width="140" height="36" rx="16" className={cls.accent} />
      <rect x="40" y="28" width="140" height="16" className={cls.accent} />
      {/* Address bar */}
      <rect x="52" y="16" width="92" height="20" rx="10" fill="white" opacity="0.2" />
      <text x="98" y="30" textAnchor="middle" fill="white" className="text-[7px]" opacity="0.8">benkyo.app</text>
      {/* Three dots — highlighted */}
      <g transform="translate(160, 26)">
        <circle r="10" className="fill-white opacity-15" />
        <circle cx="0" cy="-4" r="1.5" fill="white" />
        <circle cx="0" cy="0" r="1.5" fill="white" />
        <circle cx="0" cy="4" r="1.5" fill="white" />
      </g>
      {/* Pulse ring */}
      <circle cx="160" cy="26" r="13" fill="none" stroke="white" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" from="10" to="18" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Content placeholder */}
      <rect x="54" y="56" width="80" height="6" rx="3" className={cls.accentLight} />
      <rect x="54" y="68" width="112" height="6" rx="3" opacity="0.3" className={cls.accentLight} />
      <rect x="54" y="80" width="64" height="6" rx="3" opacity="0.2" className={cls.accentLight} />
      {/* Bottom nav hint */}
      <rect x="40" y="124" width="140" height="28" rx="0" className={cls.surface} />
      <line x1="40" y1="124" x2="180" y2="124" className="stroke-[var(--outline-variant)]" strokeWidth="0.5" />
      <rect x="72" y="132" width="76" height="4" rx="2" className="fill-[var(--outline-variant)] opacity-30" />
    </svg>
  );
}

export function AndroidInstall() {
  return (
    <svg viewBox="0 0 220 180" className="w-full max-w-[220px]" aria-hidden>
      {/* Dropdown menu */}
      <rect x="60" y="8" width="136" height="164" rx="12" className={cls.surface} />
      <rect x="60" y="8" width="136" height="164" rx="12" fill="none" className="stroke-[var(--outline-variant)]" strokeWidth="0.5" />
      {/* Menu items */}
      {[
        { y: 24, label: "New tab", highlight: false },
        { y: 48, label: "New incognito tab", highlight: false },
        { y: 72, label: "Bookmarks", highlight: false },
        { y: 96, label: "Install app", highlight: true },
        { y: 120, label: "Translate", highlight: false },
        { y: 144, label: "Settings", highlight: false },
      ].map((item) => (
        <g key={item.label}>
          {item.highlight && (
            <rect x="66" y={item.y - 2} width="124" height="22" rx="6" className="fill-[var(--primary)] opacity-8" />
          )}
          {item.highlight ? (
            /* Download icon */
            <g transform={`translate(80, ${item.y + 9})`}>
              <line x1="0" y1="-4" x2="0" y2="4" className={cls.highlight} strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="-3,1 0,4 3,1" fill="none" className={cls.highlight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="-5" y1="6" x2="5" y2="6" className={cls.highlight} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ) : (
            <circle cx="80" cy={item.y + 9} r="3" className={cls.textMuted} opacity="0.2" />
          )}
          <text x="94" y={item.y + 13} className={`${item.highlight ? cls.accent : cls.textMuted} text-[9px]`}>
            {item.label}
          </text>
          {item.highlight && (
            <rect x="66" y={item.y - 2} width="124" height="22" rx="6" fill="none" className={cls.highlight} strokeWidth="1" opacity="0.5" />
          )}
        </g>
      ))}
    </svg>
  );
}

/* ── Desktop ──────────────────────────────────────────── */

export function DesktopInstallIcon() {
  return (
    <svg viewBox="0 0 280 140" className="w-full max-w-[280px]" aria-hidden>
      {/* Browser window */}
      <rect x="10" y="8" width="260" height="124" rx="10" className={cls.chrome} strokeWidth="1.5" />
      {/* Title bar */}
      <rect x="10" y="8" width="260" height="30" rx="10" className={cls.surface} />
      <rect x="10" y="28" width="260" height="10" className={cls.surface} />
      {/* Traffic lights */}
      <circle cx="26" cy="22" r="4" fill="#FF5F57" />
      <circle cx="38" cy="22" r="4" fill="#FEBC2E" />
      <circle cx="50" cy="22" r="4" fill="#28C840" />
      {/* Address bar */}
      <rect x="62" y="14" width="160" height="16" rx="8" className={cls.chrome} strokeWidth="0.5" />
      <text x="142" y="25" textAnchor="middle" className={`${cls.textMuted} text-[7px]`}>benkyo.app</text>
      {/* Install icon in address bar — highlighted */}
      <g transform="translate(232, 22)">
        <circle r="10" className="fill-[var(--primary)] opacity-12" />
        {/* Monitor with down arrow icon */}
        <rect x="-6" y="-5" width="12" height="8" rx="1" fill="none" className={cls.highlight} strokeWidth="1.2" />
        <line x1="0" y1="3" x2="0" y2="6" className={cls.highlight} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-3" y1="6" x2="3" y2="6" className={cls.highlight} strokeWidth="1.2" strokeLinecap="round" />
        {/* Down arrow inside monitor */}
        <line x1="0" y1="-3" x2="0" y2="1" className={cls.highlight} strokeWidth="1.2" strokeLinecap="round" />
        <polyline points="-2,-1 0,1 2,-1" fill="none" className={cls.highlight} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Pulse ring */}
      <circle cx="232" cy="22" r="13" fill="none" className="stroke-[var(--primary)]" strokeWidth="1" opacity="0.3">
        <animate attributeName="r" from="10" to="18" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Content placeholder */}
      <rect x="30" y="50" width="120" height="8" rx="4" className={cls.accentLight} />
      <rect x="30" y="64" width="200" height="6" rx="3" opacity="0.3" className={cls.accentLight} />
      <rect x="30" y="76" width="160" height="6" rx="3" opacity="0.2" className={cls.accentLight} />
      {/* Card placeholder */}
      <rect x="30" y="92" width="100" height="30" rx="8" className={cls.surface} />
      <rect x="140" y="92" width="100" height="30" rx="8" className={cls.surface} />
    </svg>
  );
}

/* ── Success ──────────────────────────────────────────── */

export function SuccessCheckmark() {
  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-[120px]" aria-hidden>
      <circle cx="60" cy="60" r="48" className={cls.success} opacity="0.12" />
      <circle cx="60" cy="60" r="34" className={cls.success} opacity="0.2" />
      <circle cx="60" cy="60" r="22" className={cls.success} />
      <polyline
        points="50,60 57,67 72,52"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
