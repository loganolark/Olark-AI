export type TierSignal = 'essentials' | 'lead_gen' | 'commercial';

export type QuizStep = number;

export interface QuizState {
  currentStep: number;
  answers: Record<string, string>;
  emailCaptured: boolean;
  sessionId: string;
  startedAt: string;
}
