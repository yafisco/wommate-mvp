-- Migration: Triggers pour notifications automatiques
-- Fichier: supabase/migrations/20260715000009_notifications_triggers.sql

-- =========================================================================
-- 1. FONCTION: CRÉER UNE NOTIFICATION
-- =========================================================================

create or replace function public.create_notification(
  p_destinataire_id uuid,
  p_type text,
  p_contenu text,
  p_lien text
)
returns uuid as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (destinataire_id, type, contenu, lien)
  values (p_destinataire_id, p_type, p_contenu, p_lien)
  returning id into notification_id;
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 2. TRIGGER: NOTIFICATION POUR RÉPONSES FORUM
-- =========================================================================

create or replace function public.notify_forum_reply()
returns trigger as $$
declare
  auteur_id uuid;
  sujet_titre text;
  groupe_id uuid;
begin
  -- Récupérer l'auteur du sujet
  select auteur_id, titre, groupe_id into auteur_id, sujet_titre, groupe_id
  from public.sujets_forum
  where id = new.sujet_id;
  
  -- Ne pas notifier l'auteur de sa propre réponse
  if auteur_id != new.auteur_id then
    insert into public.notifications (destinataire_id, type, contenu, lien)
    values (
      auteur_id,
      'forum_reply',
      'Nouvelle réponse à votre sujet "' || sujet_titre || '"',
      '/forum/' || groupe_id || '/' || new.sujet_id
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_forum_reply_created
  after insert on public.reponses_forum
  for each row
  execute procedure public.notify_forum_reply();

-- =========================================================================
-- 3. TRIGGER: NOTIFICATION POUR MESSAGES PRIVÉS
-- =========================================================================

create or replace function public.notify_private_message()
returns trigger as $$
begin
  -- Le destinataire est déjà dans le message
  insert into public.notifications (destinataire_id, type, contenu, lien)
  values (
    new.destinataire_id,
    'new_message',
    'Nouveau message privé reçu',
    '/messages/' || new.conversation_id
  );
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_private_message_created
  after insert on public.messages
  for each row
  execute procedure public.notify_private_message();

-- =========================================================================
-- 4. TRIGGER: NOTIFICATION POUR PROPOSITIONS D'AIDE
-- =========================================================================

create or replace function public.notify_help_proposition()
returns trigger as $$
declare
  demande_titre text;
  demande_auteur_id uuid;
begin
  -- Récupérer les détails de la demande
  select titre, auteur_id into demande_titre, demande_auteur_id
  from public.demandes_aide
  where id = new.demande_id;
  
  -- Notifier l'auteur de la demande
  insert into public.notifications (destinataire_id, type, contenu, lien)
  values (
    demande_auteur_id,
    'help_proposition',
    'Nouvelle proposition pour votre demande "' || demande_titre || '"',
    '/demandes/' || new.demande_id
  );
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_help_proposition_created
  after insert on public.propositions_aide
  for each row
  execute procedure public.notify_help_proposition();

-- =========================================================================
-- 5. INDEX POUR PERFORMANCE
-- =========================================================================

create index if not exists idx_notifications_destinataire_lu on public.notifications(destinataire_id, lu);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_type on public.notifications(type);

-- =========================================================================
-- 6. ACTIVATION REALTIME (optionnel pour mise à jour en temps réel)
-- =========================================================================

alter publication supabase_realtime add table public.notifications;
