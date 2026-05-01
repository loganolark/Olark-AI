export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

export interface HubSpotContactPayload {
  email: string;
  olark_company_size?: string;
  olark_use_case?: string;
  /** Band-level tier signal — kept as the original 3-value HubSpot enum
   *  for back-compat with existing list segmentation. After the
   *  industrial-supplier pivot the homepage quiz always reports
   *  `commercial`; legacy callers still pass the same enum. */
  olark_tier_signal?: 'essentials' | 'lead_gen' | 'commercial';
  /** Plan-level recommendation from the homepage quiz. Add as a custom
   *  HubSpot property when the integration is set up to receive it;
   *  older HubSpot configurations safely ignore unknown fields. */
  olark_recommended_plan?: 'signature' | 'bespoke';
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
