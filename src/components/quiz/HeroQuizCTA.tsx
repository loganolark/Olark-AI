'use client';

import React from 'react';
import CTAButton from '@/components/ui/CTAButton';
import { QUIZ_START_EVENT } from './HomepageQuizBlock';

/** Hero "Take the 60-Second Quiz" button. Lives in a client wrapper so it
 *  can fire the global quiz-start event in addition to the standard
 *  href="#quiz" scroll. The HomepageQuizBlock client component listens for
 *  the event and swaps its placeholder for the live PathFinderQuiz when
 *  the visitor lands on the section. */
export default function HeroQuizCTA() {
  function handleClick() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(QUIZ_START_EVENT));
  }

  return (
    <CTAButton variant="secondary" size="lg" href="#quiz" onClick={handleClick}>
      Take the 60-Second Quiz →
    </CTAButton>
  );
}
