# 💬 Système de Messagerie Privée - Documentation

## 🎯 Vue d'ensemble

La messagerie privée permet aux étudiants et mentors de communiquer en temps réel dans des conversations 1-à-1, initiées depuis les demandes d'aide ou les profils. 

## ✨ Fonctionnalités implémentées

### 1. Conversations 1-à-1
- Créées automatiquement à la première demande de message
- Paire unique (pas de doublons) entre deux utilisateurs
- Identifiées par `conversation_id` unique (UUID)

### 2. Liste des conversations
**URL**: `/messages`

Affiche :
- Avatar + nom du participant
- Dernier message + timestamp
- Compteur de messages non-lus
- Tri par date de dernière mise à jour

### 3. Chat en temps réel
**URL**: `/messages/[conversationId]`

Caractéristiques :
- Supabase Realtime pour les nouveaux messages
- Auto-scroll vers le dernier message
- Indicateur de lecture (✓ visible pour messages envoyés)
- Zone de saisie multi-lignes (Shift+Entrée)
- Marque automatiquement comme lus en ouvrant la conversation

### 4. Intégration avec les demandes
- Bouton "💬 Message" sur chaque proposition d'aide
- Bouton "💬 Message" pour contacter l'auteur d'une demande
- Navigation automatique vers la conversation

## 🔧 Architecture technique

### Tables Supabase

```
conversations
├── id (UUID, PK)
├── participant1_id (FK → profils)
├── participant2_id (FK → profils)
├── created_at
├── updated_at
└── constraint: unique(least(p1,p2), greatest(p1,p2))

messages
├── id (UUID, PK)
├── conversation_id (FK → conversations)
├── expediteur_id (FK → profils)
├── destinataire_id (FK → profils)
├── contenu (text)
├── lu (boolean)
└── created_at
```

### Vue : `conversations_with_last_message`

Calcule en temps réel :
- Dernier message de la conversation
- Nombre de messages non-lus pour l'utilisateur actuel
- Infos de la conversation

### Fonctions SQL

| Fonction | Rôle |
|----------|------|
| `get_or_create_conversation(user_id)` | Atomique : création ou récupération |
| `get_other_participant(conv_id)` | Détermine l'autre participant |
| `update_conversation_timestamp()` | Trigger pour updated_at |

## 🔐 Row Level Security (RLS)

### Policies `conversations`
- ✓ `SELECT` : Utilisateur est participant
- ✓ `INSERT` : Utilisateur est participant
- ✓ `UPDATE` : Utilisateur est participant

### Policies `messages`
- ✓ `SELECT` : Utilisateur est participant de la conversation
- ✓ `INSERT` : Utilisateur est auteur ET participant
- ✓ `UPDATE` : Utilisateur est participant (marquer comme lu)

## 📱 UI/UX

### Desktop
- Sidebar + Chat : 2 colonnes
- Chat en colonne 1 (liste conversations)
- Messages en colonne 2

### Mobile
- Stack vertical
- Conversations comme liste
- Chat en pleine largeur après sélection

### Composants

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `ConversationList` | `components/features/messages/ConversationList.tsx` | Liste conversations |
| `ChatWindow` | `components/features/messages/ChatWindow.tsx` | Zone affichage messages |
| `MessageInput` | `components/features/messages/MessageInput.tsx` | Input envoi message |
| `MessageBubble` | `components/features/messages/MessageBubble.tsx` | Bulle message unique |
| `MessageButton` | `components/features/messages/MessageButton.tsx` | Bouton initier conversation |

## 🚀 Utilisation

### Pour tester localement

1. **Créer 2 profils** :
   ```
   Utilisateur A : /register → /profil
   Utilisateur B : /register → /profil
   ```

2. **Depuis la page d'une demande** :
   ```
   User A publie une demande
   User B consulte la demande
   User B clique "💬 Message" → Conversation créée
   ```

3. **Échange de messages** :
   ```
   User B : écrit son premier message
   User A : voit notification (unread_count)
   User A : clique sur la conversation
   Messages marqués comme lus
   Échange en temps réel via Realtime
   ```

4. **Depuis une proposition d'aide** :
   ```
   Mentor propose son aide
   Auteur reçoit proposition
   Auteur clique "💬 Message" sur la proposition
   Conversation créée automatiquement
   ```

## 🔗 Actions serveur

```typescript
// Messagerie
- getOrCreateConversation(userId)      // Crée ou récupère
- getConversations()                   // Liste conversations
- getMessages(convId, limit?, offset?) // Messages paginés
- sendMessage(convId, contenu)         // Envoyer message
- markConversationAsRead(convId)       // Marquer comme lus
- getOtherParticipant(convId)          // Profil autre participant
```

## ⚡ Supabase Realtime

### Configuration

Implémentée dans `ChatWindow` (composant client) :

```typescript
const channel = supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => onNewMessage(payload.new)
  )
  .subscribe()
```

### Événements écoutés
- `INSERT` sur `messages` : nouveau message
- `UPDATE` sur `conversations` : changement updated_at

## 📊 Performance & Optimisation

### Optimisations implémentées
- ✅ Pagination des messages (50 par défaut)
- ✅ RLS stricte (pas de requête non-autorisée)
- ✅ Index sur conversation_id et created_at (implicite via PK/FK)
- ✅ Auto-scroll optimisé (smooth scroll)
- ✅ Réutilisation Avatar et profils

### Possible futur
- [ ] Virtualisation de liste (react-window)
- [ ] Déduplication Realtime
- [ ] Cache côté client (SWR/React Query)
- [ ] Compression messages

## 🚦 État de l'implémentation

✅ **COMPLÈTE** – MVP fonctionnel avec Realtime

### Fonctionnalités bonus possibles
- [ ] Typing indicator ("User is typing...")
- [ ] Reaction à messages (emoji)
- [ ] Partage de ressources (prompt 05)
- [ ] Messages vocaux
- [ ] Historique conversation (archivage)
- [ ] Search dans messages

## 🧪 Checklist validation

- ✅ Conversation 1-à-1 créée automatiquement
- ✅ Liste conversations avec dernier message
- ✅ Indicateur non-lu (badge count)
- ✅ Envoi texte multilignes
- ✅ Supabase Realtime temps réel
- ✅ RLS stricte (utilisateur voit ses conversations)
- ✅ Mobile-first UI
- ✅ Intégration demandes d'aide
- ✅ Intégration propositions d'aide
- ✅ Auto-scroll et marquage comme lus

---

**Date de création** : 2026-07-15  
**Version MVP** : 1.0  
**Statut** : Production-ready
