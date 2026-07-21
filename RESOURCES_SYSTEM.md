# 📚 Système de Partage de Ressources Pédagogiques - Documentation

## 🎯 Vue d'ensemble

Le module de partage de ressources permet aux étudiants de partager et consulter des ressources pédagogiques (PDF, documents, liens) classées par filière avec recherche par mots-clés.

## ✨ Fonctionnalités implémentées

### 1. Upload de ressources
**URL**: `/ressources` (formulaire sticky)

Modes d'upload :
- **📁 Fichier** : Upload direct (max 5 Mo)
- **🔗 Lien** : Partager une URL externe

Types acceptés :
- **Documents** : PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT, TXT, CSV
- **Média** : MP4, JPG, JPEG, PNG, GIF
- **Archives** : ZIP

Validation :
- ✅ Client : type + taille (avant upload)
- ✅ Serveur : validation double pour sécurité

### 2. Barre de progression
- Upload : affichage en temps réel (30% → 100%)
- Téléchargement : barre visuelle + pourcentage

### 3. Liste des ressources
**URL**: `/ressources`

Affiche :
- Grille responsive 1/2/3 colonnes
- Filtre par filière (dropdown)
- Recherche texte (titre + description)
- Tri : récentes en premier

Info par ressource :
- Icône type fichier (📄📝📊🎬🖼️)
- Titre + Description (preview)
- Auteur + Filière
- Taille fichier + Date création
- Compteur téléchargements

### 4. Détail ressource
**URL**: `/ressources/[id]`

Affiche :
- Titre + Description complète
- Icône + Métadonnées fichier
- Bouton download (génère URL signée 10s)
- Info auteur + Date + Stats downloads
- ✅ Suppression (pour auteur)

### 5. Téléchargement optimisé
- URL signée 10 secondes (Supabase)
- Incrémente compteur downloads
- Barre de progression
- Support fichiers larges

## 🔧 Architecture technique

### Supabase Storage

```
Bucket: ressources-pedagogiques
├── Structure: ressources/[userId]/[timestamp]_[filename]
├── ACL: RLS via policies
└── CORS: Configuré pour downloads
```

### Tables & Colonnes

```
ressources
├── id (UUID, PK)
├── auteur_id (FK → profils)
├── titre (text, NOT NULL)
├── description (text)
├── filiere (text)
├── type (fichier | lien)
├── url (text - chemin Storage ou URL)
├── storage_path (text - chemin Storage)
├── taille_octets (bigint - taille fichier)
├── download_count (int, default 0)
└── created_at (timestamptz)
```

### Vue : `ressources_with_author`

Joint avec `profils` pour afficher :
- Nom auteur
- Filière auteur
- Niveau auteur

### Index pour performance

```sql
- idx_ressources_filiere (recherche rapide par filière)
- idx_ressources_titre (recherche texte)
- idx_ressources_auteur (mes ressources)
- idx_ressources_created_at (tri par date)
```

### Fonctions SQL

| Fonction | Rôle |
|----------|------|
| `increment_download_count(resource_id)` | +1 downloads |
| `get_signed_download_url(resource_id)` | Retourne path pour URL signée |

## 🔐 Row Level Security (RLS)

### Policies `ressources`
- ✓ `SELECT` : Public (lecture pour tous)
- ✓ `INSERT` : Auteur authentifié
- ✓ `UPDATE` : Auteur de la ressource
- ✓ `DELETE` : Auteur de la ressource

## 📱 UI/UX

### Layout

**Desktop**:
- Sidebar upload (sticky, 1 col)
- Grille ressources 3 colonnes

**Mobile**:
- Upload form full width
- Grille ressources 1 colonne

### Composants

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `ResourceUploadForm` | `components/features/ressources/ResourceUploadForm.tsx` | Form upload fichier/lien + progress |
| `ResourceCard` | `components/features/ressources/ResourceCard.tsx` | Card ressource (grille) |
| `ResourceList` | `components/features/ressources/ResourceList.tsx` | Grille + filtres |
| `ResourceDownloadButton` | `components/features/ressources/ResourceDownloadButton.tsx` | Bouton DL + progress |
| `ResourceDeleteButton` | `components/features/ressources/ResourceDeleteButton.tsx` | Bouton suppression avec confirm |

