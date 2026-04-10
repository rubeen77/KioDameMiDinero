-- Transacciones
create table if not exists transacciones (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tipo text not null,
  cantidad numeric not null,
  categoria text not null,
  fecha text not null,
  nota text,
  created_at timestamptz default now()
);
alter table transacciones enable row level security;
create policy "own_transacciones" on transacciones for all using (auth.uid() = user_id);

-- Fijos
create table if not exists fijos (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tipo text not null,
  cantidad numeric not null,
  categoria text not null,
  dia integer,
  nota text,
  created_at timestamptz default now()
);
alter table fijos enable row level security;
create policy "own_fijos" on fijos for all using (auth.uid() = user_id);

-- Metas
create table if not exists metas (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nombre text not null,
  emoji text not null,
  meta numeric not null,
  actual numeric not null default 0,
  created_at timestamptz default now()
);
alter table metas enable row level security;
create policy "own_metas" on metas for all using (auth.uid() = user_id);

-- Presupuesto (una fila por usuario)
create table if not exists presupuesto (
  user_id uuid references auth.users(id) on delete cascade primary key,
  cantidad numeric not null default 0
);
alter table presupuesto enable row level security;
create policy "own_presupuesto" on presupuesto for all using (auth.uid() = user_id);

-- Saldo inicial (una fila por usuario)
create table if not exists saldo_inicial (
  user_id uuid references auth.users(id) on delete cascade primary key,
  cantidad numeric not null
);
alter table saldo_inicial enable row level security;
create policy "own_saldo_inicial" on saldo_inicial for all using (auth.uid() = user_id);

-- Perfiles
create table if not exists perfiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  edad integer not null,
  created_at timestamptz default now()
);
alter table perfiles enable row level security;
create policy "own_perfil" on perfiles for all using (auth.uid() = user_id);
