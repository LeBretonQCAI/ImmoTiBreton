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
   - En cas d’échec du chargement du binaire SWC (`Failed to load SWC binary`), vous pouvez forcer le fallback WebAssembly :
     ```bash
     npm run dev:wasm
     ```
4. Ouvrez http://localhost:3000 pour accéder à l’interface.

## Fonctionnement
- Le formulaire à gauche collecte l’adresse, le type de bien, les notes et le niveau de détail souhaité.
- La route `POST /api/generate-report` envoie les informations au modèle `gpt-4.1` avec un prompt système spécialisé.
- Le texte retourné est séparé en deux parties (rapport complet / synthèse de marché) grâce au séparateur `--- Synthèse de marché ---`.
- Les derniers champs saisis sont conservés dans le `localStorage` du navigateur.

## Dépannage installation (erreurs 403 / proxy)
Si `npm install` échoue avec un 403 ou des avertissements liés à `http-proxy`/`https-proxy` :
- Vérifiez que les variables d’environnement `npm_config_http_proxy` et `npm_config_https_proxy` ne pointent pas vers un proxy bloquant (`unset npm_config_http_proxy npm_config_https_proxy`).
- La racine du projet inclut un fichier `.npmrc` qui force l’utilisation du registre public **et neutralise tout proxy hérité** (`proxy=` et `https-proxy=`). Supprimez ou ajustez ces valeurs si votre réseau exige un proxy interne.
- Assurez-vous que votre réseau autorise l’accès à `https://registry.npmjs.org/`.
- Si `next dev` signale que le binaire SWC natif manque, installez les dépendances optionnelles (`@next/swc-*`) ou lancez `npm run dev:wasm` pour utiliser le fallback WebAssembly.

## Production
- Construire : `npm run build`
- Lancer en mode production : `npm run start`
