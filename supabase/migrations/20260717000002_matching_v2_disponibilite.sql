-- Migration: Matching V2.0 - Système de Disponibilité
-- Fichier: supabase/migrations/20260717000002_matching_v2_disponibilite.sql

-- Créer la table des disponibilités des mentors
CREATE TABLE IF NOT EXISTS disponibilites_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES profils(id) ON DELETE CASCADE NOT NULL,
  jour_semaine INTEGER CHECK (jour_semaine BETWEEN 0 AND 6), -- 0 = Dimanche, 6 = Samedi
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  statut_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Vérifier que l'heure de fin est après l'heure de début
  CONSTRAINT heure_fin_apres_debut CHECK (heure_fin > heure_debut),
  -- Un mentor ne peut pas avoir deux créneaux qui se chevauchent le même jour
  UNIQUE(mentor_id, jour_semaine, heure_debut, heure_fin)
);

-- Activer RLS
ALTER TABLE disponibilites_mentors ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Mentors can view their own availability"
  ON disponibilites_mentors FOR SELECT
  USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can create their own availability"
  ON disponibilites_mentors FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update their own availability"
  ON disponibilites_mentors FOR UPDATE
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete their own availability"
  ON disponibilites_mentors FOR DELETE
  USING (auth.uid() = mentor_id);

-- Admins can view all availability
CREATE POLICY "Admins can view all availability"
  ON disponibilites_mentors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profils 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Créer un index pour optimiser les requêtes de disponibilité
CREATE INDEX idx_disponibilites_mentor_id ON disponibilites_mentors(mentor_id);
CREATE INDEX idx_disponibilites_jour_semaine ON disponibilites_mentors(jour_semaine);
CREATE INDEX idx_disponibilites_actif ON disponibilites_mentors(statut_actif) WHERE statut_actif = true;

-- Fonction pour vérifier si un mentor est disponible maintenant
CREATE OR REPLACE FUNCTION is_mentor_available_now(mentor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_day INTEGER;
  current_time TIME;
  available BOOLEAN := false;
BEGIN
  current_day := EXTRACT(DOW FROM NOW());
  current_time := NOW()::TIME;
  
  SELECT EXISTS(
    SELECT 1 FROM disponibilites_mentors
    WHERE mentor_id = is_mentor_available_now.mentor_id
      AND jour_semaine = current_day
      AND statut_actif = true
      AND heure_debut <= current_time
      AND heure_fin > current_time
  ) INTO available;
  
  RETURN available;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un mentor est disponible à un moment donné
CREATE OR REPLACE FUNCTION is_mentor_available_at(
  mentor_id UUID,
  check_time TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
DECLARE
  check_day INTEGER;
  check_time_only TIME;
  available BOOLEAN := false;
BEGIN
  check_day := EXTRACT(DOW FROM check_time);
  check_time_only := check_time::TIME;
  
  SELECT EXISTS(
    SELECT 1 FROM disponibilites_mentors
    WHERE mentor_id = is_mentor_available_at.mentor_id
      AND jour_semaine = check_day
      AND statut_actif = true
      AND heure_debut <= check_time_only
      AND heure_fin > check_time_only
  ) INTO available;
  
  RETURN available;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le statut en ligne
CREATE OR REPLACE FUNCTION update_online_status(mentor_id UUID, is_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE profils
  SET 
    statut_en_ligne = is_online,
    derniere_activite = NOW()
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour automatiquement le statut en ligne
-- quand un mentor se connecte (à appeler depuis l'application)
CREATE OR REPLACE FUNCTION handle_mentor_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profils
  SET 
    statut_en_ligne = true,
    derniere_activite = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le temps de réponse moyen
CREATE OR REPLACE FUNCTION calculate_avg_response_time(mentor_id UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_time INTEGER;
BEGIN
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - demande_created_at))/60), 0)::INTEGER
  INTO avg_time
  FROM propositions_aide pa
  JOIN demandes_aide da ON pa.demande_id = da.id
  WHERE pa.mentor_id = calculate_avg_response_time.mentor_id
    AND pa.created_at > NOW() - INTERVAL '30 days';
  
  -- Mettre à jour le profil
  UPDATE profils
  SET temps_reponse_moyen = avg_time
  WHERE id = mentor_id;
  
  RETURN avg_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION is_mentor_available_now(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_mentor_available_at(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION update_online_status(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_avg_response_time(UUID) TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE disponibilites_mentors TO authenticated;
