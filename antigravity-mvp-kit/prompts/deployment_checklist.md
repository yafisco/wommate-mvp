# Checklist Pré-Déploiement - Wommate

## 📋 ÉTAPES OBLIGATOIRES (Avant déploiement)

### 1. Variables d'Environnement

Créez un fichier `.env.local` avec les variables suivantes :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://imdejfxjhmacnbnfmzgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme

# Optionnel pour OAuth (si vous voulez l'activer)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=votre_github_client_id
```

**Pour trouver la clé anon :**
1. Allez sur https://supabase.com/dashboard/project/imdejfxjhmacnbnfmzgp/settings/api
2. Copiez "anon public key"

### 2. Configurer le Template Email Supabase

1. Allez sur https://supabase.com/dashboard/project/imdejfxjhmacnbnfmzgp/auth/templates
2. Modifiez le template **"Reset Password"**
3. Copiez le contenu depuis `antigravity-mvp-kit/prompts/password_reset_guide.md`
4. Sauvegardez

### 3. Vérifier les Migrations

```bash
npx supabase migration list
```

Si des migrations sont en attente (Local changes) :
```bash
npx supabase db push
```

### 4. Build de Production

```bash
npm run build
```

Si le build échoue, corrigez les erreurs avant de continuer.

### 5. Test Local en Mode Production

```bash
npm run start
```

Testez :
- Connexion/inscription
- Réinitialisation mot de passe
- Création de profil
- Publication de demande
- Forum

---

## 🚀 DÉPLOIEMENT SUR VERCEL

### Étape 1 : Créer un compte Vercel

1. Allez sur https://vercel.com/signup
2. Connectez-vous avec votre compte GitHub

### Étape 2 : Importer le projet

1. Cliquez sur "Add New Project"
2. Sélectionnez votre repo GitHub `wommate-mvp`
3. Vercel détectera automatiquement Next.js

### Étape 3 : Configurer les Variables d'Environnement

Dans Vercel, allez dans **Settings** → **Environment Variables** et ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL = https://imdejfxjhmacnbnfmzgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = votre_cle_anonyme
```

### Étape 4 : Déployer

1. Cliquez sur "Deploy"
2. Attendez le build (2-3 minutes)
3. Votre app sera disponible sur `https://votre-projet.vercel.app`

### Étape 5 : Configurer le Domaine (Optionnel)

1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé (ex: wommate.com)
3. Suivez les instructions DNS

---

## 🔒 CONFIGURATION SUPABASE POUR PRODUCTION

### Ajouter l'URL de Production aux Allowed URLs

1. Allez sur https://supabase.com/dashboard/project/imdejfxjhmacnbnfmzgp/auth/url-configuration
2. Ajoutez votre URL Vercel dans **Site URL** et **Redirect URLs**
3. Exemple: `https://wommate.vercel.app`

### Configurer OAuth (Optionnel)

Si vous voulez activer Google/GitHub login :

1. **Google OAuth** :
   - Créez une app sur https://console.cloud.google.com
   - Redirect URI: `https://imdejfxjhmacnbnfmzgp.supabase.co/auth/v1/callback`
   - Ajoutez Client ID et Secret dans Supabase

2. **GitHub OAuth** :
   - Créez une app sur https://github.com/settings/developers
   - Authorization callback: `https://imdejfxjhmacnbnfmzgp.supabase.co/auth/v1/callback`
   - Ajoutez Client ID et Secret dans Supabase

---

## ⚡ OPTIMISATIONS RECOMMANDÉES

### 1. Activer la Compression

Vercel compresse automatiquement les fichiers, mais vérifiez dans `next.config.js` :

```javascript
module.exports = {
  compress: true,
}
```

### 2. Optimiser les Images

Utilisez `next/image` pour toutes les images avec `loading="lazy"`

### 3. Activer le Cache

Vercel cache automatiquement les assets statiques

### 4. Monitoring

Activez Vercel Analytics pour suivre les performances

---

## 🧪 TESTS POST-DÉPLOIEMENT

Après déploiement, testez :

- [ ] Page d'accueil charge
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Mot de passe oublié fonctionne
- [ ] Création de profil fonctionne
- [ ] Publication de demande fonctionne
- [ ] Forum fonctionne
- [ ] Navigation mobile OK
- [ ] Pas d'erreurs dans console

---

## 📊 MONITORING

### Vercel Dashboard

- Vérifiez les logs dans **Deployments**
- Surveillez les erreurs 4xx/5xx
- Vérifiez le temps de build

### Supabase Dashboard

- Surveillez l'utilisation de la database
- Vérifiez les logs auth
- Surveillez les requêtes API

---

## 🚨 DERNIÈRES VÉRIFICATIONS

Avant de communiquer l'URL :

1. **Sécurité** : Vérifiez que RLS est actif sur toutes les tables
2. **Performance** : Testez sur mobile (chargement < 3 sec)
3. **SEO** : Vérifiez les meta tags
4. **Email** : Testez l'envoi d'email de réinitialisation
5. **Backup** : Vérifiez que Supabase backup est activé

---

## 📞 SUPPORT EN CAS DE PROBLÈME

- **Vercel** : https://vercel.com/docs
- **Supabase** : https://supabase.com/docs
- **Next.js** : https://nextjs.org/docs
