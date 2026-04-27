import * as Sentry from '@sentry/nextjs';
import { aidenChat } from '@/lib/aiden';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sessionId?: string; message?: string };
    if (!body.sessionId || !body.message) {
      return Response.json(
        {
          data: null,
          error: { message: 'sessionId and message are required', code: 'INVALID_REQUEST' },
        },
        { status: 400 },
      );
    }
    const upstream = await aidenChat(body.sessionId, body.message);
    // Forward streaming body if available
    if (upstream.body) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('Content-Type') ?? 'text/event-stream',
        },
      });
    }
    // Degrade to JSON if no stream
    const data = (await upstream.json()) as unknown;
    return Response.json({ data, error: null });
  } catch (err) {
    console.error('[api/aiden/chat]', err);
    Sentry.captureException(err);
    return Response.json(
      { data: null, error: { message: 'Internal error', code: 'SERVER_ERROR' } },
      { status: 500 },
    );
  }
}
