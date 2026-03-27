-- =============================================================
-- Agent Shared Files & CloudSign Signing Requests
-- =============================================================

-- =============================================================
-- 1) agent_shared_files — 双方向ファイル共有
-- =============================================================
create table if not exists agent_shared_files (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references agents (id) on delete cascade,
  uploaded_by  uuid not null references auth.users (id),
  direction    text not null check (direction in ('to_agent', 'to_hq')),
  file_name    text not null,
  file_size    integer not null,
  file_type    text not null,
  storage_path text not null,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_asf_agent on agent_shared_files (agent_id);
create index if not exists idx_asf_direction on agent_shared_files (agent_id, direction);
create index if not exists idx_asf_created on agent_shared_files (created_at desc);

-- =============================================================
-- 2) agent_signing_requests — CloudSign電子署名
-- =============================================================
create table if not exists agent_signing_requests (
  id                    uuid primary key default gen_random_uuid(),
  agent_id              uuid not null references agents (id) on delete cascade,
  template_type         text not null check (template_type in ('agent_contract', 'nda', 'other')),
  title                 text not null,
  cloudsign_document_id text,
  status                text not null default 'draft'
                          check (status in ('draft', 'sent', 'viewed', 'signed', 'rejected', 'expired')),
  signer_email          text not null,
  signer_name           text not null,
  sent_at               timestamptz,
  signed_at             timestamptz,
  signed_pdf_path       text,
  rejection_reason      text,
  requested_by          uuid references auth.users (id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_asr_agent on agent_signing_requests (agent_id);
create index if not exists idx_asr_status on agent_signing_requests (status);
create index if not exists idx_asr_cloudsign on agent_signing_requests (cloudsign_document_id)
  where cloudsign_document_id is not null;

-- =============================================================
-- 3) RLS Policies
-- =============================================================
alter table agent_shared_files enable row level security;
alter table agent_signing_requests enable row level security;

-- agent_shared_files: agents can see their own files
create policy "asf_select" on agent_shared_files
  for select using (agent_id in (select my_agent_ids()));

-- agent_shared_files: agents can upload to_hq only
create policy "asf_insert" on agent_shared_files
  for insert with check (
    agent_id in (select my_agent_ids())
    and direction = 'to_hq'
  );

-- agent_signing_requests: agents can view their own
create policy "asr_select" on agent_signing_requests
  for select using (agent_id in (select my_agent_ids()));

-- =============================================================
-- 4) Storage bucket for shared files
-- =============================================================
insert into storage.buckets (id, name, public)
values ('agent-shared-files', 'agent-shared-files', false)
on conflict (id) do nothing;

-- =============================================================
-- 5) updated_at trigger for signing_requests
-- =============================================================
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_agent_signing_requests_updated_at') then
    create trigger trg_agent_signing_requests_updated_at
      before update on agent_signing_requests
      for each row execute function set_updated_at();
  end if;
end $$;
