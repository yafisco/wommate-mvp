-- Migration: Matching V2.0 - Système de Feedback et Notation
-- Fichier: supabase/migrations/20260717000003_matching_v2_feedback.sql

-- Créer la table des accompagnements
CREATE TABLE IF NOT EXISTS accompagnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id UUID REFERENCES demandes_aide(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES profils(id) ON DELETE CASCADE NOT NULL,
  etudiant_id UUID REFERENCES profils(id) ON DELETE CASCADE NOT NULL,
  date_debut TIMESTAMPTZ DEFAULT NOW(),
  date_fin TIMESTAMPTZ,
  statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'annule')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Un mentor ne peut pas avoir deux accompagnements actifs pour la même demande
  UNIQUE(demande_id, mentor_id)
);

-- Activer RLS
ALTER TABLE accompagnements ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view their own accompaniments"
  ON accompagnements FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = etudiant_id);

CREATE POLICY "Mentors can create accompaniments"
  ON accompagnements FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Users can update their own accompaniments"
  ON accompagnements FOR UPDATE
  USING (auth.uid() = mentor_id OR auth.uid() = etudiant_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = etudiant_id);

CREATE POLICY "Users can delete their own accompaniments"
  ON accompagnements FOR DELETE
  USING (auth.uid() = mentor_id OR auth.uid() = etudiant_id);

-- Admins can view all accompaniments
CREATE POLICY "Admins can view all accompaniments"
  ON accompagnements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profils 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Créer la table des notes des mentors
CREATE TABLE IF NOT EXISTS notes_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accompagnement_id UUID REFERENCES accompagnements(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES profils(id) ON DELETE CASCADE NOT NULL,
  etudiant_id UUID REFERENCES profils(id) ON DELETE CASCADE NOT NULL,
  note INTEGER CHECK (note BETWEEN 1 AND 5) NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Un étudiant ne peut noter qu'une fois par accompagnement
  UNIQUE(accompagnement_id, etudiant_id)
);

-- Activer RLS
ALTER TABLE notes_mentors ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view notes for their accompaniments"
  ON notes_mentors FOR SELECT
  USING (
    auth.uid() = mentor_id OR 
    auth.uid() = etudiant_id OR
    EXISTS (
      SELECT 1 FROM accompagnements a
      WHERE a.id = notes_mentors.accompagnement_id
        AND (a.mentor_id = auth.uid() OR a.etudiant_id = auth.uid())
    )
  );

CREATE POLICY "Students can create notes"
  ON notes_mentors FOR INSERT
  WITH CHECK (auth.uid() = etudiant_id);

CREATE POLICY "Users can view their own notes"
  ON notes_mentors FOR SELECT
  USING (auth.uid() = etudiant_id);

-- Admins can view all notes
CREATE POLICY "Admins can view all notes"
  ON notes_mentors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profils 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Créer des index pour optimiser les requêtes
CREATE INDEX idx_accompagnements_mentor_id ON accompagnements(mentor_id);
CREATE INDEX idx_accompagnements_etudiant_id ON accompagnements(etudiant_id);
CREATE INDEX idx_accompagnements_demande_id ON accompagnements(demande_id);
CREATE INDEX idx_accompagnements_statut ON accompagnements(statut);
CREATE INDEX idx_notes_mentors_mentor_id ON notes_mentors(mentor_id);
CREATE INDEX idx_notes_mentors_accompagnement_id ON notes_mentors(accompagnement_id);

-- Fonction pour mettre à jour la note moyenne d'un mentor
CREATE OR REPLACE FUNCTION update_mentor_average_rating(mentor_id UUID)
RETURNS VOID AS $$
DECLARE
  new_avg DECIMAL(3,2);
  new_count INTEGER;
BEGIN
  -- Calculer la nouvelle moyenne
  SELECT 
    AVG(note)::DECIMAL(3,2),
    COUNT(*)
  INTO new_avg, new_count
  FROM notes_mentors
  WHERE mentor_id = update_mentor_average_rating.mentor_id;
  
  -- Mettre à jour le profil
  UPDATE profils
  SET 
    note_moyenne = COALESCE(new_avg, 0),
    nombre_notes = COALESCE(new_count, 0)
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le taux de réussite d'un mentor
CREATE OR REPLACE FUNCTION update_mentor_success_rate(mentor_id UUID)
RETURNS VOID AS $$
DECLARE
  total_accompagnements INTEGER;
  successful_accompagnements INTEGER;
  new_rate DECIMAL(5,2);
