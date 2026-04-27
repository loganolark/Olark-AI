export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

export interface HubSpotContactPayload {
  email: string;
  olark_company_size?: string;
  olark_use_case?: string;
  olark_tier_signal?: 'essentials' | 'lead_gen' | 'commercial';
  olark_inbound_volume?: string;
  olark_quiz_completed_at?: string;
  olark_demo_depth?: number;
  olark_demo_url?: string;
  olark_pages_visited?: string;
  olark_quiz_partial?: boolean;
}

export interface HubSpotEventPayload {
  eventName: string;
  email: string;
  properties?: Record<string, string>;
  occurredAt?: string;
}
