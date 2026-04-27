'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { ConsentState } from '@/types/hubspot';

const CONSENT_COOKIE = 'olark_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface ConsentContextValue {
  consent: ConsentState;
  hasInteracted: boolean;
  acceptAll: () => void;
  updateConsent: (state: ConsentState) => void;
}

const defaultConsent: ConsentState = { analytics: false, marketing: false };

const ConsentContext = createContext<ConsentContextValue>({
  consent: defaultConsent,
  hasInteracted: false,
  acceptAll: () => {},
  updateConsent: () => {},
});

function readConsentCookie(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=')[1])) as ConsentState;
  } catch {
    return null;
  }
}

function writeConsentCookie(state: ConsentState): void {
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${CONSENT_COOKIE}=${value}; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Hydration from cookie requires post-mount; SSR cannot read browser cookies
    // for the client component tree. Two batched setState calls = one re-render.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = readConsentCookie();
    if (stored) {
      setConsent(stored);
      setHasInteracted(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const acceptAll = () => {
    const full: ConsentState = { analytics: true, marketing: true };
    writeConsentCookie(full);
    setConsent(full);
    setHasInteracted(true);
  };

  const updateConsent = (state: ConsentState) => {
    writeConsentCookie(state);
    setConsent(state);
    setHasInteracted(true);
  };

  return (
    <ConsentContext.Provider value={{ consent, hasInteracted, acceptAll, updateConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  return useContext(ConsentContext);
}
