-- Migration: Création complète du système de messagerie
-- Fichier: supabase/migrations/20260715000018_create_messaging_tables.sql

-- Activation de Realtime pour les tables de messagerie
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;

-- =========================================================================
-- 1. CRÉATION DE LA TABLE CONVERSATIONS
-- =========================================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant1_id uuid references public.profils(id) on delete cascade not null,
  participant2_id uuid references public.profils(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Vérifier que les deux participants sont différents
  constraint different_participants check (participant1_id != participant2_id)
);

-- Activation de la RLS
alter table public.conversations enable row level security;

-- =========================================================================
-- 2. RLS POLICIES POUR CONVERSATIONS
-- =========================================================================

-- Policy: Les utilisateurs ne voient que leurs propres conversations
create policy "Users can view their own conversations"
  on public.conversations for select
  using (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- Policy: Les utilisateurs ne peuvent créer une conversation que s'ils en sont participant
create policy "Users can create conversations they are part of"
  on public.conversations for insert
  with check (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- Policy: Les utilisateurs ne peuvent modifier que leurs propres conversations (updated_at)
create policy "Users can update their own conversations"
  on public.conversations for update
  using (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  )
  with check (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- =========================================================================
-- 3. CRÉATION DE LA TABLE MESSAGES (si elle n'existe pas)
-- =========================================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  contenu text not null,
  expediteur_id uuid references public.profils(id) on delete cascade not null,
  destinataire_id uuid references public.profils(id) on delete cascade not null,
  lu boolean default false,
  created_at timestamptz default now()
);

-- Activation de la RLS
alter table public.messages enable row level security;

-- =========================================================================
-- 4. RLS POLICIES POUR MESSAGES
-- =========================================================================

-- Supprimer les anciennes policies si elles existent
drop policy if exists "Users can view messages in their conversations" on public.messages;
drop policy if exists "Users can send messages" on public.messages;
drop policy if exists "Users can mark messages as read" on public.messages;

-- Policy: Les utilisateurs ne voient que les messages de leurs conversations
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
    )
  );

-- Policy: Les utilisateurs peuvent envoyer des messages uniquement dans leurs conversations
create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = expediteur_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
    )
  );

-- Policy: Les utilisateurs peuvent mettre à jour les messages (marquer comme lu)
create policy "Users can update messages in their conversations"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
    )
  );

-- =========================================================================
-- 5. FONCTION : CRÉER OU OBTENIR UNE CONVERSATION
-- =========================================================================

create or replace function public.get_or_create_conversation(other_user_id uuid)
returns uuid as $$
declare
  conv_id uuid;
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  
  -- Vérifier que les deux utilisateurs existent et sont différents
  if current_user_id = other_user_id then
    raise exception 'Cannot create conversation with yourself';
  end if;
  
  if not exists (select 1 from public.profils where id = other_user_id) then
    raise exception 'User does not exist';
  end if;
  
  -- Chercher la conversation existante
  select id into conv_id from public.conversations
  where (participant1_id = current_user_id and participant2_id = other_user_id)
     or (participant1_id = other_user_id and participant2_id = current_user_id)
  limit 1;
  
  -- Si elle n'existe pas, la créer
  if conv_id is null then
    insert into public.conversations (participant1_id, participant2_id)
    values (current_user_id, other_user_id)
    returning id into conv_id;
  end if;
  
  return conv_id;
end;
$$ language plpgsql security definer;

-- Accorder les permissions
grant execute on function public.get_or_create_conversation(uuid) to authenticated;
grant execute on function public.get_or_create_conversation(uuid) to anon;

-- =========================================================================
-- 6. FONCTION : METTRE À JOUR TIMESTAMP CONVERSATION
-- =========================================================================

create or replace function public.update_conversation_timestamp()
returns trigger as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour mettre à jour updated_at à chaque nouveau message
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row
  execute procedure public.update_conversation_timestamp();

-- =========================================================================
-- 7. FONCTION : OBTENIR LES CONVERSATIONS AVEC DERNIER MESSAGE
-- =========================================================================

create or replace function public.get_conversations_with_last_message()
returns table (
  id uuid,
  participant1_id uuid,
  participant2_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  last_message_id uuid,
  last_message_content text,
  last_message_sender_id uuid,
  last_message_at timestamptz,
  last_message_read boolean,
  unread_count int
) as $$
begin
  return query
  select
    c.id,
    c.participant1_id,
    c.participant2_id,
    c.created_at,
    c.updated_at,
    m.id as last_message_id,
    m.contenu as last_message_content,
    m.expediteur_id as last_message_sender_id,
    m.created_at as last_message_at,
    m.lu as last_message_read,
    -- Compter les messages non-lus pour l'utilisateur actuel
    (
      select count(*)
      from public.messages msg
      where msg.conversation_id = c.id
        and msg.destinataire_id = auth.uid()
        and msg.lu = false
    )::int as unread_count
  from public.conversations c
  left join lateral (
    select * from public.messages
    where conversation_id = c.id
    order by created_at desc
    limit 1
  ) m on true
  where c.participant1_id = auth.uid() or c.participant2_id = auth.uid()
  order by c.updated_at desc;
end;
$$ language plpgsql security definer;

-- Accorder les permissions
grant execute on function public.get_conversations_with_last_message() to authenticated;
