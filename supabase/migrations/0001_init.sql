-- 0001_init.sql — esports tracker schema, RLS, realtime publication.
-- Apply via Supabase MCP or `supabase db push` after linking the project.

-- ------------------------------------------------------------------ enums
create type game_t as enum ('lol', 'csgo', 'valorant');
create type match_status_t as enum ('scheduled', 'live', 'finished', 'canceled');

-- ------------------------------------------------------------------ teams
create table teams (
  id            bigserial primary key,
  provider_id   text        not null,
  game          game_t      not null,
  name          text        not null,
  acronym       text,
  logo_url      text,
  created_at    timestamptz not null default now(),
  unique (provider_id, game)
);
create index teams_game_name_idx on teams (game, name);

-- ------------------------------------------------------------------ tournaments
create table tournaments (
  id            bigserial primary key,
  provider_id   text        not null,
  game          game_t      not null,
  name          text        not null,
  league_name   text,
  tier          text,
  begin_at      timestamptz,
  end_at        timestamptz,
  created_at    timestamptz not null default now(),
  unique (provider_id, game)
);
create index tournaments_game_name_idx on tournaments (game, name);

-- ------------------------------------------------------------------ matches
create table matches (
  id                 bigserial primary key,
  provider_id        text            not null,
  game               game_t          not null,
  tournament_id      bigint          references tournaments(id) on delete set null,
  team_a_id          bigint          references teams(id) on delete set null,
  team_b_id          bigint          references teams(id) on delete set null,
  status             match_status_t  not null,
  best_of            smallint,
  scheduled_at       timestamptz,
  began_at           timestamptz,
  score_a            smallint        not null default 0,
  score_b            smallint        not null default 0,
  current_map_number smallint,
  winner_team_id     bigint          references teams(id) on delete set null,
  updated_at         timestamptz     not null default now(),
  unique (provider_id, game)
);
create index matches_status_scheduled_idx on matches (status, scheduled_at desc);
create index matches_game_status_idx       on matches (game, status);

-- ------------------------------------------------------------------ match_maps
create table match_maps (
  id             bigserial primary key,
  match_id       bigint          not null references matches(id) on delete cascade,
  map_number     smallint        not null,
  map_name       text,
  score_a        smallint        not null default 0,
  score_b        smallint        not null default 0,
  status         match_status_t  not null default 'scheduled',
  winner_team_id bigint          references teams(id) on delete set null,
  updated_at     timestamptz     not null default now(),
  unique (match_id, map_number)
);
create index match_maps_match_idx on match_maps (match_id);

-- ------------------------------------------------------------------ favorites
create table user_favorite_teams (
  user_id uuid   references auth.users(id) on delete cascade,
  team_id bigint references teams(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, team_id)
);

create table user_favorite_tournaments (
  user_id       uuid   references auth.users(id) on delete cascade,
  tournament_id bigint references tournaments(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, tournament_id)
);

-- ------------------------------------------------------------------ worker_health
create table worker_health (
  id                   int primary key check (id = 1),
  last_poll_at         timestamptz,
  last_success_at      timestamptz,
  last_error           text,
  error_count_24h      int not null default 0,
  matches_tracked      int not null default 0,
  poll_count_24h       int not null default 0,
  rate_limit_remaining int
);
insert into worker_health (id) values (1) on conflict do nothing;

-- ------------------------------------------------------------------ updated_at triggers
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger matches_touch before update on matches
  for each row execute function touch_updated_at();
create trigger match_maps_touch before update on match_maps
  for each row execute function touch_updated_at();

-- ------------------------------------------------------------------ RLS
alter table teams                      enable row level security;
alter table tournaments                enable row level security;
alter table matches                    enable row level security;
alter table match_maps                 enable row level security;
alter table worker_health              enable row level security;
alter table user_favorite_teams        enable row level security;
alter table user_favorite_tournaments  enable row level security;

-- Public read on match data (service role bypasses RLS for writes).
create policy teams_read         on teams         for select using (true);
create policy tournaments_read   on tournaments   for select using (true);
create policy matches_read       on matches       for select using (true);
create policy match_maps_read    on match_maps    for select using (true);
create policy worker_health_read on worker_health for select using (true);

-- Favorites: owner-only.
create policy uft_owner on user_favorite_teams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy ufn_owner on user_favorite_tournaments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------------ Realtime
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table match_maps;
alter publication supabase_realtime add table worker_health;
