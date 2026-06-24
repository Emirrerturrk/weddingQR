-- Supabase Database Schema for QR Wedding SaaS

-- 1. Profiles Table (Linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);



-- 2. Events Table (Weddings/Events created by hosts)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  event_type text default 'wedding',
  event_date date,
  description text,
  upload_limit_per_guest int default 10,
  max_file_size_mb int default 15,
  allow_video boolean default false,
  gallery_public boolean default false,
  live_screen_enabled boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable RLS on events
alter table public.events enable row level security;

create policy "Owners can do all actions on their own events"
  on public.events for all
  using (auth.uid() = owner_id);

create policy "Anyone can view active events by slug"
  on public.events for select
  using (is_active = true);


-- 3. Uploads Table (Photos and videos uploaded by guests)
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  guest_name text,
  guest_device_id text,
  file_url text not null,
  file_path text not null,
  file_type text,
  file_size int,
  is_approved boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable RLS on uploads
alter table public.uploads enable row level security;

create policy "Anyone can insert uploads to active events"
  on public.uploads for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = uploads.event_id and events.is_active = true
    )
  );

create policy "Owners can view uploads of their events"
  on public.uploads for select
  using (
    exists (
      select 1 from public.events
      where events.id = uploads.event_id and events.owner_id = auth.uid()
    )
  );

create policy "Anyone can view uploads if event has public gallery enabled"
  on public.uploads for select
  using (
    exists (
      select 1 from public.events
      where events.id = uploads.event_id and events.gallery_public = true
    )
  );

create policy "Owners can delete/update uploads of their events"
  on public.uploads for all
  using (
    exists (
      select 1 from public.events
      where events.id = uploads.event_id and events.owner_id = auth.uid()
    )
  );


-- 4. Storage Bucket Setup (event-uploads)
-- In Supabase console:
-- 1. Create a public bucket named 'event-uploads'
-- 2. Add policies for the bucket:
--    - SELECT: Allow public read access to everyone (so guest files are publicly viewable).
--    - INSERT: Allow public write access to everyone.
--    - DELETE: Allow authenticated users to delete their files.
