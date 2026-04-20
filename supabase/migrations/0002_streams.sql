-- 0002_streams.sql — add streams JSONB column on matches.
-- PandaScore returns streams_list[] with { raw_url, embed_url, language, main, official }.

alter table matches add column if not exists streams jsonb not null default '[]'::jsonb;
