import { handlePinLogin } from './handler.mjs';

Deno.serve((request: Request) => handlePinLogin(request, {
  url: Deno.env.get('SUPABASE_URL'),
  serviceKey: JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}')['default'],
}));
