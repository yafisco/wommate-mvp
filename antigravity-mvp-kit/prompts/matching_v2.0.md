# Système de Matching V2.0 - Prompt de Développement

## 🎯 Objectif
Développer la version 2.0 du système de matching avec des fonctionnalités avancées utilisant l'IA, le machine learning et des recommandations intelligentes.

## 📋 Contexte Actuel
Le système V1.0 utilise un algorithme basique :
- Filière identique : +2 points
- Mots-clés pertinents : +1 point par correspondance
- Tri par score décroissant
- Limité à 10 mentors suggérés

## 🚀 Nouvelles Fonctionnalités V2.0

### 1. Algorithme de Scoring Avancé
**Objectif :** Implémenter un système de scoring multi-critères pondéré

**Spécifications :**
```typescript
interface AdvancedScoring {
  baseScore: number;
  filiereMatch: number;      // +3 points si filière identique
  niveauCompatible: number;   // +2 points si niveau compatible
  motsCles: number;          // +1 point par mot-clé pertinent
  disponibilite: number;     // +2 points si disponible
  noteMentor: number;        // +1 à +3 points selon note moyenne
  historiqueReussite: number; // +1 à +2 points selon historique
  tempsReponse: number;      // -1 point si temps de réponse lent
}
```

**Implémentation requise :**
- Créer une nouvelle fonction SQL `advanced_match_mentors_for_demande`
- Mettre à jour la vue `matching_stats` pour inclure les nouveaux critères
- Ajouter les champs nécessaires dans la table `profils` (note_moyenne, temps_reponse_moyen, taux_reussite)

### 2. Système de Disponibilité
**Objectif :** Permettre aux mentors de définir leur disponibilité et filtrer les demandes en conséquence

**Spécifications :**
```sql
-- Nouvelle table
CREATE TABLE disponibilites_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES profils(id) ON DELETE CASCADE,
  jour_semaine INTEGER CHECK (jour_semaine BETWEEN 0 AND 6), -- 0 = Dimanche
  heure_debut TIME,
  heure_fin TIME,
  statut_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Champs à ajouter dans profils
ALTER TABLE profils ADD COLUMN statut_en_ligne BOOLEAN DEFAULT false;
ALTER TABLE profils ADD COLUMN derniere_activite TIMESTAMPTZ;
ALTER TABLE profils ADD COLUMN temps_reponse_moyen INTEGER; -- en minutes
```

**Fonctionnalités :**
- Interface pour définir les créneaux horaires
- Indicateur de statut (en ligne/hors ligne)
- Calcul automatique du temps de réponse moyen
- Filtrage des demandes selon disponibilité

### 3. Matching par Niveau d'Études
**Objectif :** Assurer la compatibilité des niveaux d'études

**Règles de compatibilité :**
- L1 peut être aidé par L2, L3, M1, M2
- L2 peut être aidé par L3, M1, M2
- L3 peut être aidé par M1, M2
- M1 peut être aidé par M2
- M2 ne peut être aidé que par d'autres M2 ou enseignants

**Implémentation :**
```sql
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
    (niveau_etudiant = 'M2' AND niveau_mentor IN ('M2', 'enseignant'))
  );
END;
$$ LANGUAGE plpgsql;
```

### 4. Système de Feedback et Notation
**Objectif :** Permettre aux étudiants de noter les mentors après accompagnement

**Spécifications :**
```sql
-- Nouvelle table
CREATE TABLE accompagnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id UUID REFERENCES demandes_aide(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profils(id) ON DELETE CASCADE,
  etudiant_id UUID REFERENCES profils(id) ON DELETE CASCADE,
  date_debut TIMESTAMPTZ,
  date_fin TIMESTAMPTZ,
  statut TEXT DEFAULT 'en_cours', -- en_cours, termine, annule
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notes_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accompagnement_id UUID REFERENCES accompagnements(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profils(id) ON DELETE CASCADE,
  etudiant_id UUID REFERENCES profils(id) ON DELETE CASCADE,
  note INTEGER CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Champs à ajouter dans profils
ALTER TABLE profils ADD COLUMN note_moyenne DECIMAL(3,2);
ALTER TABLE profils ADD COLUMN nombre_notes INTEGER DEFAULT 0;
ALTER TABLE profils ADD COLUMN taux_reussite DECIMAL(5,2); -- % d'accompagnements réussis
```

