-- Migration: Matching V2.0 - Notifications Intelligentes
-- Fichier: supabase/migrations/20260717000004_matching_v2_notifications.sql

-- Améliorer la table notifications existante avec de nouveaux champs
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS type_notification TEXT DEFAULT 'inapp' CHECK (type_notification IN ('push', 'email', 'inapp')),
ADD COLUMN IF NOT EXISTS priorite INTEGER DEFAULT 1 CHECK (priorite BETWEEN 1 AND 3), -- 1 = basse, 2 = moyenne, 3 = haute
ADD COLUMN IF NOT EXISTS groupe_id UUID,
ADD COLUMN IF NOT EXISTS lue BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS date_lecture TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS categorie TEXT CHECK (categorie IN ('demande', 'proposition', 'accompagnement', 'systeme', 'rappel'));

-- Créer un index pour optimiser les requêtes de notifications
CREATE INDEX IF NOT EXISTS idx_notifications_destinataire_priorite ON notifications(destinataire_id, priorite DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_lue ON notifications(lue) WHERE lue = false;
CREATE INDEX IF NOT EXISTS idx_notifications_groupe ON notifications(groupe_id) WHERE groupe_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_categorie ON notifications(categorie);

-- Fonction pour créer une notification groupée
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

-- Fonction pour créer une notification de nouvelle demande pertinente
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
    p_priorite := 3 -- Haute priorité
  );
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une notification de nouvelle proposition
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
    p_priorite := 3 -- Haute priorité
  );
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un rappel de demande sans réponse
CREATE OR REPLACE FUNCTION notify_demande_no_response(
  p_mentor_id UUID,
  p_demande_id UUID
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
    p_type := 'rappel_demande',
    p_contenu := 'Rappel: Demande "' || demande_titre || '" toujours sans réponse',
    p_categorie := 'rappel',
    p_priorite := 2 -- Priorité moyenne
  );
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer une notification comme lue
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

-- Fonction pour marquer toutes les notifications d'un utilisateur comme lues
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

-- Fonction pour grouper les notifications similaires
CREATE OR REPLACE FUNCTION group_similar_notifications(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  grouped_count INTEGER := 0;
BEGIN
  -- Grouper les notifications de nouvelles demandes
  WITH grouped_demandes AS (
    SELECT 
      destinataire_id,
      type,
      categorie,
      COUNT(*) as count,
      MIN(id) as first_id,
      MAX(created_at) as latest_created
    FROM notifications
    WHERE destinataire_id = p_user_id
      AND type = 'new_demande'
      AND lue = false
      AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY destinataire_id, type, categorie
    HAVING COUNT(*) > 1
  )
  UPDATE notifications n
  SET 
    contenu = 'Vous avez ' || gd.count || ' nouvelles demandes pertinentes',
    groupe_id = gd.first_id
  FROM grouped_demandes gd
  WHERE n.destinataire_id = gd.destinataire_id
    AND n.type = gd.type
    AND n.categorie = gd.categorie
    AND n.lue = false
    AND n.created_at > NOW() - INTERVAL '1 hour'
    AND n.id != gd.first_id;
  
  GET DIAGNOSTICS grouped_count = ROW_COUNT;
  RETURN grouped_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour les notifications non lues avec priorité
CREATE OR REPLACE VIEW unread_notifications_priority AS
SELECT 
  n.*,
  p.nom_complet as destinataire_nom
FROM notifications n
JOIN profils p ON n.destinataire_id = p.id
WHERE n.lue = false
ORDER BY n.priorite DESC, n.created_at DESC;

-- Trigger pour notifier automatiquement les mentors quand une nouvelle demande pertinente est créée
CREATE OR REPLACE FUNCTION trigger_notify_relevant_mentors_on_demande()
RETURNS TRIGGER AS $$
DECLARE
  mentor_record RECORD;
BEGIN
  -- Pour chaque mentor pertinent (score > 0)
  FOR mentor_record IN 
    SELECT mentor_id, score_total
    FROM advanced_match_mentors_for_demande(NEW.id)
    WHERE score_total > 0
  LOOP
    -- Créer une notification
    PERFORM notify_new_relevant_demande(
      mentor_record.mentor_id,
      NEW.id,
      mentor_record.score_total
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur demandes_aide
DROP TRIGGER IF EXISTS on_demande_created_notify_mentors ON demandes_aide;
CREATE TRIGGER on_demande_created_notify_mentors
  AFTER INSERT ON demandes_aide
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_relevant_mentors_on_demande();

-- Trigger pour notifier l'étudiant quand une nouvelle proposition est créée
CREATE OR REPLACE FUNCTION trigger_notify_student_on_proposition()
RETURNS TRIGGER AS $$
DECLARE
  etudiant_id UUID;
  mentor_nom TEXT;
BEGIN
  -- Récupérer l'ID de l'étudiant et le nom du mentor
  SELECT 
    da.auteur_id,
    p.nom_complet
  INTO etudiant_id, mentor_nom
  FROM demandes_aide da
  JOIN profils p ON p.id = NEW.mentor_id
  WHERE da.id = NEW.demande_id;
  
  -- Créer une notification
  PERFORM notify_new_proposition(etudiant_id, NEW.demande_id, mentor_nom);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur propositions_aide
DROP TRIGGER IF EXISTS on_proposition_created_notify_student ON propositions_aide;
CREATE TRIGGER on_proposition_created_notify_student
  AFTER INSERT ON propositions_aide
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_student_on_proposition();

-- Fonction pour nettoyer les anciennes notifications (plus de 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND lue = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION create_grouped_notification TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_relevant_demande TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_proposition TO authenticated;
GRANT EXECUTE ON FUNCTION notify_demande_no_response TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION group_similar_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications TO authenticated;
GRANT SELECT ON VIEW unread_notifications_priority TO authenticated;
