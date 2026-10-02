# Vendor PIN login

The public function verifies a four-digit PIN through a service-role-only RPC,
then issues a single-use Supabase Auth token. The client exchanges the token
and resolves the account's cafe through the existing ownership policies.

1. Apply the `vendor_pin_login` migration to the linked project.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in a private server environment file. Use the modern default secret key as the latter value; the variable name is retained for the administration scripts. The deployed function reads the default key from Supabase's injected `SUPABASE_SECRET_KEYS` environment value.
3. Run `node --env-file=supabase/.env.server.local supabase/setup_vendor_auth.mjs`.
   Generated PINs are saved in `supabase/vendor-pins.local`, which must remain private.
4. Deploy `vendor-pin-login` with JWT verification disabled. PIN verification is its authentication.
5. Run `node supabase/test_vendor_pin.mjs`. For integration checks, add
   `--env-file=.env.local --env-file=supabase/.env.server.local` before the script and `--live` after it.

The integration check briefly exercises lockout on New Cafe and restores its
original PIN/counters in `finally`; run it during initial setup or maintenance.
It also verifies cafe ownership and denied writes to another cafe.

PIN hashes live in the unexposed `private` schema. Five failed attempts lock a
cafe for 15 minutes, including attempts from different browsers. Only the server
can configure/reset PINs. To rotate a PIN, change its private local entry and
rerun provisioning. Administrative keys, PINs, and Auth tokens must never be logged.
