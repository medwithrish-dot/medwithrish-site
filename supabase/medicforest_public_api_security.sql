-- Apply in the Supabase SQL Editor as postgres BEFORE deploying the matching code.
-- No existing account, billing, credit or interview rows are modified.
begin;

create table if not exists public.public_api_quotas (
  scope text not null check (scope in ('feedback', 'tutoring-checkout')),
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  used integer not null default 0,
  resets_at timestamptz not null,
  primary key (scope, key_hash)
);
create index if not exists public_api_quotas_expiry on public.public_api_quotas(resets_at);
alter table public.public_api_quotas enable row level security;
revoke all on public.public_api_quotas from public, anon, authenticated;
grant all on public.public_api_quotas to service_role;

create or replace function public.consume_public_api_quota(p_scope text, p_key text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_limit integer;
  v_row public.public_api_quotas;
begin
  v_limit := case p_scope when 'feedback' then 3 when 'tutoring-checkout' then 20 else null end;
  if v_limit is null or p_key is null or p_key !~ '^[0-9a-f]{64}$' then raise exception 'Invalid quota'; end if;
  -- Bounded cleanup keeps IP fingerprints from accumulating indefinitely.
  delete from public.public_api_quotas where resets_at <= v_now and (scope, key_hash) in (
    select scope, key_hash from public.public_api_quotas where resets_at <= v_now order by resets_at limit 200
  );
  insert into public.public_api_quotas(scope, key_hash, used, resets_at)
    values (p_scope, p_key, 0, v_now + interval '1 hour') on conflict do nothing;
  select * into v_row from public.public_api_quotas where scope = p_scope and key_hash = p_key for update;
  if v_row.resets_at <= v_now then
    v_row.used := 0;
    v_row.resets_at := v_now + interval '1 hour';
  end if;
  if v_row.used >= v_limit then
    return jsonb_build_object('allowed', false, 'retry_after', greatest(1, ceil(extract(epoch from v_row.resets_at - v_now))::integer));
  end if;
  update public.public_api_quotas set used = v_row.used + 1, resets_at = v_row.resets_at where scope = p_scope and key_hash = p_key;
  return jsonb_build_object('allowed', true);
end;
$$;
revoke all on function public.consume_public_api_quota(text,text) from public, anon, authenticated;
grant execute on function public.consume_public_api_quota(text,text) to service_role;

create table if not exists public.stripe_webhook_receipts (
  event_id text primary key,
  claim_token uuid not null,
  lease_until timestamptz not null,
  completed_at timestamptz
);
alter table public.stripe_webhook_receipts enable row level security;
revoke all on public.stripe_webhook_receipts from public, anon, authenticated;
grant all on public.stripe_webhook_receipts to service_role;

create or replace function public.claim_stripe_webhook(p_event text, p_token uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_row public.stripe_webhook_receipts; v_now timestamptz := clock_timestamp();
begin
  if p_event is null or length(p_event) > 255 or p_event !~ '^evt_[a-zA-Z0-9_]+$' or p_token is null then raise exception 'Invalid event'; end if;
  insert into public.stripe_webhook_receipts(event_id,claim_token,lease_until)
    values(p_event,p_token,v_now + interval '5 minutes') on conflict do nothing;
  select * into v_row from public.stripe_webhook_receipts where event_id = p_event for update;
  if v_row.completed_at is not null then return 'completed'; end if;
  if v_row.claim_token = p_token then return 'claimed'; end if;
  if v_row.lease_until > v_now then return 'busy'; end if;
  update public.stripe_webhook_receipts set claim_token = p_token, lease_until = v_now + interval '5 minutes' where event_id = p_event;
  return 'claimed';
end;
$$;

create or replace function public.finish_stripe_webhook(p_event text, p_token uuid, p_success boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.stripe_webhook_receipts
    set completed_at = case when p_success then clock_timestamp() else null end,
        lease_until = clock_timestamp()
    where event_id = p_event and claim_token = p_token and completed_at is null;
  return found;
end;
$$;
revoke all on function public.claim_stripe_webhook(text,uuid), public.finish_stripe_webhook(text,uuid,boolean) from public, anon, authenticated;
grant execute on function public.claim_stripe_webhook(text,uuid), public.finish_stripe_webhook(text,uuid,boolean) to service_role;

commit;
