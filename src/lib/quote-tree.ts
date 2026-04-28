import type { Plan, QuizTier, QuoteQuestion, QuoteState } from '@/types/quote';

export const RESULT = 'RESULT' as const;
export type NextStep = QuoteQuestion | typeof RESULT;

export function firstQuestion(): QuoteQuestion {
  return {
    id: 'company',
    type: 'text',
    step: 'Getting Started',
    text: 'What is your company name?',
    placeholder: 'e.g. Olark',
  };
}

const SEATS_QUESTION: QuoteQuestion = {
  id: 'seats',
  type: 'number',
  text: 'How many user seats will you need?',
};

export function nextQuestion(
  tier: QuizTier,
  qId: string,
  value: string,
  state: QuoteState,
): NextStep {
  if (tier === 'essentials') return nextEssentials(qId);
  if (tier === 'advanced') return nextAdvanced(qId, value, state);
  return nextCommercial(qId, value, state);
}

function nextEssentials(qId: string): NextStep {
  if (qId === 'company') return SEATS_QUESTION;
  return RESULT;
}

function nextAdvanced(qId: string, value: string, state: QuoteState): NextStep {
  if (qId === 'company') {
    return {
      id: 'use_case',
      type: 'options',
      text: 'What will you primarily use Aiden for?',
      options: [
        { value: 'lead_gen', label: 'Lead Generation' },
        { value: 'lead_support', label: 'Lead Generation + Customer Support' },
      ],
    };
  }
  if (qId === 'use_case') {
    if (value === 'lead_support') {
      state.track = 'pro';
      return SEATS_QUESTION;
    }
    return {
      id: 'multi_team',
      type: 'options',
      text: 'Do you have multiple sales teams?',
      options: [
        { value: 'single', label: 'Single team' },
        { value: 'multiple', label: 'Multiple teams' },
      ],
    };
  }
  if (qId === 'multi_team') {
    state.track = value === 'multiple' ? 'pro' : 'advanced';
    return SEATS_QUESTION;
  }
  return RESULT;
}

function nextCommercial(qId: string, value: string, state: QuoteState): NextStep {
  if (qId === 'company') {
    return {
      id: 'crm',
      type: 'options',
      text: 'Which CRM will you be integrating with?',
      options: [
        { value: 'salesforce', label: 'Salesforce' },
        { value: 'hubspot', label: 'HubSpot' },
        { value: 'other', label: 'Other' },
      ],
    };
  }
  if (qId === 'crm') {
    if (value === 'other') {
      state.track = 'bespoke';
      return {
        id: 'crm_name',
        type: 'text',
        text: 'Which CRM are you using?',
        placeholder: 'e.g. Zoho, Dynamics, Pipedrive…',
      };
    }
    state.track = 'signature';
    return TERRITORIAL_QUESTION;
  }
  if (qId === 'crm_name') {
    return TERRITORIAL_QUESTION;
  }
  if (qId === 'territorial') {
    if (value === 'yes') state.track = 'bespoke';
    if (state.track === 'bespoke') {
      return {
        id: 'other_integrations',
        type: 'text-optional',
        text: 'Do you need any additional integrations beyond your CRM?',
        placeholder: 'e.g. Zendesk, Slack (leave blank if none)',
      };
    }
    return SEATS_QUESTION;
  }
  if (qId === 'other_integrations') {
    return SEATS_QUESTION;
  }
  return RESULT;
}

const TERRITORIAL_QUESTION: QuoteQuestion = {
  id: 'territorial',
  type: 'options',
  text:
    'Will you need territorial routing (directing chats to specific regional teams based on geography)?',
  options: [
    { value: 'yes', label: 'Yes, we have regional teams' },
    { value: 'no', label: 'No, single team or no regional routing' },
  ],
};

export function getPlan(tier: QuizTier, state: QuoteState): Plan {
  if (tier === 'essentials') return 'essentials';
  if (tier === 'advanced') return state.track === 'pro' ? 'pro' : 'advanced';
  // commercial
  return state.track === 'bespoke' ? 'bespoke' : 'signature';
}
