import * as Sentry from '@sentry/nextjs';
import { aidenTrain } from '@/lib/aiden';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    if (!body.url) {
      return Response.json(
        { data: null, error: { message: 'url is required', code: 'INVALID_REQUEST' } },
        { status: 400 },
      );
    }
    const result = await aidenTrain(body.url);
    return Response.json({ data: result, error: null });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[api/aiden/train]', err);
      return Response.json(
        { data: null, error: { message: 'Training timed out', code: 'AIDEN_TIMEOUT' } },
        { status: 429 },
      );
    }
    console.error('[api/aiden/train]', err);
    Sentry.captureException(err);
    return Response.json(
      { data: null, error: { message: 'Internal error', code: 'SERVER_ERROR' } },
      { status: 500 },
    );
  }
}
