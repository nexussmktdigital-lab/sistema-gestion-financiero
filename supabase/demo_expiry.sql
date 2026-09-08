-- ============================================================
-- Expiración AUTOMÁTICA de la cuenta demo (backstop server-side)
--
-- Esto es lo que garantiza que, aunque el cliente copie el sitio
-- o se guarde las credenciales, la cuenta deje de existir del lado
-- del servidor cuando vence. Sin esto, una expiración solo en el
-- navegador sería fácil de saltear.
--
-- Cómo aplicarlo (1 sola vez):
--   1. Supabase → Database → Extensions → habilitar "pg_cron".
--   2. Supabase → SQL Editor → pegar TODO este archivo → Run.
--
-- La cuenta demo se identifica por app_metadata.role = 'demo' y se
-- borra cuando app_metadata.demo_expires_at < now() (ambos los setea
-- el script scripts/demo.mjs al crear la demo).
-- ============================================================

-- Por las dudas, si no se habilitó desde el panel:
create extension if not exists pg_cron;

-- Función que elimina cuentas demo vencidas (y sus datos, por CASCADE).
create or replace function public.expire_demo_users()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users
   where raw_app_meta_data->>'role' = 'demo'
     and (raw_app_meta_data->>'demo_expires_at') is not null
     and (raw_app_meta_data->>'demo_expires_at')::timestamptz < now();
end;
$$;

-- Programa la limpieza cada 15 minutos.
-- (unschedule previo por si se corre el script más de una vez)
select cron.unschedule('expire-demo-users')
 where exists (select 1 from cron.job where jobname = 'expire-demo-users');

select cron.schedule(
  'expire-demo-users',
  '*/15 * * * *',
  $$ select public.expire_demo_users(); $$
);

-- ── Utilidades manuales (opcionales) ─────────────────────────────────
--  Forzar la limpieza ahora:        select public.expire_demo_users();
--  Ver el job programado:           select * from cron.job;
--  Cancelar la expiración automática: select cron.unschedule('expire-demo-users');
