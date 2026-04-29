/**
 * Smoothly scroll to an in-page anchor and refresh the URL hash.
 *
 * Why this helper exists: when a visitor clicks <a href="#foo"> a second
 * time without changing the URL hash in between (e.g. they scroll up after
 * the first click and click the same CTA again), browsers no-op the default
 * scroll because the hash already matches. This helper bypasses that by
 * calling scrollIntoView() explicitly so the second click works the same as
 * the first.
 *
 * Returns `true` if a target element was found and a scroll was attempted —
 * so callers can preventDefault() to avoid the (usually-no-op) native handler
 * doing anything inconsistent on top of ours. Returns `false` when there's
 * no matching element so callers can fall back to native behaviour.
 *
 * Respects:
 *   • `scroll-margin-top` on the target (e.g. QuoteSection's 80px nav offset)
 *   • Targets that don't implement scrollIntoView (jsdom in tests)
 *
 * Updates the hash via history.replaceState so the URL stays in sync without
 * piling up history entries when a visitor mashes the same CTA repeatedly.
 */
export function smoothScrollToHash(href: string): boolean {
  if (typeof document === 'undefined') return false;
  if (typeof href !== 'string' || !href.startsWith('#') || href.length < 2) {
    return false;
  }
  let id: string;
  try {
    id = decodeURIComponent(href.slice(1));
  } catch {
    id = href.slice(1);
  }
  const el = document.getElementById(id);
  if (!el) return false;

  if (typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (typeof window !== 'undefined' && window.history?.replaceState) {
    try {
      window.history.replaceState(null, '', href);
    } catch {
      /* defensive — some sandboxes block history mutation */
    }
  }

  return true;
}
