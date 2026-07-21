# Usecase de Test - Système de Matching V2.0

## 🎯 Objectif
Tester le système_de matching de bout en bout avec deux utilisateurs : un étudiant et un mentor.

## 👥 Participants
- **Étudiant** : `etudiant@test.com` (rôle: étudiant)
- **Mentor** : `mentor@test.com` (rôle: mentor)

---

## 📋 Préparation

### 1. Création des comptes de test
```bash
# Se connecter à Supabase
npx supabase login
npx supabase link

# Créer les utilisateurs via le dashboard Supabase ou l'API
```

### 2. Configuration des profils

**Profil Étudiant :**
- Nom : Jean Dupont
- Email : etudiant@test.com
- Rôle : étudiant
- Filière : Informatique
- Niveau : L2
- Centres d'intérêt : ["algorithmes", "structures de données", "programmation"]
- Bio : "Étudiant en L2 informatique, besoin d'aide pour les algorithmes"

**Profil Mentor :**
- Nom : Marie Martin
- Email : mentor@test.com
- Rôle : mentor
- Filière : Informatique
- Niveau : M1
- Centres d'intérêt : ["algorithmes", "structures de données", "IA", "machine learning"]
- Bio : "Mentor en M1 informatique, spécialiste en algorithmes"
- Note moyenne : 4.5 (simulée)
- Taux de réussite : 85% (simulé)
- Statut en ligne : true

---

## 🔄 Scénario de Test Complet

### Étape 1 : Connexion en tant qu'Étudiant

1. **Accéder à l'application**
   - URL : `http://localhost:3000`
   - Cliquer sur "Se connecter"
   - S'identifier avec `etudiant@test.com`

2. **Vérifier le profil**
   - Cliquer sur "Mon profil"
   - Vérifier que les informations sont correctes
   - Confirmer : Filière = Informatique, Niveau = L2

---

### Étape 2 : Publication d'une Demande d'Aide

1. **Accéder à la page des demandes**
   - Cliquer sur "Demandes d'aide" dans la navbar
   - Cliquer sur "Nouvelle demande"

2. **Remplir le formulaire**
   ```
   Titre : "Aide pour les algorithmes de tri"
   Filière : Informatique
   Niveau requis : L2
   Description : "Je ne comprends pas le fonctionnement du tri rapide (quicksort). 
                  J'ai besoin d'aide pour comprendre l'algorithme et son implémentation en Python."
   ```

3. **Publier la demande**
   - Cliquer sur "Publier"
   - Vérifier que la demande apparaît dans la liste

**Vérification attendue :**
- La demande est visible dans la liste
- Le statut est "ouverte"
- Les informations sont correctes

---

### Étape 3 : Vérification du Matching (Côté Serveur)

1. **Tester la fonction de matching**
```sql
-- Exécuter dans le SQL Editor de Supabase
SELECT * FROM advanced_match_mentors_for_demande(
  (SELECT id FROM demandes_aide ORDER BY created_at DESC LIMIT 1)
);
```

**Résultat attendu :**
- Le mentor `mentor@test.com` doit apparaître avec un score élevé
- Score attendu : ~12-13 points
  - Filière identique : +3
  - Niveau compatible : +2
  - Mots-clés (algorithmes) : +1
  - Disponibilité (en ligne) : +2
  - Note moyenne (4.5) : +3
  - Taux de réussite (85%) : +2

---

### Étape 4 : Connexion en tant que Mentor

1. **Se déconnecter**
   - Cliquer sur le nom d'utilisateur
   - Cliquer sur "Se déconnecter"

2. **Se connecter en tant que mentor**
   - Cliquer sur "Se connecter"
   - S'identifier avec `mentor@test.com`

3. **Vérifier le profil**
   - Cliquer sur "Mon profil"
   - Vérifier que le rôle est "mentor"
   - Vérifier les centres d'intérêt

---

### Étape 5 : Découverte des Demandes Pertinentes

1. **Accéder à la page de découverte**
   - Le lien "Découvrir demandes" doit apparaître dans la navbar (desktop et mobile)
   - Cliquer sur "Découvrir demandes"

