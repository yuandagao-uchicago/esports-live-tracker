-- 0003_replica_identity.sql — make Realtime UPDATE payloads carry full rows.
-- Without this, Postgres only emits the changed columns to the logical
-- replication slot, so the client merge in apps/web/src/lib/realtime.ts
-- could miss team_a_id/team_b_id and treat the row as a bracket placeholder.

alter table matches    replica identity full;
alter table match_maps replica identity full;