BEGIN
  -- Compter le total d'accompagnements
  SELECT COUNT(*)
  INTO total_accompagnements
  FROM accompagnements
  WHERE mentor_id = update_mentor_success_rate.mentor_id
    AND statut IN ('termine', 'annule');
  
  -- Compter les accompagnements réussis (terminés)
  SELECT COUNT(*)
  INTO successful_accompagnements
  FROM accompagnements
  WHERE mentor_id = update_mentor_success_rate.mentor_id
    AND statut = 'termine';
  
  -- Calculer le taux
  IF total_accompagnements > 0 THEN
    new_rate := (successful_accompagnements::DECIMAL / total_accompagnements::DECIMAL) * 100;
  ELSE
    new_rate := 0;
  END IF;
  
  -- Mettre à jour le profil
  UPDATE profils
  SET taux_reussite = new_rate
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour automatiquement la note moyenne après une nouvelle note
CREATE OR REPLACE FUNCTION trigger_update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_mentor_average_rating(NEW.mentor_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le taux de réussite après un changement de statut
CREATE OR REPLACE FUNCTION trigger_update_mentor_success_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.statut != NEW.statut) THEN
    PERFORM update_mentor_success_rate(NEW.mentor_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS on_note_created ON notes_mentors;
CREATE TRIGGER on_note_created
  AFTER INSERT ON notes_mentors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_mentor_rating();

DROP TRIGGER IF EXISTS on_accompagnement_status_change ON accompagnements;
CREATE TRIGGER on_accompagnement_status_change
  AFTER INSERT OR UPDATE ON accompagnements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_mentor_success_rate();

-- Fonction pour créer un accompagnement automatiquement quand une proposition est acceptée
CREATE OR REPLACE FUNCTION create_accompagnement_on_proposition_acceptee()
RETURNS TRIGGER AS $$
DECLARE
  existing_accompagnement UUID;
BEGIN
  -- Vérifier si un accompagnement existe déjà
  SELECT id INTO existing_accompagnement
  FROM accompagnements
  WHERE demande_id = NEW.demande_id
    AND mentor_id = NEW.mentor_id
    AND statut = 'en_cours';
  
  -- Si non, créer un nouvel accompagnement
  IF existing_accompagnement IS NULL AND NEW.statut = 'acceptee' THEN
    INSERT INTO accompagnements (demande_id, mentor_id, etudiant_id)
    SELECT 
      NEW.demande_id,
      NEW.mentor_id,
      da.auteur_id
    FROM demandes_aide da
    WHERE da.id = NEW.demande_id;
    
    -- Mettre à jour le statut de la demande
    UPDATE demandes_aide
    SET statut = 'en_cours'
    WHERE id = NEW.demande_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur les propositions
DROP TRIGGER IF EXISTS on_proposition_accepted ON propositions_aide;
CREATE TRIGGER on_proposition_accepted
  AFTER UPDATE ON propositions_aide
  FOR EACH ROW
  WHEN (NEW.statut = 'acceptee' AND OLD.statut != 'acceptee')
  EXECUTE FUNCTION create_accompagnement_on_proposition_acceptee();

-- Vue pour voir les statistiques des mentors
CREATE OR REPLACE VIEW mentor_stats_view AS
SELECT 
  p.id as mentor_id,
  p.nom_complet,
  p.filiere,
  p.note_moyenne,
  p.nombre_notes,
  p.taux_reussite,
  p.temps_reponse_moyen,
  p.statut_en_ligne,
  COUNT(DISTINCT a.id) as total_accompagnements,
  COUNT(DISTINCT CASE WHEN a.statut = 'en_cours' THEN a.id END) as accompanements_actifs,
  COUNT(DISTINCT CASE WHEN a.statut = 'termine' THEN a.id END) as accompanements_termines,
  AVG(EXTRACT(EPOCH FROM (a.date_fin - a.date_debut))/3600) as duree_moyenne_heures
FROM profils p
LEFT JOIN accompagnements a ON a.mentor_id = p.id
WHERE p.role = 'mentor'
GROUP BY p.id, p.nom_complet, p.filiere, p.note_moyenne, p.nombre_notes, p.taux_reussite, p.temps_reponse_moyen, p.statut_en_ligne;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION update_mentor_average_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_mentor_success_rate(UUID) TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE accompagnements TO authenticated;
GRANT SELECT, INSERT ON TABLE notes_mentors TO authenticated;
GRANT SELECT ON VIEW mentor_stats_view TO authenticated;
