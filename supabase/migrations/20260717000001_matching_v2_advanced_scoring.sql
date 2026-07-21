-- Migration: Matching V2.0 - Scoring Avancé
-- Fichier: supabase/migrations/20260717000001_matching_v2_advanced_scoring.sql

-- Ajouter les champs nécessaires dans la table profils pour le scoring avancé
ALTER TABLE profils 
ADD COLUMN IF NOT EXISTS note_moyenne DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS nombre_notes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS temps_reponse_moyen INTEGER DEFAULT 0, -- en minutes
ADD COLUMN IF NOT EXISTS taux_reussite DECIMAL(5,2) DEFAULT 0, -- % d'accompagnements réussis
ADD COLUMN IF NOT EXISTS statut_en_ligne BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS derniere_activite TIMESTAMPTZ;

-- Créer la fonction de vérification de compatibilité des niveaux
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

-- Créer la fonction de scoring avancé
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

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION advanced_match_mentors_for_demande(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_niveau_compatible(TEXT, TEXT) TO authenticated;