2. **Vérifier les demandes affichées**
   - La demande "Aide pour les algorithmes de tri" doit apparaître
   - Elle doit être classée en premier (score le plus élevé)
   - Le score de pertinence doit être affiché

**Vérification attendue :**
- La demande de l'étudiant est visible
- Le score est affiché (ex: 12)
- Les détails de la demande sont corrects

---

### Étape 6 : Vérification des Notifications

1. **Vérifier la cloche de notification**
   - L'icône de cloche doit afficher un badge "1"
   - Cliquer sur la cloche

2. **Vérifier le contenu de la notification**
   - La notification doit mentionner : "Nouvelle demande pertinente: Aide pour les algorithmes de tri (Score: 12)"
   - La priorité doit être "haute"
   - La catégorie doit être "demande"

**Vérification attendue :**
- Notification reçue automatiquement
- Contenu correct
- Priorité haute

---

### Étape 7 : Proposition d'Aide

1. **Cliquer sur la demande**
   - Cliquer sur "Aide pour les algorithmes de tri"
   - Voir les détails de la demande

2. **Proposer son aide**
   - Cliquer sur "Proposer"
   - Ajouter un message (optionnel) :
     ```
     "Je peux t'aider avec le tri rapide. C'est un algorithme très important 
                     en informatique. On peut faire une session de visio pour 
                     t'expliquer le fonctionnement étape par étape."
     ```
   - Cliquer sur "Envoyer la proposition"

**Vérification attendue :**
- La proposition est créée
- Le statut est "en_attente"
- Un message de confirmation apparaît

---

### Étape 8 : Vérification de la Notification (Côté Étudiant)

1. **Se déconnecter et se reconnecter en tant qu'étudiant**
   - Se déconnecter
   - Se connecter avec `etudiant@test.com`

2. **Vérifier les notifications**
   - Cliquer sur la cloche de notification
   - La notification doit mentionner : "Nouvelle proposition de Marie Martin pour: Aide pour les algorithmes de tri"

**Vérification attendue :**
- Notification reçue automatiquement
- Le nom du mentor est correct
- Le titre de la demande est correct

---

### Étape 9 : Consultation des Propositions

1. **Accéder à la demande**
   - Cliquer sur "Demandes d'aide"
   - Cliquer sur "Aide pour les algorithmes de tri"

2. **Vérifier la section "Accompagnements proposés"**
   - La proposition de Marie Martin doit apparaître
   - Le message d'accompagnement doit être visible
   - Le statut est "en_attente"

**Vérification attendue :**
- La proposition est visible
- Les détails sont corrects
- Le statut est "en_attente"

---

### Étape 10 : Acceptation de la Proposition

1. **Accepter la proposition**
   - Cliquer sur "Accepter" sur la proposition de Marie Martin
   - Confirmer l'acceptation

2. **Vérifier le changement de statut**
   - Le statut de la demande passe à "en_cours"
   - Le statut de la proposition passe à "acceptee"
   - Un accompagnement est créé automatiquement

**Vérification attendue :**
- Statut demande : "en_cours"
- Statut proposition : "acceptee"
- Accommpagnement créé

---

### Étape 11 : Vérification de l'Accompagnement

1. **Vérifier la table accompagnements**
```sql
-- Exécuter dans le SQL Editor de Supabase
SELECT * FROM accompagnements 
WHERE demande_id = (SELECT id FROM demandes_aide ORDER BY created_at DESC LIMIT 1);
```

**Résultat attendu :**
- Un enregistrement d'accompagnement existe
- mentor_id = ID du mentor
- etudiant_id = ID de l'étudiant
- statut = "en_cours"
- date_debut = maintenant

---

### Étape 12 : Communication via Messagerie

1. **Accéder à la messagerie**
   - Cliquer sur "Messages" dans la navbar
   - Une conversation doit être créée automatiquement

2. **Envoyer un message**
   - Étudiant : "Merci d'avoir accepté ! Quand pouvons-nous faire la session ?"
   - Mentor : "Je suis disponible demain à 14h. Ça te va ?"

**Vérification attendue :**
- La conversation est visible
- Les messages s'affichent en temps réel
- Les notifications fonctionnent

---

### Étape 13 : Fin de l'Accompagnement

