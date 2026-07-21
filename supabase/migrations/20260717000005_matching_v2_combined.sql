-- Migration combinée: Matching V2.0 - Toutes les améliorations
-- Ce fichier combine les 4 migrations V2.0 pour éviter les conflits de synchronisation

-- ============================================================
-- PARTIE 1: Scoring Avancé et Niveau d'Études
-- ============================================================

-- Ajouter les champs nécessaires dans la table profils (avec IF NOT EXISTS pour éviter les erreurs)
DO $$
BEGIN
  -- Vérifier si les colonnes existent avant de les ajouter
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profils' AND column_name = 'note_moyenne') THEN
    ALTER TABLE profils ADD COLUMN note_moyenne DECIMAL(3,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profils' AND column_name = 'nombre_notes') THEN
    ALTER TABLE profils ADD COLUMN nombre_notes INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profils' AND column_name = 'temps_reponse_moyen') THEN
    ALTER TABLE profils ADD COLUMN temps_reponse_moyen INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profils' AND column_name = 'taux_reussite') THEN
    ALTER TABLE profils ADD COLUMN taux_reussite DECIMAL(5,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profils' AND column_name = 'statut_en_ligne') THEN
    ALTER TABLE profils ADD COLUMN statut_en_ligne BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profils' AND column_name = 'derniere_activite') THEN
    ALTER TABLE profils ADD COLUMN derniere_activite TIMESTAMPTZ;
  END IF;
END $$;

-- Créer ou remplacer la fonction de vérification de compatibilité des niveaux
CREATE OR REPLACE FUNCTION check_niveau_compatible(
  niveau_etudiant TEXT,
  niveau_mentor TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (niveau_etudiant = 'L1' AND niveau_mentor IN ('L2', 'L3', 'M1', 'M2', 'enseignant')) OR
    (niveau_etudiant = 'L2' AND niveau_mentor IN ('L3', 'M1', 'M2', 'enseignant')) OR
    (niveau_etudiant = 'L3' AND niveau_mentor IN ('M1', 'M2', 'enseignant')) OR
    (niveau_etudiant = 'M1' AND niveau_mentor IN ('M2', 'enseignant')) OR
    (niveau_etudiant = 'M2' AND niveau_mentor IN ('M2', 'enseignant')) OR
    (niveau_mentor = 'enseignant')
  );
END;
$$ LANGUAGE plpgsql;

-- Créer ou remplacer la fonction de scoring avancé
CREATE OR REPLACE FUNCTION advanced_match_mentors_for_demande(
  demande_id UUID
) RETURNS TABLE (
  mentor_id UUID,
  nom_complet TEXT,
  filiere TEXT,
  niveau TEXT,
  centres_interet TEXT[],
  note_moyenne DECIMAL(3,2),
  temps_reponse_moyen INTEGER,
  taux_reussite DECIMAL(5,2),
  statut_en_ligne BOOLEAN,
  score_total INTEGER,
  score_details JSONB
) AS $$
DECLARE
  demande_record RECORD;
BEGIN
  -- Récupérer les informations de la demande
  SELECT * INTO demande_record 
  FROM demandes_aide 
  WHERE id = demande_id;
  
  RETURN QUERY
  SELECT 
    p.id as mentor_id,
    p.nom_complet,
    p.filiere,
    p.niveau,
    p.centres_interet,
    p.note_moyenne,
    p.temps_reponse_moyen,
    p.taux_reussite,
    p.statut_en_ligne,
    -- Calcul du score total
    (
      -- Filière identique : +3 points
      CASE WHEN p.filiere = demande_record.filiere THEN 3 ELSE 0 END +
      -- Niveau compatible : +2 points
      CASE WHEN check_niveau_compatible(demande_record.niveau_requis, p.niveau) THEN 2 ELSE 0 END +
      -- Mots-clés pertinents : +1 point par correspondance
      (SELECT COUNT(*) FROM unnest(p.centres_interet) ci 
       WHERE demande_record.description ILIKE '%' || ci || '%') +
      -- Disponibilité : +2 points si en ligne
      CASE WHEN p.statut_en_ligne THEN 2 ELSE 0 END +
      -- Note moyenne : +1 à +3 points selon note
      CASE 
        WHEN p.note_moyenne >= 4.5 THEN 3
        WHEN p.note_moyenne >= 4.0 THEN 2
        WHEN p.note_moyenne >= 3.5 THEN 1
        ELSE 0
      END +
      -- Taux de réussite : +1 à +2 points
      CASE 
        WHEN p.taux_reussite >= 80 THEN 2
        WHEN p.taux_reussite >= 60 THEN 1
        ELSE 0
      END -
      -- Temps de réponse : -1 point si lent (> 24h)
      CASE WHEN p.temps_reponse_moyen > 1440 THEN 1 ELSE 0 END
    ) as score_total,
    -- Détails du score pour debugging
    jsonb_build_object(
      'filiere_match', CASE WHEN p.filiere = demande_record.filiere THEN 3 ELSE 0 END,
      'niveau_compatible', CASE WHEN check_niveau_compatible(demande_record.niveau_requis, p.niveau) THEN 2 ELSE 0 END,
      'mots_cles_match', (SELECT COUNT(*) FROM unnest(p.centres_interet) ci WHERE demande_record.description ILIKE '%' || ci || '%'),
      'disponibilite', CASE WHEN p.statut_en_ligne THEN 2 ELSE 0 END,
      'note_bonus', CASE WHEN p.note_moyenne >= 4.5 THEN 3 WHEN p.note_moyenne >= 4.0 THEN 2 WHEN p.note_moyenne >= 3.5 THEN 1 ELSE 0 END,
      'reussite_bonus', CASE WHEN p.taux_reussite >= 80 THEN 2 WHEN p.taux_reussite >= 60 THEN 1 ELSE 0 END,
      'temps_penalty', CASE WHEN p.temps_reponse_moyen > 1440 THEN 1 ELSE 0 END
    ) as score_details
  FROM profils p
  WHERE p.role = 'mentor'
    AND p.id != demande_record.auteur_id
  ORDER BY score_total DESC, p.note_moyenne DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTIE 2: Système de Disponibilité
-- ============================================================

-- Créer la table des disponibilités des mentors
CREATE TABLE IF NOT EXISTS disponibilites_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES profils(id) ON DELETE CASCADE NOT NULL,
  jour_semaine INTEGER CHECK (jour_semaine BETWEEN 0 AND 6),
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  statut_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT heure_fin_apres_debut CHECK (heure_fin > heure_fin)
);

-- Activer RLS
ALTER TABLE disponibilites_mentors ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Mentors can view their own availability" ON disponibilites_mentors;
DROP POLICY IF EXISTS "Mentors can create their own availability" ON disponibilites_mentors;
DROP POLICY IF EXISTS "Mentors can update their own availability" ON disponibilites_mentors;
DROP POLICY IF EXISTS "Mentors can delete their own availability" ON disponibilites_mentors;
DROP POLICY IF EXISTS "Admins can view all availability" ON disponibilites_mentors;

-- Créer les policies RLS
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

CREATE POLICY "Admins can view all availability"
  ON disponibilites_mentors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profils 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Créer des index
CREATE INDEX IF NOT EXISTS idx_disponibilites_mentor_id ON disponibilites_mentors(mentor_id);
CREATE INDEX IF NOT EXISTS idx_disponibilites_jour_semaine ON disponibilites_mentors(jour_semaine);
CREATE INDEX IF NOT EXISTS idx_disponibilites_actif ON disponibilites_mentors(statut_actif) WHERE statut_actif = true;

-- Créer les fonctions de disponibilité
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
  
  UPDATE profils
  SET temps_reponse_moyen = avg_time
  WHERE id = mentor_id;
  
  RETURN avg_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTIE 3: Système de Feedback et Notation
-- ============================================================

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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE accompagnements ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes
DROP POLICY IF EXISTS "Users can view their own accompaniments" ON accompagnements;
DROP POLICY IF EXISTS "Mentors can create accompaniments" ON accompagnements;
DROP POLICY IF EXISTS "Users can update their own accompaniments" ON accompagnements;
DROP POLICY IF EXISTS "Users can delete their own accompaniments" ON accompagnements;
DROP POLICY IF EXISTS "Admins can view all accompaniments" ON accompagnements;

-- Créer les policies RLS
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE notes_mentors ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes
DROP POLICY IF EXISTS "Users can view notes for their accompaniments" ON notes_mentors;
DROP POLICY IF EXISTS "Students can create notes" ON notes_mentors;
DROP POLICY IF EXISTS "Users can view their own notes" ON notes_mentors;
DROP POLICY IF EXISTS "Admins can view all notes" ON notes_mentors;

-- Créer les policies RLS
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

CREATE POLICY "Admins can view all notes"
  ON notes_mentors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profils 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Créer des index
CREATE INDEX IF NOT EXISTS idx_accompagnements_mentor_id ON accompagnements(mentor_id);
CREATE INDEX IF NOT EXISTS idx_accompagnements_etudiant_id ON accompagnements(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_accompagnements_demande_id ON accompagnements(demande_id);
CREATE INDEX IF NOT EXISTS idx_accompagnements_statut ON accompagnements(statut);
CREATE INDEX IF NOT EXISTS idx_notes_mentors_mentor_id ON notes_mentors(mentor_id);
CREATE INDEX IF NOT EXISTS idx_notes_mentors_accompagnement_id ON notes_mentors(accompagnement_id);

-- Créer les fonctions de feedback
CREATE OR REPLACE FUNCTION update_mentor_average_rating(mentor_id UUID)
RETURNS VOID AS $$
DECLARE
  new_avg DECIMAL(3,2);
  new_count INTEGER;
BEGIN
  SELECT 
    AVG(note)::DECIMAL(3,2),
    COUNT(*)
  INTO new_avg, new_count
  FROM notes_mentors
  WHERE mentor_id = update_mentor_average_rating.mentor_id;
  
  UPDATE profils
  SET 
    note_moyenne = COALESCE(new_avg, 0),
    nombre_notes = COALESCE(new_count, 0)
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_mentor_success_rate(mentor_id UUID)
RETURNS VOID AS $$
DECLARE
  total_accompagnements INTEGER;
  successful_accompagnements INTEGER;
  new_rate DECIMAL(5,2);
BEGIN
  SELECT COUNT(*)
  INTO total_accompagnements
  FROM accompagnements
  WHERE mentor_id = update_mentor_success_rate.mentor_id
    AND statut IN ('termine', 'annule');
  
  SELECT COUNT(*)
  INTO successful_accompagnements
  FROM accompagnements
  WHERE mentor_id = update_mentor_success_rate.mentor_id
    AND statut = 'termine';
  
  IF total_accompagnements > 0 THEN
    new_rate := (successful_accompagnements::DECIMAL / total_accompagnements::DECIMAL) * 100;
  ELSE
    new_rate := 0;
  END IF;
  
  UPDATE profils
  SET taux_reussite = new_rate
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les triggers
DROP TRIGGER IF EXISTS on_note_created ON notes_mentors;
CREATE TRIGGER on_note_created
  AFTER INSERT ON notes_mentors
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_average_rating();

DROP TRIGGER IF EXISTS on_accompagnement_status_change ON accompagnements;
CREATE TRIGGER on_accompagnement_status_change
  AFTER INSERT OR UPDATE ON accompagnements
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_success_rate();

CREATE OR REPLACE FUNCTION create_accompagnement_on_proposition_acceptee()
RETURNS TRIGGER AS $$
DECLARE
  existing_accompagnement UUID;
BEGIN
  SELECT id INTO existing_accompagnement
  FROM accompagnements
  WHERE demande_id = NEW.demande_id
    AND mentor_id = NEW.mentor_id
    AND statut = 'en_cours';
  
  IF existing_accompagnement IS NULL AND NEW.statut = 'acceptee' THEN
    INSERT INTO accompagnements (demande_id, mentor_id, etudiant_id)
    SELECT 
      NEW.demande_id,
      NEW.mentor_id,
      da.auteur_id
    FROM demandes_aide da
    WHERE da.id = NEW.demande_id;
    
    UPDATE demandes_aide
    SET statut = 'en_cours'
    WHERE id = NEW.demande_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_proposition_accepted ON propositions_aide;
CREATE TRIGGER on_proposition_accepted
  AFTER UPDATE ON propositions_aide
  FOR EACH ROW
  WHEN (NEW.statut = 'acceptee' AND OLD.statut != 'acceptee')
  EXECUTE FUNCTION create_accompagnement_on_proposition_acceptee();

-- ============================================================
-- PARTIE 4: Notifications Intelligentes
-- ============================================================

-- Ajouter les nouveaux champs à la table notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type_notification') THEN
    ALTER TABLE notifications ADD COLUMN type_notification TEXT DEFAULT 'inapp' CHECK (type_notification IN ('push', 'email', 'inapp'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priorite') THEN
    ALTER TABLE notifications ADD COLUMN priorite INTEGER DEFAULT 1 CHECK (priorite BETWEEN 1 AND 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'groupe_id') THEN
    ALTER TABLE notifications ADD COLUMN groupe_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'lue') THEN
    ALTER TABLE notifications ADD COLUMN lue BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'date_lecture') THEN
    ALTER TABLE notifications ADD COLUMN date_lecture TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'categorie') THEN
    ALTER TABLE notifications ADD COLUMN categorie TEXT CHECK (categorie IN ('demande', 'proposition', 'accompagnement', 'systeme', 'rappel'));
  END IF;
END $$;

-- Créer des index
CREATE INDEX IF NOT EXISTS idx_notifications_destinataire_priorite ON notifications(destinataire_id, priorite DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_lue ON notifications(lue) WHERE lue = false;
CREATE INDEX IF NOT EXISTS idx_notifications_groupe ON notifications(groupe_id) WHERE groupe_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_categorie ON notifications(categorie);

-- Créer les fonctions de notifications
CREATE OR REPLACE FUNCTION create_grouped_notification(
  p_destinataire_id UUID,
  p_type TEXT,
  p_contenu TEXT,
  p_categorie TEXT,
  p_priorite INTEGER DEFAULT 1,
  p_groupe_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    destinataire_id,
    type,
    contenu,
    categorie,
    priorite,
    groupe_id,
    type_notification,
    lue
  ) VALUES (
    p_destinataire_id,
    p_type,
    p_contenu,
    p_categorie,
    p_priorite,
    p_groupe_id,
    'inapp',
    false
  ) RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_new_relevant_demande(
  p_mentor_id UUID,
  p_demande_id UUID,
  p_score INTEGER
) RETURNS UUID AS $$
DECLARE
  demande_titre TEXT;
  notification_id UUID;
BEGIN
  SELECT titre INTO demande_titre
  FROM demandes_aide
  WHERE id = p_demande_id;
  
  notification_id := create_grouped_notification(
    p_destinataire_id := p_mentor_id,
    p_type := 'new_demande',
    p_contenu := 'Nouvelle demande pertinente: ' || demande_titre || ' (Score: ' || p_score || ')',
    p_categorie := 'demande',
    p_priorite := 3
  );
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_new_proposition(
  p_etudiant_id UUID,
  p_demande_id UUID,
  p_mentor_nom TEXT
) RETURNS UUID AS $$
DECLARE
  demande_titre TEXT;
  notification_id UUID;
BEGIN
  SELECT titre INTO demande_titre
  FROM demandes_aide
  WHERE id = p_demande_id;
  
  notification_id := create_grouped_notification(
    p_destinataire_id := p_etudiant_id,
    p_type := 'new_proposition',
    p_contenu := 'Nouvelle proposition de ' || p_mentor_nom || ' pour: ' || demande_titre,
    p_categorie := 'proposition',
    p_priorite := 3
  );
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_notification_as_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET 
    lue = true,
    date_lecture = NOW()
  WHERE id = p_notification_id
    AND destinataire_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET 
    lue = true,
    date_lecture = NOW()
  WHERE destinataire_id = p_user_id
    AND lue = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les triggers de notifications
CREATE OR REPLACE FUNCTION trigger_notify_relevant_mentors_on_demande()
RETURNS TRIGGER AS $$
DECLARE
  mentor_record RECORD;
BEGIN
  FOR mentor_record IN 
    SELECT mentor_id, score_total
    FROM advanced_match_mentors_for_demande(NEW.id)
    WHERE score_total > 0
  LOOP
    PERFORM notify_new_relevant_demande(
      mentor_record.mentor_id,
      NEW.id,
      mentor_record.score_total
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_demande_created_notify_mentors ON demandes_aide;
CREATE TRIGGER on_demande_created_notify_mentors
  AFTER INSERT ON demandes_aide
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_relevant_mentors_on_demande();

CREATE OR REPLACE FUNCTION trigger_notify_student_on_proposition()
RETURNS TRIGGER AS $$
DECLARE
  etudiant_id UUID;
  mentor_nom TEXT;
BEGIN
  SELECT 
    da.auteur_id,
    p.nom_complet
  INTO etudiant_id, mentor_nom
  FROM demandes_aide da
  JOIN profils p ON p.id = NEW.mentor_id
  WHERE da.id = NEW.demande_id;
  
  PERFORM notify_new_proposition(etudiant_id, NEW.demande_id, mentor_nom);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_proposition_created_notify_student ON propositions_aide;
CREATE TRIGGER on_proposition_created_notify_student
  AFTER INSERT ON propositions_aide
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_student_on_proposition();

-- ============================================================
-- ACCORDER LES PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION advanced_match_mentors_for_demande(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_niveau_compatible(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_mentor_available_now(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_mentor_available_at(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION update_online_status(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_avg_response_time(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_mentor_average_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_mentor_success_rate(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_grouped_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_relevant_demande TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_proposition TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE disponibilites_mentors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE accompagnements TO authenticated;
GRANT SELECT, INSERT ON TABLE notes_mentors TO authenticated;
