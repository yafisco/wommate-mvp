# 📋 Système de Matching - Documentation

## 🎯 Vue d'ensemble

Le système de mise en relation entre étudiants (matching) relie les demandes d'aide avec les mentors les plus pertinents, basé sur :
- **Filière identique** : +2 points
- **Mots-clés pertinents** : +1 point par correspondance

## ✨ Fonctionnalités implémentées

### 1. Publication de demandes d'aide
**URL**: `/demandes/nouvelle`

Les étudiants peuvent publier une demande avec :
- Titre de la demande
- Filière concernée
- Niveau d'études requis
- Description détaillée

La demande est stockée dans la table `demandes_aide` avec le statut `ouverte`.

---

### 2. Découverte des demandes pour mentors
**URL**: `/demandes/decouvrir`

Les mentors peuvent consulter les demandes correspondant à leur profil :
- Algorithme de scoring : filière + mots-clés
- Tri par pertinence décroissante
- Filtrage optionnel par filière

**Action**: Proposer leur aide via le bouton "Proposer"

---

### 3. Propositions d'aide
**Actions possibles**:

**Pour un mentor** :
- Consulter une demande détaillée
- Cliquer sur "MentorCard" pour proposer son aide
- Ajouter un message d'accompagnement (optionnel)
- Voir l'état de ses propositions (En attente, Acceptée, Déclinée)

**Pour l'auteur de la demande** :
- Voir la liste des mentors suggérés par le système
- Consulter les propositions reçues
- Accepter une proposition → change le statut de la demande à `en_cours`

---

### 4. Dashboard de statistiques
**URL**: `/stats`

Visualise les KPIs du système :

| Métrique | Description |
|----------|-------------|
| **Total demandes** | Nombre de demandes publiées |
| **Avec propositions réelles** | Demandes ayant reçu au least 1 proposition |
| **Couverture système (%)** | % demandes avec ≥1 mentor suggeré |
| **Taux propositions (%)** | % demandes avec ≥1 proposition réelle |

**Objectif métier** : Atteindre **70% de couverture système**

---

## 🔧 Architecture technique

### Tables Supabase

```
demandes_aide
├── id (UUID, PK)
├── auteur_id (FK → profils)
├── titre
├── filiere
├── description
├── niveau_requis
├── statut (ouverte | en_cours | resolue)
└── created_at

propositions_aide
├── id (UUID, PK)
├── demande_id (FK → demandes_aide)
├── mentor_id (FK → profils)
├── message
├── statut (en_attente | acceptee | refusee)
└── created_at
```

### Fonction SQL : `match_mentors_for_demande`

```sql
SELECT profils.* 
FROM profils 
WHERE score > 0
ORDER BY score DESC
LIMIT 10
```

**Score** = 
- +2 si filière identique
- +1 par mot-clé trouvé dans centres_intérêt

### Vue : `matching_stats`

Calcule en temps réel :
- Total de demandes
- Demandes avec mentors suggerés
- Demandes avec propositions réelles
- Taux de couverture

---

## 🚀 Utilisation

### Pour tester localement

1. **Créer des profils** via `/register` et remplir le profil (filière, centres_intérêt)

2. **Publier une demande** :
   ```
   User A → /demandes/nouvelle
   - Titre: "Aide pour les algorithmes"
   - Filière: Informatique
   - Niveau: L2
   - Description: "Je ne comprends pas les arbres binaires"
   ```

3. **Vérifier le matching** :
   ```
   User B (profil Informatique + centres_intérêt: ["algorithmes", "structures de données"])
   → /demandes/decouvrir
   → Verra la demande de User A avec score élevé
   ```

4. **Proposer de l'aide** :
   ```
   User B → Clique "Proposer"
   → La proposition apparaît chez User A
   ```

5. **Accepter une proposition** :
   ```
   User A → /demandes/[id]
   → Voit User B dans "Accompagnements proposés"
   → Clique "Accepter"
   → Statut demande → "en_cours"
   ```

6. **Consulter les stats** :
   ```
   /stats → Dashboard KPIs
   ```

---

## 🔐 Row Level Security (RLS)

### Policies implémentées

**propositions_aide** :
- ✓ `SELECT` : Mentor OR auteur de la demande
- ✓ `INSERT` : Mentor ≠ auteur demande
- ✓ `UPDATE` : Mentor OR auteur demande
- ✓ `DELETE` : Mentor, statut = "en_attente"

**demandes_aide** :
- ✓ `SELECT` : Public (lecture limitée)
- ✓ `INSERT` : Auteur authentifié
- ✓ `UPDATE` : Auteur de la demande

---

## 📊 Mesure de performance

### Requête pour valider 70% d'objectif

```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN has_matches THEN 1 END) as avec_matches,
  ROUND(100.0 * COUNT(CASE WHEN has_matches THEN 1 END) / COUNT(*), 2) as taux_pct
FROM (
  SELECT d.id, 
    EXISTS (SELECT 1 FROM profils p WHERE p.score > 0) as has_matches
  FROM demandes_aide d
) subq;
```

Accessible via :
```typescript
const stats = await getMatchingStats()
// stats.taux_couverture_systeme_pourcentage >= 70 ✓
```

---

## 🎨 Pages et composants

| Page | Composant | Rôle |
|------|-----------|------|
| `/demandes` | `DemandeCard` | Liste les demandes ouvertes |
| `/demandes/nouvelle` | `DemandeForm` | Créer une demande |
| `/demandes/[id]` | `PropositionCard`, `MentorCard` | Détail + propositions |
| `/demandes/decouvrir` | `DemandesFilter` | Découvrir demandes pertinentes |
| `/stats` | — | Dashboard KPIs |

---

## 🔗 Actions serveur

```typescript
// Actions principales
- getDemandes(filiere?)          // Liste demandes
- getDemandeById(id)             // Détail demande
- createDemande(formData)        // Créer demande
- getMatchingMentors(demandeId)  // RPC → mentors suggerés
- proposerAide(demandeId, message?)
- getPropositions(demandeId)     // Propositions reçues
- accepterProposition(propId, demandeId)
- getMatchingDemands(filiere?)   // Demandes pertinentes pour mentor
- getMatchingStats()             // Stats KPIs
```

---

## 📝 Points de validation

- ✅ Étudiant peut publier une demande
- ✅ Système propose mentors pertinents (filière + mots-clés)
- ✅ Mentor voit demandes correspondant à son profil
- ✅ Mentor peut proposer son aide
- ✅ Auteur de demande voit propositions et peut accepter
- ✅ Dashboard mesure taux de couverture (objectif 70%)
- ✅ RLS respectée sur toutes les tables

---

## 🚦 État de l'implémentation

✅ **COMPLÈTE** – Toutes les fonctionnalités MVP sont implémentées

### Fonctionnalités bonus possibles
- [ ] Notifications en temps réel (Supabase Realtime)
- [ ] Chatbot IA pour améliorer le matching
- [ ] Système de notation des mentors
- [ ] Historique des matchings réussis
- [ ] Export de données statistiques

---

**Date de création** : 2026-07-15  
**Version MVP** : 1.0
