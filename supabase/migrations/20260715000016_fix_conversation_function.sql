-- Migration: Recréation de la fonction get_or_create_conversation
-- Fichier: supabase/migrations/20260715000016_fix_conversation_function.sql

-- Supprimer la fonction si elle existe
drop function if exists public.get_or_create_conversation(uuid);

-- Recréer la fonction
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
