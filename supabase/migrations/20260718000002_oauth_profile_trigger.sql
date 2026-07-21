-- Migration: Trigger pour création automatique du profil après OAuth
-- Fichier: supabase/migrations/20260718000002_oauth_profile_trigger.sql

-- Trigger pour créer le profil automatiquement après inscription OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insérer le profil uniquement s'il n'existe pas déjà
  INSERT INTO public.profils (id, nom_complet, email, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'user_name',
      'Utilisateur'
    ),
    NEW.email,
    'etudiant',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
