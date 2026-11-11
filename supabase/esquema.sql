-- ¿Quién me debe? · Tabla del CRUD (Parte 2 del Deber 6)
-- Pégalo completo en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar más de una vez sin romper nada.

create table if not exists public.prestamos (
  id              uuid primary key default gen_random_uuid(),
  -- Dueño del registro: lo pone Postgres con el usuario de la sesión.
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  persona         text not null check (char_length(trim(persona)) between 1 and 60),
  tipo            text not null check (tipo in ('dinero', 'objeto')),
  monto           numeric(10, 2) check (monto is null or monto > 0),
  objeto          text check (objeto is null or char_length(objeto) <= 80),
  fecha_prestamo  date not null default current_date,
  fecha_limite    date,
  devuelto        boolean not null default false,
  devuelto_en     timestamptz,
  nota            text check (nota is null or char_length(nota) <= 200),
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  -- Un préstamo de dinero tiene monto; uno de objeto dice qué objeto.
  constraint prestamo_detalle check (
    (tipo = 'dinero' and monto is not null) or (tipo = 'objeto' and objeto is not null)
  ),
  constraint prestamo_fechas check (fecha_limite is null or fecha_limite >= fecha_prestamo)
);

create index if not exists prestamos_user_id_idx on public.prestamos (user_id);

-- actualizado_en se pone solo en cada UPDATE.
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists prestamos_actualizado_en on public.prestamos;
create trigger prestamos_actualizado_en
  before update on public.prestamos
  for each row execute function public.tocar_actualizado_en();

-- RLS: cada usuario solo ve y cambia SUS préstamos.
alter table public.prestamos enable row level security;

drop policy if exists "ver mis prestamos" on public.prestamos;
create policy "ver mis prestamos" on public.prestamos
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "crear mis prestamos" on public.prestamos;
create policy "crear mis prestamos" on public.prestamos
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "editar mis prestamos" on public.prestamos;
create policy "editar mis prestamos" on public.prestamos
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "borrar mis prestamos" on public.prestamos;
create policy "borrar mis prestamos" on public.prestamos
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Solo usuarios con sesión pueden tocar la tabla (los anónimos, nada).
revoke all on public.prestamos from anon;
grant select, insert, update, delete on public.prestamos to authenticated;
