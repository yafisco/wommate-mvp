-- Migration: Indexes pour optimiser les performances de messagerie
-- Fichier: supabase/migrations/20260715000005_messaging_indexes.sql

-- Index pour les messages
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_expediteur_id on public.messages(expediteur_id);
create index idx_messages_destinataire_id on public.messages(destinataire_id);
create index idx_messages_lu on public.messages(lu);
create index idx_messages_created_at on public.messages(created_at desc);

-- Index composite pour les conversations
create index idx_conversations_participants on public.conversations(participant1_id, participant2_id);
create index idx_conversations_updated_at on public.conversations(updated_at desc);

-- Index composite pour les messages non-lus
create index idx_messages_unread on public.messages(conversation_id, destinataire_id, lu) where lu = false;
