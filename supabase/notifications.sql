-- Run this in Supabase SQL Editor after deploying the edge function.
-- It creates HTTP webhooks for new consultancy requests and new orders.

-- Requires pg_net (available on Supabase by default for HTTP webhooks).
create extension if not exists pg_net;

-- Trigger functions
create or replace function public.notify_admin_consultancy_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://YOUR_PROJECT_REF.functions.supabase.co/notify-admin-on-new-record',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.settings.admin_webhook_secret', true)
    ),
    body := jsonb_build_object(
      'type', 'insert',
      'table', 'consultancy_requests',
      'record', row_to_json(new)
    )
  );
  return new;
end;
$$;

create or replace function public.notify_admin_order_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://YOUR_PROJECT_REF.functions.supabase.co/notify-admin-on-new-record',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.settings.admin_webhook_secret', true)
    ),
    body := jsonb_build_object(
      'type', 'insert',
      'table', 'orders',
      'record', row_to_json(new)
    )
  );
  return new;
end;
$$;

-- Triggers
drop trigger if exists trg_notify_admin_consultancy_insert on public.consultancy_requests;
create trigger trg_notify_admin_consultancy_insert
after insert on public.consultancy_requests
for each row execute function public.notify_admin_consultancy_insert();

drop trigger if exists trg_notify_admin_order_insert on public.orders;
create trigger trg_notify_admin_order_insert
after insert on public.orders
for each row execute function public.notify_admin_order_insert();

-- Store the webhook secret in the database settings (optional but recommended).
-- Run this once with your actual secret value:
-- alter database postgres set app.settings.admin_webhook_secret = 'your_webhook_secret';
