-- Migration: Définir shelbythomas1869@gmail.com comme administrateur
-- Fichier: supabase/migrations/20260717000000_set_admin_role.sql

-- Mettre à jour le rôle de l'utilisateur avec cet email
UPDATE public.profils
SET role = 'admin'
WHERE email = 'shelbythomas1869@gmail.com';

-- Si l'utilisateur n'existe pas, cette requête ne fera rien
-- Vous pouvez vérifier le résultat avec:
-- SELECT * FROM public.profils WHERE email = 'shelbythomas1869@gmail.com';
