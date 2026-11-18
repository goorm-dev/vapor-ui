-- Run once in the Neon console. Insert-only log, one row per `@vapor-ui/figma-blueprint` run.
create table figma_blueprint_usage (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    file_key text not null,
    node_id text not null,
    version text not null,
    outcome text not null check (outcome in ('ok', 'unscorable', 'error')),
    stage text check (stage in ('fetch', 'catalog', 'blueprint')),
    status int check (status between 100 and 599),
    check ((outcome = 'error') = (stage is not null)),
    check (status is null or outcome = 'error')
);
