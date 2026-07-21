-- Migration: Forum v2.0 - Enhancements (tags, réactions, réponses imbriquées)
-- Fichier: supabase/migrations/20260718000004_forum_v2_enhancements.sql

-- =========================================================================
-- 1. EXTENSION DE LA TABLE sujets_forum
-- =========================================================================

-- Ajouter la colonne tags (array de text)
ALTER TABLE sujets_forum 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Ajouter updated_at si absent (pour activité récente)
ALTER TABLE sujets_forum 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- =========================================================================
-- 2. EXTENSION DE LA TABLE reponses_forum
-- =========================================================================

-- Ajouter parent_id pour réponses imbriquées
ALTER TABLE reponses_forum 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES reponses_forum(id) ON DELETE CASCADE;

-- Ajouter updated_at
ALTER TABLE reponses_forum 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- =========================================================================
-- 3. NOUVELLE TABLE reactions_forum
-- =========================================================================

CREATE TABLE IF NOT EXISTS reactions_forum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cible_type text NOT NULL CHECK (cible_type IN ('sujet', 'reponse')),
  cible_id uuid NOT NULL,
  utilisateur_id uuid NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('utile', 'merci')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(cible_type, cible_id, utilisateur_id, type)
);

-- =========================================================================
-- 4. INDEX POUR PERFORMANCE
-- =========================================================================

