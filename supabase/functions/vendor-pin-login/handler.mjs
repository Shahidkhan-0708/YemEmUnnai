const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};

/** fetch is injectable so the same deployed handler can be checked without live credentials. */
export async function handlePinLogin(request, { url, serviceKey }, fetcher = fetch) {
  const reply = (status, body) => Response.json(body, { status, headers: cors });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return reply(405, { error: 'Use POST.' });
  if (!url || !serviceKey) return reply(503, { error: 'Business portal is unavailable.' });
  try {
    const text = await request.text();
    if (text.length > 1024) return reply(413, { error: 'Request is too large.' });
    let body;
    try { body = JSON.parse(text); } catch { return reply(400, { error: 'Invalid request.' }); }
    const { outletId, pin } = body ?? {};
    if (typeof outletId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(outletId)
      || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) return reply(400, { error: 'Select a cafe and enter four digits.' });
    const headers = { apikey: serviceKey, 'Content-Type': 'application/json' };
    // Opaque secret keys authenticate on apikey; only legacy keys are JWTs.
    if (serviceKey.startsWith('eyJ')) headers.Authorization = `Bearer ${serviceKey}`;
    const verified = await fetcher(`${url}/rest/v1/rpc/verify_vendor_pin`, {
      method: 'POST', headers, body: JSON.stringify({ p_outlet_id: outletId, p_pin: pin }), signal: AbortSignal.timeout(10000),
    });
    if (!verified.ok) return reply(503, { error: 'Business portal is unavailable. Please try again.' });
    const result = await verified.json();
    if (!result.ok) return reply(result.retrySeconds > 0 ? 429 : 401, {
      error: result.retrySeconds > 0 ? 'Too many attempts. Please wait before trying again.' : 'The cafe or PIN is incorrect.',
      ...(result.retrySeconds > 0 ? { retrySeconds: result.retrySeconds } : {}),
    });
    const generated = await fetcher(`${url}/auth/v1/admin/generate_link`, {
      method: 'POST', headers, body: JSON.stringify({ type: 'magiclink', email: result.email }), signal: AbortSignal.timeout(10000),
    });
    if (!generated.ok) return reply(503, { error: 'Unable to sign in. Please try again.' });
    const link = await generated.json();
    if (link.id !== result.userId || typeof link.hashed_token !== 'string') return reply(503, { error: 'Unable to sign in. Please contact support.' });
    return reply(200, { token_hash: link.hashed_token });
  } catch {
    return reply(503, { error: 'Unable to connect. Please try again.' });
  }
}
