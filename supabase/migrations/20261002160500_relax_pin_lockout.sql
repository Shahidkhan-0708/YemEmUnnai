-- Migration: Increase vendor PIN attempts to 10 and reduce lockout cooldown to 2 minutes
begin;

-- 1. Relax failure limit constraint to 10
alter table private.vendor_pins drop constraint if exists vendor_pins_failures_check;
alter table private.vendor_pins add constraint vendor_pins_failures_check check (failures between 0 and 10);

-- 2. Update verify_vendor_pin function with 10 attempts and 2-minute timer
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

  select * into credential from private.vendor_pins where outlet_id = p_outlet_id for update;
  if not found then return jsonb_build_object('ok', false); end if;
  checked_at := clock_timestamp();

  -- Reset failures after 2 minutes from window start
  if checked_at >= credential.window_started_at + interval '2 minutes' then
    credential.failures := 0;
    credential.window_started_at := checked_at;
  end if;

  -- Lockout if 10 consecutive failures reached within 2 minutes
  if credential.failures >= 10 then
    return jsonb_build_object('ok', false, 'retrySeconds', greatest(1, ceil(extract(epoch from credential.window_started_at + interval '2 minutes' - checked_at))::integer));
  end if;

  -- Incorrect PIN check
  if extensions.crypt(p_pin, credential.pin_hash) <> credential.pin_hash then
    credential.failures := credential.failures + 1;
    if credential.failures = 10 then credential.window_started_at := checked_at; end if;
    update private.vendor_pins set failures = credential.failures, window_started_at = credential.window_started_at where outlet_id = p_outlet_id;
    return jsonb_build_object('ok', false, 'retrySeconds', case when credential.failures = 10 then 120 else 0 end);
  end if;

  -- Verify owner linkage
  select u.email into account_email from auth.users u join public.vendors v on v.owner_id = u.id
    where v.id = p_outlet_id and u.id = credential.user_id and v.is_active = true;
  if account_email is null then return jsonb_build_object('ok', false); end if;

  -- Success: reset failures and timestamp
  update private.vendor_pins set failures = 0, window_started_at = checked_at where outlet_id = p_outlet_id;
  return jsonb_build_object('ok', true, 'email', account_email, 'userId', credential.user_id);
end;
$$;

-- Reset any currently locked cafe failures
update private.vendor_pins set failures = 0;

commit;