-- Index pour les réactions
CREATE INDEX IF NOT EXISTS idx_reactions_cible ON reactions_forum(cible_type, cible_id);
CREATE INDEX IF NOT EXISTS idx_reactions_utilisateur ON reactions_forum(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions_forum(type);

-- Index pour les réponses imbriquées
CREATE INDEX IF NOT EXISTS idx_reponses_parent ON reponses_forum(parent_id) WHERE parent_id IS NOT NULL;

-- Index GIN pour les tags (recherche rapide dans array)
CREATE INDEX IF NOT EXISTS idx_sujets_tags ON sujets_forum USING GIN(tags);

-- =========================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- Activer RLS sur reactions_forum
ALTER TABLE reactions_forum ENABLE ROW LEVEL SECURITY;

-- Politiques pour reactions_forum
CREATE POLICY "Les utilisateurs peuvent voir les réactions" 
ON reactions_forum FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent créer leurs réactions" 
ON reactions_forum FOR INSERT WITH CHECK (utilisateur_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent supprimer leurs réactions" 
ON reactions_forum FOR DELETE USING (utilisateur_id = auth.uid());

-- Vérifier et mettre à jour les politiques sujets_forum si nécessaire
ALTER TABLE sujets_forum ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les sujets" ON sujets_forum;
CREATE POLICY "Les utilisateurs peuvent voir les sujets" 
ON sujets_forum FOR SELECT USING (true);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des sujets" ON sujets_forum;
CREATE POLICY "Les utilisateurs peuvent créer des sujets" 
ON sujets_forum FOR INSERT WITH CHECK (auteur_id = auth.uid());

DROP POLICY IF EXISTS "Les auteurs peuvent modifier leurs sujets" ON sujets_forum;
CREATE POLICY "Les auteurs peuvent modifier leurs sujets" 
ON sujets_forum FOR UPDATE USING (auteur_id = auth.uid());

DROP POLICY IF EXISTS "Les auteurs peuvent supprimer leurs sujets" ON sujets_forum;
CREATE POLICY "Les auteurs peuvent supprimer leurs sujets" 
ON sujets_forum FOR DELETE USING (auteur_id = auth.uid());

-- Vérifier et mettre à jour les politiques reponses_forum si nécessaire
ALTER TABLE reponses_forum ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les réponses" ON reponses_forum;
CREATE POLICY "Les utilisateurs peuvent voir les réponses" 
ON reponses_forum FOR SELECT USING (true);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des réponses" ON reponses_forum;
CREATE POLICY "Les utilisateurs peuvent créer des réponses" 
ON reponses_forum FOR INSERT WITH CHECK (auteur_id = auth.uid());

DROP POLICY IF EXISTS "Les auteurs peuvent modifier leurs réponses" ON reponses_forum;
CREATE POLICY "Les auteurs peuvent modifier leurs réponses" 
ON reponses_forum FOR UPDATE USING (auteur_id = auth.uid());

DROP POLICY IF EXISTS "Les auteurs peuvent supprimer leurs réponses" ON reponses_forum;
CREATE POLICY "Les auteurs peuvent supprimer leurs réponses" 
ON reponses_forum FOR DELETE USING (auteur_id = auth.uid());

-- =========================================================================
-- 6. VUE ÉTENDUE: SUJETS AVEC COMPTEURS DE RÉACTIONS
-- =========================================================================

DROP VIEW IF EXISTS sujets_with_reponse_count;
DROP VIEW IF EXISTS sujets_with_reaction_counts;

CREATE OR REPLACE VIEW sujets_with_reaction_counts AS
SELECT 
  s.id,
  s.groupe_id,
  s.auteur_id,
  s.titre,
  s.contenu,
  s.tags,
  s.signale,
  s.created_at,
  s.updated_at,
  p.nom_complet as auteur_nom,
  p.filiere as auteur_filiere,
  p.niveau as auteur_niveau,
  p.role as auteur_role,
  g.nom as groupe_nom,
  g.filiere as groupe_filiere,
  g.couleur as groupe_couleur,
  (SELECT COUNT(*) FROM reponses_forum r WHERE r.sujet_id = s.id)::int as reponse_count,
  (SELECT COUNT(*) FROM reactions_forum r WHERE r.cible_type = 'sujet' AND r.cible_id = s.id AND r.type = 'utile')::int as utile_count,
  (SELECT COUNT(*) FROM reactions_forum r WHERE r.cible_type = 'sujet' AND r.cible_id = s.id AND r.type = 'merci')::int as merci_count,
  (SELECT MAX(r.created_at) FROM reponses_forum r WHERE r.sujet_id = s.id) as derniere_reponse_at
FROM sujets_forum s
LEFT JOIN profils p ON s.auteur_id = p.id
LEFT JOIN groupes_thematiques g ON s.groupe_id = g.id;

-- =========================================================================
-- 7. VUE ÉTENDUE: RÉPONSES AVEC RÉACTIONS
-- =========================================================================

DROP VIEW IF EXISTS reponses_with_auteur;

CREATE OR REPLACE VIEW reponses_with_auteur AS
SELECT 
  r.id,
  r.sujet_id,
  r.auteur_id,
  r.contenu,
  r.parent_id,
  r.signale,
  r.created_at,
  r.updated_at,
  p.nom_complet as auteur_nom,
  p.filiere as auteur_filiere,
  p.niveau as auteur_niveau,
  p.role as auteur_role,
  (SELECT COUNT(*) FROM reactions_forum re WHERE re.cible_type = 'reponse' AND re.cible_id = r.id AND re.type = 'utile')::int as utile_count,
  (SELECT COUNT(*) FROM reactions_forum re WHERE re.cible_type = 'reponse' AND re.cible_id = r.id AND re.type = 'merci')::int as merci_count
FROM reponses_forum r
LEFT JOIN profils p ON r.auteur_id = p.id;

-- =========================================================================
-- 8. TRIGGER POUR METTRE À JOUR updated_at DES SUJETS
-- =========================================================================

CREATE OR REPLACE FUNCTION update_sujet_activity()
RETURNS trigger AS $$
BEGIN
  UPDATE sujets_forum
  SET updated_at = now()
  WHERE id = NEW.sujet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reponse_created ON reponses_forum;
CREATE TRIGGER on_reponse_created
  AFTER INSERT ON reponses_forum
  FOR EACH ROW
  EXECUTE FUNCTION update_sujet_activity();

-- =========================================================================
-- 9. FONCTION: COMPTER LES CONTRIBUTIONS D'UN UTILISATEUR
-- =========================================================================

CREATE OR REPLACE FUNCTION get_user_contribution_count(user_id uuid)
RETURNS integer AS $$
DECLARE
  sujet_count integer;
  reponse_count integer;
BEGIN
  SELECT COUNT(*) INTO sujet_count FROM sujets_forum WHERE auteur_id = user_id;
  SELECT COUNT(*) INTO reponse_count FROM reponses_forum WHERE auteur_id = user_id;
  RETURN sujet_count + reponse_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 10. DONNÉES INITIALES: TAGS POPULAIRES
-- =========================================================================

-- Cette table peut être créée pour suggérer des tags populaires
CREATE TABLE IF NOT EXISTS tags_populaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL UNIQUE,
  frequence integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Insérer des tags populaires par défaut
INSERT INTO tags_populaires (nom, frequence) VALUES
  ('examen', 10),
  ('TP', 8),
  ('révision', 7),
  ('cours', 6),
  ('aide', 5),
  ('projet', 4),
  ('théorie', 3),
  ('pratique', 3),
  ('méthodologie', 2),
  ('orientation', 2)
ON CONFLICT (nom) DO NOTHING;
