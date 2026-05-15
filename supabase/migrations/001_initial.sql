-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────────────
-- Organizations
-- ──────────────────────────────────────────────────────────────────────────────
create table organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  plan        text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Profiles (extends Supabase auth.users)
-- ──────────────────────────────────────────────────────────────────────────────
create table profiles (
  id               uuid primary key references auth.users on delete cascade,
  email            text not null,
  full_name        text,
  avatar_url       text,
  organization_id  uuid references organizations(id) on delete set null,
  role             text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at       timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ──────────────────────────────────────────────────────────────────────────────
-- Repositories
-- ──────────────────────────────────────────────────────────────────────────────
create table repositories (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  full_name        text not null,
  provider         text not null default 'github' check (provider in ('github', 'gitlab', 'bitbucket')),
  provider_id      text not null,
  default_branch   text not null default 'main',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  unique(organization_id, provider, provider_id)
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Pull Requests
-- ──────────────────────────────────────────────────────────────────────────────
create table pull_requests (
  id               uuid primary key default uuid_generate_v4(),
  repository_id    uuid not null references repositories(id) on delete cascade,
  provider_number  integer not null,
  title            text not null,
  description      text,
  author           text not null,
  author_avatar    text,
  base_branch      text not null,
  head_branch      text not null,
  status           text not null default 'open' check (status in ('open', 'merged', 'closed')),
  review_status    text not null default 'pending' check (review_status in ('pending', 'in_progress', 'completed')),
  risk_score       integer check (risk_score between 0 and 100),
  additions        integer not null default 0,
  deletions        integer not null default 0,
  changed_files    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  merged_at        timestamptz,
  unique(repository_id, provider_number)
);

create index idx_pull_requests_repository_id on pull_requests(repository_id);
create index idx_pull_requests_status on pull_requests(status);
create index idx_pull_requests_created_at on pull_requests(created_at desc);

-- ──────────────────────────────────────────────────────────────────────────────
-- Reviews
-- ──────────────────────────────────────────────────────────────────────────────
create table reviews (
  id               uuid primary key default uuid_generate_v4(),
  pull_request_id  uuid not null references pull_requests(id) on delete cascade,
  reviewer_id      uuid references profiles(id) on delete set null,
  type             text not null default 'ai' check (type in ('ai', 'human')),
  status           text not null default 'pending' check (status in ('pending', 'approved', 'changes_requested')),
  summary          text,
  created_at       timestamptz not null default now()
);

create index idx_reviews_pull_request_id on reviews(pull_request_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Review Comments
-- ──────────────────────────────────────────────────────────────────────────────
create table review_comments (
  id               uuid primary key default uuid_generate_v4(),
  review_id        uuid not null references reviews(id) on delete cascade,
  file_path        text not null,
  line_number      integer not null,
  body             text not null,
  severity         text not null default 'info' check (severity in ('info', 'warning', 'error', 'critical')),
  category         text not null default 'style' check (category in ('security', 'performance', 'style', 'logic', 'maintainability')),
  is_resolved      boolean not null default false,
  created_at       timestamptz not null default now()
);

create index idx_review_comments_review_id on review_comments(review_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Security Issues
-- ──────────────────────────────────────────────────────────────────────────────
create table security_issues (
  id               uuid primary key default uuid_generate_v4(),
  repository_id    uuid not null references repositories(id) on delete cascade,
  pull_request_id  uuid references pull_requests(id) on delete set null,
  file_path        text not null,
  line_number      integer,
  title            text not null,
  description      text not null,
  severity         text not null check (severity in ('low', 'medium', 'high', 'critical')),
  category         text not null check (category in ('secret', 'vulnerability', 'misconfiguration', 'dependency')),
  status           text not null default 'open' check (status in ('open', 'dismissed', 'resolved')),
  cve_id           text,
  created_at       timestamptz not null default now()
);

create index idx_security_issues_repository_id on security_issues(repository_id);
create index idx_security_issues_severity on security_issues(severity);
create index idx_security_issues_status on security_issues(status);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tech Debt
-- ──────────────────────────────────────────────────────────────────────────────
create table tech_debt (
  id               uuid primary key default uuid_generate_v4(),
  repository_id    uuid not null references repositories(id) on delete cascade,
  file_path        text not null,
  category         text not null check (category in ('duplication', 'complexity', 'coverage', 'outdated', 'smell')),
  debt_minutes     integer not null default 0,
  description      text not null,
  created_at       timestamptz not null default now()
);

create index idx_tech_debt_repository_id on tech_debt(repository_id);
create index idx_tech_debt_file_path on tech_debt(file_path);

-- ──────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────────────────────
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table repositories enable row level security;
alter table pull_requests enable row level security;
alter table reviews enable row level security;
alter table review_comments enable row level security;
alter table security_issues enable row level security;
alter table tech_debt enable row level security;

-- Profiles: users can read/update their own profile
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Organizations: members can read their org
create policy "organizations_select" on organizations for select
  using (id in (select organization_id from profiles where id = auth.uid()));

-- Repositories: org members can read
create policy "repositories_select" on repositories for select
  using (organization_id in (select organization_id from profiles where id = auth.uid()));

-- Pull requests: org members can read
create policy "pull_requests_select" on pull_requests for select
  using (repository_id in (
    select id from repositories where organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  ));

-- Reviews: org members can read/insert
create policy "reviews_select" on reviews for select
  using (pull_request_id in (
    select id from pull_requests where repository_id in (
      select id from repositories where organization_id in (
        select organization_id from profiles where id = auth.uid()
      )
    )
  ));

-- Review comments: same as reviews
create policy "review_comments_select" on review_comments for select
  using (review_id in (
    select id from reviews where pull_request_id in (
      select id from pull_requests where repository_id in (
        select id from repositories where organization_id in (
          select organization_id from profiles where id = auth.uid()
        )
      )
    )
  ));

-- Security issues: org members can read
create policy "security_issues_select" on security_issues for select
  using (repository_id in (
    select id from repositories where organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  ));

-- Tech debt: org members can read
create policy "tech_debt_select" on tech_debt for select
  using (repository_id in (
    select id from repositories where organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  ));
