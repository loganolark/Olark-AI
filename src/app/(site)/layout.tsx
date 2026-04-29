import SiteNav from '@/components/layout/SiteNav';
import ConsentSpacer from '@/components/layout/ConsentSpacer';
import { VideoLightboxProvider } from '@/components/ui/VideoLightbox';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <VideoLightboxProvider>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '1rem',
          zIndex: 100,
          backgroundColor: 'var(--od-gold)',
          color: 'var(--od-ink)',
          fontWeight: 700,
          padding: '0.5rem 1rem',
          borderRadius: '100px',
          textDecoration: 'none',
          fontSize: '0.875rem',
          transition: 'top 0.1s',
        }}
        className="skip-link"
      >
        Skip to main content
      </a>
      <SiteNav />
      <main id="main-content">
        {children}
      </main>
      <ConsentSpacer />
      <footer style={{ padding: '2rem 1.5rem', borderTop: '1px solid var(--od-border)' }}>
        <a
          href="/privacy"
          style={{ color: 'var(--od-muted)', fontSize: '0.875rem', textDecoration: 'none' }}
        >
          Privacy Policy
        </a>
      </footer>
    </VideoLightboxProvider>
  );
}
