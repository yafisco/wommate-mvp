-- Migration: Fix du trigger handle_new_user pour l'inscription email
-- Fichier: supabase/migrations/20260718000005_fix_profile_trigger.sql

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Mettre à jour la fonction pour gérer l'inscription email ET OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insérer le profil uniquement s'il n'existe pas déjà
  -- Récupérer le nom depuis différentes sources selon le type d'inscription
  INSERT INTO public.profils (id, nom_complet, role, filiere, niveau, bio, centres_interet, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nom_complet',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'user_name',
      NEW.email -- Fallback : utiliser l'email comme nom si rien d'autre
    ),
    'etudiant', -- Rôle par défaut
    NULL,
    NULL,
    NULL,
    array[]::text[],
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
