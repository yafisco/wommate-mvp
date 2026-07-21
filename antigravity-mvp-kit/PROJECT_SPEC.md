# PROJECT_SPEC.md — Spécification condensée pour l'agent IA

*Condensé à partir du Cahier des charges "Plateforme communautaire d'entraide étudiante" (I.T. YAFA, Wommate Technologie, 13/07/2026). À coller intégralement dans le chat de l'agent en début de projet.*

## Problème
Isolement académique des étudiants : entraide existante mais fragmentée (WhatsApp, Facebook, Discord), pas de mécanisme structuré de mentorat, ressources perdues dans les fils de discussion.

## Objectif principal
Concevoir/développer une plateforme communautaire permettant le partage de ressources, la mise en relation et le mentorat entre pairs étudiants.

## Acteurs
- **Étudiant** (18-28 ans) : cherche de l'aide, des ressources, une mise en relation. Usage majoritairement mobile, connectivité parfois limitée.
- **Mentor/tuteur** : étudiant avancé ou jeune diplômé volontaire.
- **Enseignant** (rôle facultatif/consultatif) : valide ou recommande des ressources.
- **Admin** : modération, gestion des comptes, animation de la communauté.

## Périmètre MVP (Must Have — à livrer en priorité)
- Inscription / connexion (email, prévoir extension réseaux sociaux plus tard)
- Création de profil étudiant (filière, niveau, centres d'intérêt)
- Mise en relation (matching besoins ↔ compétences)
- Messagerie privée
- Partage de ressources pédagogiques
- Interface d'administration / modération

## Itération suivante (Should Have)
- Forum / questions-réponses par filière
- Mentorat structuré (demande, suivi, feedback)
- Notifications

## Hors périmètre (Won't — ne jamais implémenter sans nouvelle validation)
- Application mobile native iOS/Android (le MVP est une web app responsive)
- Paiement ou rémunération des mentors
- Traduction multilingue (français uniquement au lancement)
- Intégration directe avec des LMS (Moodle, etc.)

## Modèle de données (entités clés)
Utilisateur, Profil, DemandeAide, Ressource, Message, GroupeThématique — détail dans `templates/schema_bdd.md`.

## Stack technique
- Frontend : React / Next.js, mobile-first
- Backend/DB : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Architecture 3-tiers : présentation / applicatif (Node.js / Edge Functions) / données (PostgreSQL + RLS)
- Déploiement : Vercel ou Netlify + Supabase Cloud

## Contraintes
- Protection des données personnelles (réglementation sénégalaise sur les données personnelles)
- HTTPS, mots de passe chiffrés, sessions via Supabase Auth
- Optimisé pour connectivité limitée (chargement léger, mode dégradé)
- Compatible mobile + desktop, navigateurs récents

## KPIs / critères de succès
- 200 étudiants inscrits à 3 mois
- Taux de mise en relation réussie > 70 %
- Taux de satisfaction utilisateurs tests > 80 %
- Rétention à 30 jours

## Critères de validation MVP (à tester avant livraison)
- Inscription/connexion sans erreur, mobile et desktop
- Création de profil + publication d'une demande d'aide en moins de 3 minutes
- Matching propose au moins un mentor/ressource pertinent pour 70 % des demandes
- Upload/téléchargement de fichier (≤5 Mo) en moins de 10 secondes
- Taux de satisfaction utilisateurs > 80 %
- Chargement de la plateforme < 3 secondes sur connexion mobile standard
- MVP déployé et accessible publiquement via une URL

## Planning de référence (12 semaines)
- S1-2 : Design Thinking — empathie & définition
- S3-4 : Idéation & prototypage (wireframes, Figma)
- S5-6 : Tests utilisateurs du prototype, validation du cahier des charges
- S7-8 : Sprint Scrum 1 — auth, profils, base de données, matching (Must Have)
- S9-10 : Sprint Scrum 2 — messagerie, ressources, forum, notifications (Should Have)
- S11-12 : Tests, corrections, déploiement du MVP, rapport, soutenance
