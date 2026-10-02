import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { handlePinLogin } from './functions/vendor-pin-login/handler.mjs';

const outletId = 'a0000000-0000-4000-8000-000000000009';
const settings = { url: 'https://backend.example', serviceKey: 'server-secret' };
const request = body => new Request(`${settings.url}/login`, { method: 'POST', body: JSON.stringify(body) });
const deniedFetch = () => { throw new Error('Validation must run before any backend request'); };
assert.equal((await handlePinLogin(new Request(settings.url), settings, deniedFetch)).status, 405);
assert.equal((await handlePinLogin(new Request(settings.url, { method: 'OPTIONS' }), settings, deniedFetch)).status, 204);
for (const pin of ['', '123', '12345', 'abcd', 1234, null]) {
  assert.equal((await handlePinLogin(request({ outletId, pin }), settings, deniedFetch)).status, 400);
}
assert.equal((await handlePinLogin(request({ outletId: 'invalid', pin: '0123' }), settings, deniedFetch)).status, 400);
assert.equal((await handlePinLogin(new Request(settings.url, { method: 'POST', body: '{' }), settings, deniedFetch)).status, 400);
assert.equal((await handlePinLogin(new Request(settings.url, { method: 'POST', body: 'x'.repeat(1025) }), settings, deniedFetch)).status, 413);
let calls = 0;
const valid = await handlePinLogin(request({ outletId, pin: '0123' }), settings, async (url, options) => {
  calls++;
  assert.equal(options.headers.apikey, settings.serviceKey);
  if (url.endsWith('/verify_vendor_pin')) {
    assert.deepEqual(JSON.parse(options.body), { p_outlet_id: outletId, p_pin: '0123' });
    return Response.json({ ok: true, email: 'cafe@example.com', userId: 'owner-id' });
  }
  assert.deepEqual(JSON.parse(options.body), { type: 'magiclink', email: 'cafe@example.com' });
  return Response.json({ id: 'owner-id', hashed_token: 'one-use-token', email: 'cafe@example.com' });
});
assert.equal(valid.status, 200);
assert.deepEqual(await valid.json(), { token_hash: 'one-use-token' });
assert.equal(valid.headers.get('Cache-Control'), 'no-store');
assert.equal(calls, 2);
for (const [result, status] of [[{ ok: false }, 401], [{ ok: false, retrySeconds: 900 }, 429]]) {
  const response = await handlePinLogin(request({ outletId, pin: '0123' }), settings, async url => {
    assert.ok(url.endsWith('/verify_vendor_pin'));
    return Response.json(result);
  });
  assert.equal(response.status, status);
  if (status === 429) assert.equal((await response.json()).retrySeconds, 900);
}
let step = 0;
const mismatch = await handlePinLogin(request({ outletId, pin: '0123' }), settings, async () => Response.json(++step === 1
  ? { ok: true, email: 'cafe@example.com', userId: 'correct-owner' }
  : { id: 'wrong-owner', hashed_token: 'must-not-escape' }));
assert.equal(mismatch.status, 503);
assert.equal((await mismatch.json()).token_hash, undefined);
assert.equal((await handlePinLogin(request({ outletId, pin: '0123' }), settings, async () => { throw new Error('offline'); })).status, 503);
console.log('PASS: handler validation, leading zeros, single-use token, ownership check, lockout response, and connection failure.');

if (process.argv.includes('--live')) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  assert.ok(url && serviceKey && anonKey, 'Set server and public Supabase environment variables.');
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const pins = JSON.parse(await readFile(new URL('./vendor-pins.local', import.meta.url), 'utf8'));
  const publicClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const forbidden = await publicClient.rpc('verify_vendor_pin', { p_outlet_id: outletId, p_pin: '0123' });
  assert.ok(forbidden.error, 'Public callers must not invoke the PIN verifier directly.');
  for (const cafe of pins) {
    const response = await fetch(`${url}/functions/v1/vendor-pin-login`, { method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ outletId: cafe.id, pin: cafe.pin }) });
    assert.equal(response.status, 200, `${cafe.name}: PIN login failed`);
    const { token_hash } = await response.json();
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const verified = await client.auth.verifyOtp({ token_hash, type: 'email' });
    assert.equal(verified.error, null, `${cafe.name}: token exchange failed`);
    const own = await client.from('vendors').select('id,name,is_online').eq('owner_id', verified.data.user.id).single();
    assert.equal(own.data?.id, cafe.id, `${cafe.name}: incorrect cafe ownership`);
    const other = pins.find(entry => entry.id !== cafe.id);
    const denied = await client.from('vendors').update({ is_online: false }).eq('id', other.id).select('id');
    assert.deepEqual(denied.data, [], `${cafe.name}: write to another cafe was allowed`);
    const replay = await publicClient.auth.verifyOtp({ token_hash, type: 'email' });
    assert.ok(replay.error, 'Login token must be single-use.');
    await client.auth.signOut();
    console.log(`PASS: ${cafe.name} login, token replay denial, and cafe isolation.`);
  }
  const cafe = pins.find(entry => entry.id === outletId);
  const owner = await admin.from('vendors').select('owner_id').eq('id', outletId).single();
  const reset = async pin => {
    const result = await admin.rpc('provision_vendor_pin', { p_outlet_id: outletId, p_user_id: owner.data.owner_id, p_pin: pin });
    assert.equal(result.error, null, 'Could not restore test cafe credentials.');
  };
  try {
    await reset('0123');
    const zeroPin = await admin.rpc('verify_vendor_pin', { p_outlet_id: outletId, p_pin: '0123' });
    assert.equal(zeroPin.data?.ok, true, 'Leading-zero PIN must work in the database.');
    const attempts = await Promise.all(Array.from({ length: 7 }, () => admin.rpc('verify_vendor_pin', { p_outlet_id: outletId, p_pin: '9999' })));
    assert.ok(attempts.every(result => !result.error && result.data.ok === false));
    assert.equal(attempts.filter(result => result.data.retrySeconds > 0).length, 3, 'Concurrent failures must lock after exactly five attempts.');
    const locked = await admin.rpc('verify_vendor_pin', { p_outlet_id: outletId, p_pin: '0123' });
    assert.ok(locked.data.retrySeconds > 0, 'Even a correct PIN must obey lockout.');
    console.log('PASS: database leading zeros and atomic lockout under concurrent attempts.');
  } finally { await reset(cafe.pin); }
}
