'use client';

import { useEffect, useRef, useState } from 'react';
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
    <section
      ref={quizSectionRef}
      id="quiz"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--od-dark)',
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--od-border)',
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
  );
}
