create extension if not exists pgcrypto;

create table public.users(id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create table public.profiles(id uuid primary key references public.users(id) on delete cascade,username text not null unique,display_name text not null,avatar_url text,bio text,created_at timestamptz not null default now());
create table public.provider_sources(id uuid primary key default gen_random_uuid(),provider text not null,external_id text not null,chain text not null,source_url text,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(provider,external_id));
create table public.assets(id uuid primary key default gen_random_uuid(),provider_source_id uuid references public.provider_sources(id) on delete set null,chain text not null,address text not null,symbol text not null,name text not null,image_url text,description text,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(chain,address));
create table public.markets(id uuid primary key default gen_random_uuid(),provider_source_id uuid references public.provider_sources(id) on delete set null,asset_id uuid references public.assets(id) on delete set null,provider text not null,chain text not null,kind text not null,external_id text not null,market_address text,quote_symbol text,price_usd numeric,price_change_24h numeric,market_cap_usd numeric,volume_24h_usd numeric,liquidity_usd numeric,source_url text,metadata jsonb not null default '{}'::jsonb,observed_at timestamptz not null default now(),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(provider,external_id));
create table public.theses(id uuid primary key default gen_random_uuid(),market_id uuid not null references public.markets(id) on delete cascade,author_id uuid not null references public.users(id) on delete cascade,stance text not null check(stance in('bullish','bearish','neutral')),title text not null check(char_length(title) between 3 and 160),body text not null check(char_length(body) between 10 and 10000),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.posts(id uuid primary key default gen_random_uuid(),market_id uuid references public.markets(id) on delete cascade,thesis_id uuid references public.theses(id) on delete cascade,author_id uuid not null references public.users(id) on delete cascade,body text not null check(char_length(body) between 1 and 10000),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(market_id is not null or thesis_id is not null));
create table public.comments(id uuid primary key default gen_random_uuid(),post_id uuid references public.posts(id) on delete cascade,thesis_id uuid references public.theses(id) on delete cascade,author_id uuid not null references public.users(id) on delete cascade,body text not null check(char_length(body) between 1 and 5000),created_at timestamptz not null default now(),check((post_id is not null)<>(thesis_id is not null)));
create table public.reactions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.users(id) on delete cascade,target_type text not null check(target_type in('thesis','post','comment')),target_id uuid not null,reaction text not null default 'like',created_at timestamptz not null default now(),unique(user_id,target_type,target_id));
create table public.follows(follower_id uuid not null references public.users(id) on delete cascade,following_id uuid not null references public.users(id) on delete cascade,created_at timestamptz not null default now(),primary key(follower_id,following_id),check(follower_id<>following_id));
create table public.market_activity(id uuid primary key default gen_random_uuid(),market_id uuid not null references public.markets(id) on delete cascade,provider text not null,external_id text not null,occurred_at timestamptz not null,side text,price_usd numeric,amount_usd numeric,trader_address text,transaction_hash text,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),unique(provider,external_id));
create table public.wallets(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.users(id) on delete cascade,address text not null,chain text not null,verified_at timestamptz,created_at timestamptz not null default now(),unique(user_id,chain,address));
create table public.agent_events(id uuid primary key default gen_random_uuid(),agent text not null,event_type text not null,market_id uuid references public.markets(id) on delete set null,payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());

create index markets_discovery_idx on public.markets(chain,updated_at desc);
create index markets_volume_idx on public.markets(volume_24h_usd desc nulls last);
create index theses_market_idx on public.theses(market_id,created_at desc);
create index posts_market_idx on public.posts(market_id,created_at desc);
create index comments_post_idx on public.comments(post_id,created_at);
create index activity_market_idx on public.market_activity(market_id,occurred_at desc);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.users(id) values(new.id);
  insert into public.profiles(id,username,display_name)
  values(new.id,coalesce(nullif(new.raw_user_meta_data->>'username',''),'user_'||substr(replace(new.id::text,'-',''),1,8)),coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'RUSH user'));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.markets enable row level security;
alter table public.theses enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.follows enable row level security;
alter table public.market_activity enable row level security;
alter table public.wallets enable row level security;

create policy "profiles readable" on public.profiles for select using(true);
create policy "assets readable" on public.assets for select using(true);
create policy "markets readable" on public.markets for select using(true);
create policy "theses readable" on public.theses for select using(true);
create policy "posts readable" on public.posts for select using(true);
create policy "comments readable" on public.comments for select using(true);
create policy "reactions readable" on public.reactions for select using(true);
create policy "follows readable" on public.follows for select using(true);
create policy "activity readable" on public.market_activity for select using(true);

create policy "profiles self update" on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
create policy "wallets self" on public.wallets for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "theses own" on public.theses for all using(auth.uid()=author_id) with check(auth.uid()=author_id);
create policy "posts own" on public.posts for all using(auth.uid()=author_id) with check(auth.uid()=author_id);
create policy "comments own" on public.comments for insert with check(auth.uid()=author_id);
create policy "reactions self" on public.reactions for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "follows self" on public.follows for all using(auth.uid()=follower_id) with check(auth.uid()=follower_id);
