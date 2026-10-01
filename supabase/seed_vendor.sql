INSERT INTO auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
SELECT
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'vendor@yememunnai.app',
  crypt('yememunnai123', gen_salt('bf')),
  now(), now(), now(), 
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'vendor@yememunnai.app'
);

INSERT INTO auth.identities (
  user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
)
SELECT
  u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
FROM auth.users 
WHERE u.email = 'vendor@yememunnai.app'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
  );
