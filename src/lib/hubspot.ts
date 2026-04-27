import { Client } from '@hubspot/api-client';

let _client: Client | null = null;

export function getHubSpotClient(): Client {
  if (!_client) {
    _client = new Client({ accessToken: process.env.HUBSPOT_API_KEY ?? '' });
  }
  return _client;
}
