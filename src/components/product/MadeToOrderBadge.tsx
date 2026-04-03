'use client';

function PrinterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export function MadeToOrderBadge({ leadTime = '3\u20135 business days' }: { leadTime?: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '9999px',
        background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
      role="status"
      aria-label={`Made to order — ships in ${leadTime}`}
    >
      <PrinterIcon />
      <span>Made to Order</span>
      <span
        style={{
          fontWeight: 400,
          opacity: 0.85,
          borderLeft: '1px solid rgba(255,255,255,0.4)',
          paddingLeft: '8px',
          marginLeft: '2px',
        }}
      >
        {leadTime}
      </span>
    </div>
  );
}
