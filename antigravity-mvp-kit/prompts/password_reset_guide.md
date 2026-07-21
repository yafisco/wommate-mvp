# Guide Configuration Email Réinitialisation Mot de Passe

## Étape 1 : Accéder au Dashboard Supabase

1. Connectez-vous à votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet : `imdejfxjhmacnbnfmzgp`
3. Allez dans **Authentication** → **Email Templates**

## Étape 2 : Configurer le Template "Reset Password"

Dans la section Email Templates, trouvez et modifiez le template **"Reset Password"** :

### Sujet de l'email
```
Réinitialisation de votre mot de passe - Wommate
```

### Contenu de l'email (HTML)
```html
<h2>Réinitialisation de votre mot de passe</h2>

<p>Bonjour,</p>

<p>Vous avez demandé la réinitialisation de votre mot de passe sur Wommate. Cliquez sur le bouton ci-dessous pour définir votre nouveau mot de passe :</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #f59e0b; color: #1e1b4b; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Réinitialiser mon mot de passe</a></p>

<p>Ou copiez ce lien dans votre navigateur :</p>

<p>{{ .ConfirmationURL }}</p>

<p><strong>⚠️ Sécurité :</strong></p>
<ul>
  <li>Ce lien expire dans 1 heure</li>
  <li>Ne partagez jamais ce lien avec quelqu'un d'autre</li>
  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
</ul>

<p>À bientôt sur Wommate !</p>

<p style="color: #888; font-size: 12px;">Ceci est un email automatique, merci de ne pas y répondre.</p>
```

## Étape 3 : Configurer les paramètres SMTP (Optionnel)

Si vous voulez utiliser votre propre serveur SMTP au lieu de celui de Supabase :

1. Allez dans **Project Settings** → **Authentication** → **SMTP Settings**
2. Activez "Enable SMTP"
3. Configurez les paramètres :
   - **SMTP Host** : votre serveur SMTP
   - **SMTP Port** : 587 (TLS) ou 465 (SSL)
   - **SMTP User** : votre email
   - **SMTP Password** : votre mot de passe
   - **Sender Email** : noreply@wommate.com
   - **Sender Name** : Wommate

## Étape 4 : Tester le flux

1. Allez sur la page de login : `http://localhost:3000/login`
2. Cliquez sur "Mot de passe oublié ?"
3. Entrez un email de test
4. Vérifiez votre boîte de réception
5. Cliquez sur le lien reçu
6. Entrez un nouveau mot de passe
7. Connectez-vous avec le nouveau mot de passe

## Notes importantes

- **Supabase Free Tier** : Utilise le serveur SMTP de Supabase (limité à 3 emails/heure)
- **Production** : Configurez votre propre SMTP pour éviter les limites
- **Sécurité** : Le lien de réinitialisation expire automatiquement après 1 heure
- **Rate Limiting** : Supabase limite les demandes de réinitialisation pour éviter les abus
