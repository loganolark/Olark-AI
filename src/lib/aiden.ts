export interface AidenTrainResponse {
  sessionId: string;
  status: string;
}

const TRAIN_TIMEOUT_MS = 10_000;

export async function aidenTrain(url: string): Promise<AidenTrainResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRAIN_TIMEOUT_MS);
  try {
    const res = await fetch(`${process.env.AIDEN_API_BASE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AIDEN_API_KEY ?? ''}`,
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Aiden train error: ${res.status}`);
    }
    return res.json() as Promise<AidenTrainResponse>;
  } finally {
    clearTimeout(timer);
  }
}

export async function aidenChat(
  sessionId: string,
  message: string,
): Promise<Response> {
  return fetch(`${process.env.AIDEN_API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AIDEN_API_KEY ?? ''}`,
    },
    body: JSON.stringify({ sessionId, message }),
  });
}
