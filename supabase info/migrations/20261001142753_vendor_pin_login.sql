begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.vendor_pins (
  outlet_id uuid primary key references public.vendors(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  pin_hash text not null,
  failures integer not null default 0 check (failures between 0 and 5),
  window_started_at timestamptz not null default now()
);
alter table private.vendor_pins enable row level security;
revoke all on private.vendor_pins from public, anon, authenticated;
grant select, insert, update on private.vendor_pins to service_role;
-- The server already administers Auth through its API; limit SQL lookup to identity columns.
grant usage on schema auth to service_role;
grant select (id, email) on auth.users to service_role;

-- Invoker rights: only the Edge Function's service role can read PIN hashes.
create or replace function public.verify_vendor_pin(p_outlet_id uuid, p_pin text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  credential private.vendor_pins%rowtype;
  account_email text;
  checked_at timestamptz;
begin
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    return jsonb_build_object('ok', false);
  end if;
  -- ponytail: one lock per cafe; add per-source limits if cafe-wide lockout becomes disruptive.
  select * into credential from private.vendor_pins where outlet_id = p_outlet_id for update;
  if not found then return jsonb_build_object('ok', false); end if;
  checked_at := clock_timestamp();
  if checked_at >= credential.window_started_at + interval '15 minutes' then
    credential.failures := 0;
    credential.window_started_at := checked_at;
  end if;
  if credential.failures >= 5 then
    return jsonb_build_object('ok', false, 'retrySeconds', greatest(1, ceil(extract(epoch from credential.window_started_at + interval '15 minutes' - checked_at))::integer));
  end if;
  if extensions.crypt(p_pin, credential.pin_hash) <> credential.pin_hash then
    credential.failures := credential.failures + 1;
    if credential.failures = 5 then credential.window_started_at := checked_at; end if;
    update private.vendor_pins set failures = credential.failures, window_started_at = credential.window_started_at where outlet_id = p_outlet_id;
    return jsonb_build_object('ok', false, 'retrySeconds', case when credential.failures = 5 then 900 else 0 end);
  end if;
  select u.email into account_email from auth.users u join public.vendors v on v.owner_id = u.id
    where v.id = p_outlet_id and u.id = credential.user_id and v.is_active = true;
  if account_email is null then return jsonb_build_object('ok', false); end if;
  update private.vendor_pins set failures = 0, window_started_at = checked_at where outlet_id = p_outlet_id;
  return jsonb_build_object('ok', true, 'email', account_email, 'userId', credential.user_id);
end;
$$;
revoke all on function public.verify_vendor_pin(uuid, text) from public, anon, authenticated;
grant execute on function public.verify_vendor_pin(uuid, text) to service_role;

-- Provision via the Admin API first, then link only unowned or known legacy rows.
create or replace function public.provision_vendor_pin(p_outlet_id uuid, p_user_id uuid, p_pin text)
returns void language plpgsql security invoker set search_path = '' as $$
declare current_owner uuid;
begin
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then raise exception 'PIN must have four digits'; end if;
  select owner_id into current_owner from public.vendors where id = p_outlet_id for update;
  if not found then raise exception 'Unknown outlet'; end if;
  if current_owner is not null and current_owner <> p_user_id and not exists (
    select 1 from auth.users where id = current_owner and email = 'vendor@yememunnai.app'
  ) then raise exception 'Outlet already belongs to another account'; end if;
  update public.vendors set owner_id = p_user_id where id = p_outlet_id;
  insert into private.vendor_pins(outlet_id, user_id, pin_hash)
    values(p_outlet_id, p_user_id, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)))
    on conflict(outlet_id) do update set user_id = excluded.user_id, pin_hash = excluded.pin_hash, failures = 0, window_started_at = now();
end;
$$;
revoke all on function public.provision_vendor_pin(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.provision_vendor_pin(uuid, uuid, text) to service_role;
commit;
