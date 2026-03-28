'use client';

const steps = [
  { label: 'Cart', number: 1 },
  { label: 'Shipping', number: 2 },
  { label: 'Payment', number: 3 },
  { label: 'Confirmation', number: 4 },
];

interface CheckoutProgressProps {
  /** 1 = Cart, 2 = Shipping, 3 = Payment, 4 = Confirmation */
  currentStep: 1 | 2 | 3 | 4;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <nav aria-label="Checkout progress" style={containerStyle}>
      {steps.map((step, i) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <div key={step.number} style={stepWrapperStyle}>
            {/* Connector line before (not on first step) */}
            {i > 0 && (
              <div
                className="checkout-progress-connector"
                style={{
                  ...connectorStyle,
                  backgroundColor: isCompleted || isActive
                    ? 'var(--color-accent-primary, #46C8DC)'
                    : 'var(--color-border, #2A3A4A)',
                }}
              />
            )}

            {/* Circle */}
            <div
              className="checkout-progress-circle"
              style={{
                ...circleStyle,
                ...(isCompleted
                  ? completedCircleStyle
                  : isActive
                    ? activeCircleStyle
                    : inactiveCircleStyle),
              }}
            >
              {isCompleted ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>
                  {step.number}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className="checkout-progress-label"
              style={{
                ...labelStyle,
                color: isCompleted || isActive
                  ? 'var(--color-text-primary, #E8ECF1)'
                  : 'var(--color-text-muted, #6B7A8D)',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

/* ---------- styles ---------- */

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0,
  marginBottom: 32,
  padding: '16px 16px',
  width: '100%',
  overflowX: 'auto',
};

const stepWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  flexShrink: 0,
};

const connectorStyle: React.CSSProperties = {
  height: 2,
  borderRadius: 1,
  flexShrink: 0,
};

const circleStyle: React.CSSProperties = {
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.2s ease',
};

const completedCircleStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-accent-primary, #46C8DC)',
  color: '#fff',
};

const activeCircleStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '2px solid var(--color-accent-primary, #46C8DC)',
  color: 'var(--color-accent-primary, #46C8DC)',
};

const inactiveCircleStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '2px solid var(--color-text-muted, #6B7A8D)',
  color: 'var(--color-text-muted, #6B7A8D)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  marginLeft: 6,
  whiteSpace: 'nowrap',
};
