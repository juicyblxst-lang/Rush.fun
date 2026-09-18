create table public.market_contexts (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  agent_type text not null,
  model text not null,
  generated_at timestamptz not null,
  source_data_at timestamptz,
  summary text not null,
  relevant_activity jsonb not null default '[]'::jsonb,
  relevant_theses jsonb not null default '[]'::jsonb,
  supporting_arguments jsonb not null default '[]'::jsonb,
  counter_arguments jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  generation_status text not null check(generation_status in ('ready','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(market_id,agent_type)
);
create index market_contexts_market_idx on public.market_contexts(market_id,generated_at desc);
alter table public.market_contexts enable row level security;
create policy "market contexts readable" on public.market_contexts for select using(true);