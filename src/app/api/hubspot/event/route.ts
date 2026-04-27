import * as Sentry from '@sentry/nextjs';
import { getHubSpotClient } from '@/lib/hubspot';
import type { HubSpotEventPayload } from '@/types/hubspot';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HubSpotEventPayload;
    if (!body.eventName || !body.email) {
      return Response.json(
        {
          data: null,
          error: { message: 'eventName and email are required', code: 'INVALID_REQUEST' },
        },
        { status: 400 },
      );
    }
    const client = getHubSpotClient();
    await client.events.send.basicApi.send({
      eventName: body.eventName,
      email: body.email,
      properties: body.properties,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
    });
    const eventId = crypto.randomUUID();
    return Response.json({ data: { eventId }, error: null });
  } catch (err) {
    console.error('[api/hubspot/event]', err);
    Sentry.captureException(err);
    return Response.json(
      { data: null, error: { message: 'Internal error', code: 'SERVER_ERROR' } },
      { status: 500 },
    );
  }
}
