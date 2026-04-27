import * as Sentry from '@sentry/nextjs';
import { getHubSpotClient } from '@/lib/hubspot';
import type { HubSpotContactPayload } from '@/types/hubspot';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HubSpotContactPayload;
    if (!body.email) {
      return Response.json(
        { data: null, error: { message: 'email is required', code: 'INVALID_REQUEST' } },
        { status: 400 },
      );
    }
    const { email, ...rest } = body;
    const properties: Record<string, string> = { email };
    for (const [key, val] of Object.entries(rest)) {
      if (val !== undefined && val !== null) {
        properties[key] = String(val);
      }
    }
    const client = getHubSpotClient();
    const result = await client.crm.contacts.batchApi.upsert({
      inputs: [{ id: email, idProperty: 'email', properties }],
    });
    const contactId = result.results[0]?.id ?? '';
    return Response.json({ data: { contactId }, error: null });
  } catch (err) {
    console.error('[api/hubspot/contact]', err);
    Sentry.captureException(err);
    return Response.json(
      { data: null, error: { message: 'Internal error', code: 'SERVER_ERROR' } },
      { status: 500 },
    );
  }
}
