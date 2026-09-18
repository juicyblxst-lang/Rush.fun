create table public.wallet_link_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  address text not null,
  chain text not null check(chain in ('base')),
  nonce text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index wallet_link_challenges_user_idx on public.wallet_link_challenges(user_id, created_at desc);
create index wallet_link_challenges_expiry_idx on public.wallet_link_challenges(expires_at);
alter table public.wallet_link_challenges enable row level security;
create policy "wallet link challenges self" on public.wallet_link_challenges for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create unique index wallets_chain_address_unique on public.wallets(chain,address);