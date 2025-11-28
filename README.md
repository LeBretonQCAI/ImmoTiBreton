# TiBreton Immo Expert

Application web monopage pour générer automatiquement des rapports d’expertise immobilière et des synthèses de marché à partir des notes de visite d’un professionnel.

## Stack
- Next.js 14 (App Router) + React 18 (TypeScript)
- Tailwind CSS pour le style
- API OpenAI Chat Completions via une route serveur sécurisée

## Démarrage

1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Créez un fichier `.env.local` à la racine et ajoutez votre clé :
   ```bash
   OPENAI_API_KEY=sk-...
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
4. Ouvrez http://localhost:3000 pour accéder à l’interface.

## Fonctionnement
- Le formulaire à gauche collecte l’adresse, le type de bien, les notes et le niveau de détail souhaité.
- La route `POST /api/generate-report` envoie les informations au modèle `gpt-4.1` avec un prompt système spécialisé.
- Le texte retourné est séparé en deux parties (rapport complet / synthèse de marché) grâce au séparateur `--- Synthèse de marché ---`.
- Les derniers champs saisis sont conservés dans le `localStorage` du navigateur.

## Production
- Construire : `npm run build`
- Lancer en mode production : `npm run start`