**Fonctionnalités :**
- Interface de notation après accompagnement
- Calcul automatique de la note moyenne
- Mise à jour du taux de réussite
- Badges de qualité (mentor certifié, expert, etc.)

### 5. Notifications Intelligentes
**Objectif :** Système de notifications push intelligentes et groupées

**Spécifications :**
```sql
-- Amélioration de la table notifications
ALTER TABLE notifications ADD COLUMN type_notification TEXT; -- push, email, inapp
ALTER TABLE notifications ADD COLUMN priorite INTEGER DEFAULT 1; -- 1 = basse, 3 = haute
ALTER TABLE notifications ADD COLUMN groupe_id UUID; -- pour grouper les notifications
ALTER TABLE notifications ADD COLUMN lue BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN date_lecture TIMESTAMPTZ;
```

**Types de notifications :**
- Nouvelle demande pertinente (priorité haute)
- Nouvelle proposition reçue (priorité haute)
- Rappel demande sans réponse (priorité moyenne)
- Disponibilité mentor préféré (priorité basse)
- Notification groupée (priorité basse)

**Implémentation :**
- Utiliser Supabase Realtime pour notifications en temps réel
- Système de regroupement pour éviter le spam
- Préférences de notification par utilisateur
- Historique des notifications

### 6. IA et Machine Learning
**Objectif :** Entraîner un modèle ML sur les matchs réussis/échoués

**Spécifications :**
```python
# Exemple d'implémentation avec scikit-learn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Features pour le ML
features = [
    'filiere_match',
    'niveau_compatible',
    'mots_cles_match',
    'disponibilite',
    'note_mentor',
    'historique_reussite',
    'temps_reponse',
    'statut_en_ligne'
]

# Target
target = 'succes_matching' # 1 = succès, 0 = échec

# Entraînement du modèle
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)
```

**Implémentation requise :**
- Collecte de données sur les matchs réussis/échoués
- Entraînement régulier du modèle ML
- Intégration des prédictions dans le scoring
- Monitoring de la performance du modèle

### 7. Matching Prédictif
**Objectif :** Suggérer des mentors avant même la publication de demande

**Spécifications :**
```sql
-- Vue pour les prédictions
CREATE OR REPLACE VIEW mentor_predictions AS
SELECT 
  p.id as mentor_id,
  p.nom_complet,
  p.filiere,
  p.note_moyenne,
  p.taux_reussite,
  -- Calcul de probabilité de succès basé sur ML
  ml.predict_success_probability(p.*) as success_probability
FROM profils p
WHERE p.role = 'mentor'
ORDER BY success_probability DESC;
```

**Fonctionnalités :**
- Suggestion proactive de mentors
- Prédiction de probabilité de succès
- Alertes proactives pour les mentors
- Système de "matching anticipé"

### 8. Préférences Personnalisées
**Objectif :** Permettre aux utilisateurs de sauvegarder leurs préférences

