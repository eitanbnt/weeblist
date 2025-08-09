# WeebList - Starter

Projet starter Next.js + Tailwind CSS + Supabase pour un tracker anime/manga.

## Instructions rapides

1. Décompresse le dossier.
2. Installe les dépendances :
   ```bash
   npm install
   ```
3. Crée un projet Supabase (gratuit) et une table `collection` :
   - id: int8, primary key, auto-increment
   - title: text
   - type: text
   - progress: int4
4. Ajoute un fichier `.env.local` à la racine avec :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase
   NEXT_PUBLIC_SUPABASE_KEY=ta_cle_publique
   ```
5. Lance en dev :
   ```bash
   npm run dev
   ```
6. Ouvre http://localhost:3000

Déploiement : push sur GitHub -> connecter sur Vercel -> ajouter les variables d'environnement sur Vercel.
