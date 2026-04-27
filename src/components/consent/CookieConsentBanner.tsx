'use client';

import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useConsent } from '@/lib/consent';

export default function CookieConsentBanner() {
  const { hasInteracted, acceptAll, updateConsent } = useConsent();
  const [open, setOpen] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(true);
  const [marketingChecked, setMarketingChecked] = useState(true);
  const manageButtonRef = useRef<HTMLButtonElement>(null);

  if (hasInteracted) return null;

  const handleSavePreferences = () => {
    updateConsent({ analytics: analyticsChecked, marketing: marketingChecked });
    setOpen(false);
  };

  return (
    <>
      <div
        role="region"
        aria-label="Cookie consent"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: 'var(--od-navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          zIndex: 50,
          borderTop: '1px solid var(--od-border)',
        }}
      >
        <p style={{ color: 'var(--od-text)', fontSize: '0.875rem', margin: 0 }}>
          We use cookies to improve your experience.{' '}
          <a href="/privacy" style={{ color: 'var(--od-gold)' }}>
            Privacy policy
          </a>
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                ref={manageButtonRef}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--od-border)',
                  color: 'var(--od-text)',
                  padding: '0.375rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Manage
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  zIndex: 60,
                }}
              />
              <Dialog.Content
                style={{
                  position: 'fixed',
                  bottom: '80px',
                  right: '1.5rem',
                  backgroundColor: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  width: '320px',
                  zIndex: 61,
                }}
                onCloseAutoFocus={() => manageButtonRef.current?.focus()}
              >
                <Dialog.Title style={{ color: 'var(--od-white)', marginBottom: '1rem' }}>
                  Cookie Preferences
                </Dialog.Title>

                {/* Essential — always on */}
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'var(--od-white)', margin: 0, fontSize: '0.875rem' }}>Essential</p>
                    <p style={{ color: 'var(--od-muted)', margin: 0, fontSize: '0.75rem' }}>Always active</p>
                  </div>
                  <span style={{ color: 'var(--od-muted)', fontSize: '0.75rem' }}>Required</span>
                </div>

                {/* Analytics */}
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="consent-analytics" style={{ color: 'var(--od-white)', fontSize: '0.875rem' }}>
                    Analytics
                  </label>
                  <input
                    id="consent-analytics"
                    type="checkbox"
                    checked={analyticsChecked}
                    onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  />
                </div>

                {/* Marketing */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="consent-marketing" style={{ color: 'var(--od-white)', fontSize: '0.875rem' }}>
                    Marketing
                  </label>
                  <input
                    id="consent-marketing"
                    type="checkbox"
                    checked={marketingChecked}
                    onChange={(e) => setMarketingChecked(e.target.checked)}
                  />
                </div>

                <button
                  onClick={handleSavePreferences}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--od-gold)',
                    color: 'var(--od-dark)',
                    border: 'none',
                    padding: '0.625rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Save preferences
                </button>
                <Dialog.Close asChild>
                  <button
                    aria-label="Close cookie preferences"
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--od-muted)',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <button
            onClick={acceptAll}
            style={{
              backgroundColor: 'var(--od-gold)',
              color: 'var(--od-dark)',
              border: 'none',
              padding: '0.375rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </>
  );
}
