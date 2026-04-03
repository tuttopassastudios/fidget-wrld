'use client';

interface CustomizationOptions {
  engravingText?: boolean;
  keychainHole?: boolean;
}

interface CustomizationValue {
  engravingText?: string;
  keychainHole?: boolean;
}

interface CustomizationPanelProps {
  options: CustomizationOptions;
  value: CustomizationValue;
  onChange: (val: CustomizationValue) => void;
}

const MAX_ENGRAVING = 40;

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

export function CustomizationPanel({ options, value, onChange }: CustomizationPanelProps) {
  const hasAnyOption = options.engravingText || options.keychainHole;
  if (!hasAnyOption) return null;

  const engravingLength = value.engravingText?.length ?? 0;

  return (
    <div
      style={{
        background: '#f0fdfa',
        border: '1px solid #99f6e4',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#0f766e',
          fontWeight: 600,
          fontSize: '15px',
        }}
      >
        <PencilIcon />
        <span>Customization Options</span>
      </div>

      {/* Engraving text input */}
      {options.engravingText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="engraving-text"
            style={{ fontSize: '14px', fontWeight: 500, color: '#134e4a' }}
          >
            Engrave a name or message
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="engraving-text"
              type="text"
              name="engravingText"
              maxLength={MAX_ENGRAVING}
              placeholder="e.g. Alex\u2026"
              autoComplete="off"
              spellCheck={false}
              value={value.engravingText ?? ''}
              onChange={(e) =>
                onChange({ ...value, engravingText: e.target.value })
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px',
                paddingRight: '52px',
                fontSize: '16px',
                border: '1px solid #5eead4',
                borderRadius: '8px',
                background: '#fff',
                color: '#0f172a',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0d9488';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#5eead4';
                e.currentTarget.style.boxShadow = 'none';
                onChange({ ...value, engravingText: e.currentTarget.value.trim() });
              }}
            />
            <span
              aria-live="polite"
              aria-label={`${engravingLength} of ${MAX_ENGRAVING} characters used`}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '12px',
                color: engravingLength >= MAX_ENGRAVING ? '#dc2626' : '#94a3b8',
                fontVariantNumeric: 'tabular-nums',
                pointerEvents: 'none',
              }}
            >
              {engravingLength}/{MAX_ENGRAVING}
            </span>
          </div>
        </div>
      )}

      {/* Keychain hole toggle */}
      {options.keychainHole && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#134e4a',
            fontWeight: 500,
          }}
        >
          <input
            type="checkbox"
            name="keychainHole"
            checked={value.keychainHole ?? false}
            onChange={(e) => onChange({ ...value, keychainHole: e.target.checked })}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#0d9488',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          Add keychain hole{' '}
          <span style={{ fontWeight: 400, color: '#0f766e' }}>(+$0.00)</span>
        </label>
      )}

      {/* Info note */}
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          color: '#0f766e',
          lineHeight: 1.5,
          borderTop: '1px solid #ccfbf1',
          paddingTop: '10px',
        }}
      >
        Custom orders are reviewed before printing. We&rsquo;ll confirm your design within
        1&nbsp;business day.
      </p>
    </div>
  );
}