1. **Marquer l'accompagnement comme terminé**
```sql
-- Exécuter dans le SQL Editor de Supabase
UPDATE accompagnements 
SET statut = 'termine', date_fin = NOW()
WHERE id = (SELECT id FROM accompagnements ORDER BY created_at DESC LIMIT 1);
```

2. **Vérifier le statut**
   - Le statut de la demande passe à "resolue"
   - Le taux de réussite du mentor est mis à jour

**Vérification attendue :**
- Statut accompagnement : "termine"
- Statut demande : "resolue"
- Taux de réussite mentor mis à jour

---

### Étape 14 : Notation du Mentor

1. **Noter le mentor**
   - Accéder à la page de l'accompagnement terminé
   - Cliquer sur "Noter le mentor"
   - Attribuer une note : 5 étoiles
   - Ajouter un commentaire : "Excellent mentor, très pédagogue !"

2. **Vérifier la mise à jour**
```sql
-- Exécuter dans le SQL Editor de Supabase
SELECT note_moyenne, nombre_notes FROM profils 
WHERE email = 'mentor@test.com';
```

**Résultat attendu :**
- note_moyenne : 5.0
- nombre_notes : 1

---

### Étape 15 : Vérification de l'Impact sur les Futurs Matchings

1. **Créer une nouvelle demande**
   - Se connecter en tant qu'étudiant
   - Créer une nouvelle demande similaire

2. **Vérifier le score du mentor**
```sql
-- Exécuter dans le SQL Editor de Supabase
SELECT * FROM advanced_match_mentors_for_demande(
  (SELECT id FROM demandes_aide ORDER BY created_at DESC LIMIT 1)
);
```

**Résultat attendu :**
- Le mentor a maintenant un score encore plus élevé
- Note moyenne 5.0 → +3 points (au lieu de +3 pour 4.5)
- Taux de réussite 100% → +2 points (au lieu de +2 pour 85%)

---

## 📊 Checklist de Validation

- [ ] Étudiant peut se connecter
- [ ] Étudiant peut publier une demande
- [ ] Fonction de matching fonctionne correctement
- [ ] Mentor peut se connecter
- [ ] Lien "Découvrir demandes" visible pour les mentors
- [ ] Mentor voit les demandes pertinentes
- [ ] Notifications automatiques fonctionnent
- [ ] Mentor peut proposer son aide
- [ ] Étudiant reçoit la notification de proposition
- [ ] Étudiant peut accepter la proposition
- [ ] Accommpagnement créé automatiquement
- [ ] Messagerie fonctionne
- [ ] Accommpagnement peut être terminé
- [ ] Système de notation fonctionne
- [ ] Note moyenne mise à jour
- [ ] Taux de réussite mis à jour
- [ ] Impact visible sur les futurs matchings

---

## 🐛 Dépannage

### Problème : Le lien "Découvrir demandes" n'apparaît pas
**Solution :**
- Vérifier que le rôle de l'utilisateur est bien "mentor"
- Rafraîchir la page
- Vérifier les logs de la console

### Problème : Aucune notification reçue
**Solution :**
- Vérifier que les triggers sont actifs
- Vérifier la table `notifications`
- Vérifier que Supabase Realtime est activé

### Problème : Score de matching incorrect
**Solution :**
- Vérifier que les champs du profil sont remplis
- Vérifier que la fonction `advanced_match_mentors_for_demande` existe
- Exécuter la fonction manuellement pour voir les détails du score

### Problème : Accommpagnement non créé
**Solution :**
- Vérifier le trigger `on_proposition_accepted`
- Vérifier que le statut de la proposition est bien "acceptee"
- Vérifier les logs de la base de données

---

## 📈 Résultats Attendus

Après ce test complet, vous devez avoir :

1. **Un système de matching fonctionnel** avec scoring avancé
2. **Des notifications automatiques** pour les mentors et étudiants
3. **Un workflow complet** de demande → proposition → acceptation → accompagnement
4. **Un système de notation** qui impacte les futurs matchings
5. **Une interface utilisateur** intuitive pour les deux rôles

---

**Date de création :** 2026-07-17  
**Version :** 1.0  
**Complexité :** Moyenne  
**Durée estimée :** 30-45 minutes
