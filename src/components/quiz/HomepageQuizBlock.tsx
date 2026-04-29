'use client';

import { useEffect, useRef, useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import Reveal from '@/components/ui/Reveal';
import ParticleBackground from '@/components/ui/ParticleBackground';
import PathFinderQuiz from './PathFinderQuiz';
import QuizPlaceholder from './QuizPlaceholder';

/** Custom event name fired when any "Take the 60-Second Quiz" CTA on the
 *  homepage is clicked. Lets us decouple the hero's quiz button (which
 *  lives in a different React tree above) from the quiz's started-state. */
export const QUIZ_START_EVENT = 'aiden:start-quiz';

export default function HomepageQuizBlock() {
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const quizSectionRef = useRef<HTMLElement | null>(null);

  function startQuiz() {
    setQuizStarted(true);
    // Defer scroll one frame so PathFinderQuiz has rendered before we land
    // the viewport on it. RAF is more reliable than setTimeout(0) here.
    requestAnimationFrame(() => {
      const section = quizSectionRef.current;
      if (!section) return;
      if (typeof section.scrollIntoView === 'function') {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Listen for the global start-quiz event. The hero's "Take the 60-Second
  // Quiz" button dispatches it on click so we don't need cross-tree state.
  useEffect(() => {
    function onStart() {
      setQuizStarted(true);
    }
    window.addEventListener(QUIZ_START_EVENT, onStart);
    return () => window.removeEventListener(QUIZ_START_EVENT, onStart);
  }, []);

  return (
    <>
      {/* ─── Final CTA — comes BEFORE the quiz now ───────────────────────── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--od-dark)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid var(--od-border)',
        }}
      >
        <ParticleBackground density={40} />
        <Reveal style={{ position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              letterSpacing: '-0.025em',
              color: 'var(--od-white)',
              margin: '0 0 1rem',
            }}
          >
            Still Not Sure Which Tier Fits?
          </h2>
          <p
            style={{
              color: 'var(--od-muted)',
              marginBottom: '2.5rem',
              fontSize: '0.9375rem',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            A few quick questions about your team and we&rsquo;ll match you to
            the right tier. Sixty seconds, then you decide.
          </p>
          <CTAButton variant="primary" size="lg" onClick={startQuiz}>
            Take the 60-Second Quiz →
          </CTAButton>
        </Reveal>
      </section>

      {/* ─── Path Finder Quiz — placeholder until the visitor opts in ────── */}
      <section
        ref={quizSectionRef}
        id="quiz"
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--od-dark)',
          padding: '5rem 1.5rem',
        }}
      >
        <ParticleBackground density={50} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {quizStarted ? (
            <PathFinderQuiz />
          ) : (
            <QuizPlaceholder onStart={startQuiz} />
          )}
        </div>
      </section>
    </>
  );
}