### Utilitaires

| Fonction | Fichier | Rôle |
|----------|---------|------|
| `validateFile()` | `lib/utils/fileValidation.ts` | Valide type + taille |
| `validateFileType()` | — | Valide extension + MIME |
| `validateFileSize()` | — | Valide taille < 5 Mo |
| `formatFileSize()` | — | Format lisible (B/KB/MB) |
| `getFileIcon()` | — | Icône par type |
| `generateStoragePath()` | — | Path unique timestampé |

## 🚀 Utilisation

### Pour tester localement

1. **Créer un profil** :
   ```
   /register → /profil (remplir filière)
   ```

2. **Uploader une ressource** :
   ```
   /ressources → Formulaire "Partager une ressource"
   - Mode: Fichier
   - Sélectionner un PDF/DOCX
   - Titre: "Fiche révision Maths L2"
   - Filière: Mathématiques
   - Description: (optionnel)
   - Cliquer "Partager la ressource"
   ```

3. **Voir dans la liste** :
   ```
   /ressources → Ressource apparaît avec icône 📄
   ```

4. **Consulter détail** :
   ```
   Cliquer sur la ressource
   /ressources/[id] → Vue détail
   ```

5. **Télécharger** :
   ```
   Bouton "⬇️ Télécharger le fichier"
   → Barre progression
   → Fichier sauvegardé
   → Compteur +1 download
   ```

6. **Filtrer** :
   ```
   Dropdown "Filtrer par filière"
   Search "Mots-clés"
   ```

## ⚡ Optimisations implémentées

| Optimisation | Tech |
|--------------|------|
| URL signées | Supabase (10s) |
| Validation client | Avant upload |
| Validation serveur | Double check sécurité |
| Compression | Support GZIP natif |
| Cache | HTTP headers (3600s) |
| Index BD | Sur colonnes critiques |
| Progress bar | ProgressEvent natif |

## 📊 Performances

- ✅ Upload < 10 secondes (fichiers 5 Mo)
- ✅ Download < 10 secondes (fichiers 5 Mo)
- ✅ Liste chargement rapide (index + pagination futur)
- ✅ Search instant (côté client MVP)

## 🧪 Checklist validation

- ✅ Upload fichier max 5 Mo
- ✅ Types acceptés (PDF, DOCX, etc.)
- ✅ Validation client + serveur
- ✅ Barre de progression upload/download
- ✅ Performance < 10 secondes
- ✅ Classement par filière
- ✅ Recherche par mots-clés
- ✅ Page détail avec download
- ✅ RLS stricte (lecture public, écriture auteur)
- ✅ Compteur téléchargements
- ✅ Suppression (auteur)
- ✅ UI mobile-first

## 🔗 Actions serveur

```typescript
// Ressources
- getRessources(filiere?, search?, limit?, offset?)
- getRessourceById(id)
- uploadRessource(formData)           // Fichier + validation
- createLinkRessource(formData)       // Lien externe
- getDownloadUrl(ressourceId)         // URL signée 10s
- deleteRessource(ressourceId)        // Auteur seulement
- getMyRessources()                   // Mes ressources
```

## 🚦 État de l'implémentation

✅ **COMPLÈTE** – MVP full-featured

### Fonctionnalités bonus possibles
- [ ] Catégories / Tags
- [ ] Notation ressources
- [ ] Commentaires
- [ ] Partage direct via message
- [ ] Duplicate detection (hash)
- [ ] Compression automatique
- [ ] Conversion formats
- [ ] API public (RSS feed)

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| Upload échoue | Vérifier taille < 5 Mo + type accepté |
| Téléchargement expire | URL signée 10s max (design intentionnel) |
| Fichier pas visible | Vérifier RLS + refresh page |
| Storage full | Monitorer utilisation Supabase |

---

**Date de création** : 2026-07-15  
**Version MVP** : 1.0  
**Statut** : Production-ready