**Spécifications :**
```sql
-- Nouvelle table
CREATE TABLE preferences_utilisateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID REFERENCES profils(id) ON DELETE CASCADE,
  filieres_preferees TEXT[], -- array de filières
  niveaux_acceptes TEXT[], -- array de niveaux
  mode_communication TEXT DEFAULT 'chat', -- chat, visio, email
  langue_preferee TEXT DEFAULT 'fr',
  fuseau_horaire TEXT,
  mentors_favoris UUID[], -- array de mentor IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fonctionnalités :**
- Filtres sauvegardés par utilisateur
- Préférences de communication
- Préférences de langue et fuseau horaire
- Historique des mentors préférés

### 9. Gamification
**Objectif :** Système de points, badges et classements pour les mentors

**Spécifications :**
```sql
-- Nouvelle table
CREATE TABLE gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID REFERENCES profils(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  niveau INTEGER DEFAULT 1,
  badges TEXT[], -- array de badges
  classement_global INTEGER,
  classement_filiere INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Champs à ajouter dans profils
ALTER TABLE profils ADD COLUMN points_gamification INTEGER DEFAULT 0;
ALTER TABLE profils ADD COLUMN niveau_gamification INTEGER DEFAULT 1;
ALTER TABLE profils ADD COLUMN badges TEXT[];
```

**Système de points :**
- +10 points pour chaque proposition acceptée
- +50 points pour chaque accompagnement terminé avec succès
- +5 points pour chaque note ≥ 4 étoiles
- +20 points pour chaque badge obtenu
- -1 point par jour d'inactivité

**Badges :**
- 🏆 Mentor Certifié (100 accompagnements réussis)
- ⭐ Expert (note moyenne ≥ 4.5)
- 🚀 Rapide (temps de réponse < 1h)
- 💎 Premium (abonnement payant)
- 🎓 Pédagogue (feedback positif > 90%)

### 10. Analytics Avancés
**Objectif :** Dashboard détaillé avec statistiques de performance

**Spécifications :**
```sql
-- Vue pour les analytics mentors
CREATE OR REPLACE VIEW mentor_analytics AS
SELECT 
  p.id as mentor_id,
  p.nom_complet,
  COUNT(DISTINCT a.id) as total_accompagnements,
  AVG(n.note) as note_moyenne,
  AVG(EXTRACT(EPOCH FROM (a.date_fin - a.date_debut))/3600) as duree_moyenne_heures,
  COUNT(CASE WHEN a.statut = 'termine' THEN 1 END) as taux_reussite,
  p.taux_reussite as taux_reussite_global,
  p.temps_reponse_moyen as temps_reponse_moyen_minutes
FROM profils p
LEFT JOIN accompagnements a ON a.mentor_id = p.id
WHERE p.role = 'mentor'
GROUP BY p.id, p.nom_complet, p.taux_reussite, p.temps_reponse_moyen;
```

**Métriques :**
- Nombre total d'accompagnements
- Note moyenne et distribution
- Taux de réponse et temps de réponse
- Taux de réussite des accompagnements
- Durée moyenne des accompagnements
- Tendance d'activité (hebdomadaire, mensuelle)

## 📊 Architecture Technique

### Mise à jour de la base de données
```sql
-- Migration principale
-- 1. Ajouter les nouvelles tables
-- 2. Ajouter les nouveaux champs dans profils
-- 3. Créer les nouvelles vues
-- 4. Créer les nouvelles fonctions SQL
-- 5. Mettre à jour les RLS policies
```

### Mise à jour de l'API
```typescript
// Nouveaux endpoints
- POST /api/matching/advanced-score
- GET /api/mentors/disponibilite/:id
- POST /api/accompagnements/terminer
- POST /api/notes/creer
- GET /api/analytics/mentor/:id
- GET /api/gamification/classement
- POST /api/preferences/sauvegarder
```

### Mise à jour des composants React
```typescript
// Nouveaux composants
- AvailabilityCalendar.tsx
- RatingSystem.tsx
- NotificationPreferences.tsx
- GamificationDashboard.tsx
- MentorAnalytics.tsx
- PreferencesPanel.tsx
```

## 🎯 Plan d'Implémentation

### Phase 1 : Fondations (2 semaines)
1. Mise à jour du schéma de base de données
2. Implémentation du scoring avancé
3. Système de disponibilité
4. Matching par niveau d'études

### Phase 2 : Feedback et Analytics (2 semaines)
1. Système de feedback et notation
2. Analytics avancés
3. Dashboard mentor
4. Notifications intelligentes

### Phase 3 : IA et Gamification (3 semaines)
1. Entraînement du modèle ML
2. Matching prédictif
3. Système de gamification
4. Préférences personnalisées

### Phase 4 : Tests et Déploiement (1 semaine)
1. Tests de performance
2. Tests utilisateur
3. Documentation
4. Déploiement en production

## 📈 KPIs de Succès

- Taux de couverture système : > 85% (objectif actuel 70%)
- Taux de propositions réelles : > 60%
- Temps de réponse moyen : < 2 heures
- Note moyenne des mentors : > 4.0
- Taux de satisfaction des étudiants : > 90%

## 🔐 Sécurité et Performance

### Sécurité
- RLS policies sur toutes les nouvelles tables
- Validation des entrées utilisateur
- Rate limiting sur les API
- Encryption des données sensibles

### Performance
- Indexation des nouvelles tables
- Caching des résultats de matching
- Optimisation des requêtes SQL
- Monitoring de la performance

---

**Version :** 2.0  
**Date de création :** 2026-07-17  
**Complexité :** Avancée  
**Durée estimée :** 8 semaines
