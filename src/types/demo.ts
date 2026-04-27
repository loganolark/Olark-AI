export type DemoStatus = 'idle' | 'submitting' | 'training' | 'fallback' | 'ready' | 'active';

export interface TrainingLine {
  text: string;
  visible: boolean;
  active: boolean;
}

export interface URLDemoWidgetProps {
  onDemoComplete?: (sessionId: string) => void;
  onUnlockMore?: () => void;
  apiEndpoint?: string;
}
