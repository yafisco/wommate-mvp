-- Migration: Activation de Supabase Realtime pour la messagerie
-- Fichier: supabase/migrations/20260715000006_enable_realtime.sql

-- Activation de Realtime pour les tables de messagerie
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
