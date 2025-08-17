# WeebList

WeebList est une application web permettant de gérer et partager des listes d'animes. Ce projet a été développé avec [React](https://react.dev/) pour le frontend et [Node.js](https://nodejs.org/) pour le backend.

## Fonctionnalités

- Recherche d'animes via une API publique (à faire)
- Ajout, modification et suppression d'animes dans votre liste personnelle
- Visualisation des détails d'un anime
- Système d'authentification utilisateur (à faire)
- Partage de listes avec d'autres utilisateurs (à faire)

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/weeblist.git
   ```
2. Installez les dépendances :
   ```bash
   cd weeblist
   npm install
   ```
3. Lancez le serveur :
   ```bash
   npm start
   ```

## Technologies utilisées

- React
- Node.js / Express
- Supabase

## Structure du projet

```
```
└── 📁weeblist
    └── 📁controllers
        ├── CollectionController.js
        ├── CollectionWorkController.js
        ├── WorkController.js
    └── 📁lib
        ├── supabase.js
        ├── utils.ts
    └── 📁models
        ├── types.js
    └── 📁pages
        └── 📁api
            └── 📁collection
                ├── [id].js
                ├── index.js
        ├── _app.js
        ├── index.js
        ├── index.jsold
    └── 📁repositories
        ├── CollectionRepository.js
        ├── CollectionWorkRepository.js
        ├── WorkRepository.js
    └── 📁routes
        ├── collectionRoutes.js
        ├── collectionWorkRoutes.js
        ├── workRoutes.js
    └── 📁styles
        ├── globals.css
    └── 📁views
        └── 📁boutonAnime
            ├── refresh.jsx
        └── 📁collection
        └── 📁collectionWork
        └── 📁work
    ├── .env
    ├── .env.local
    ├── .gitignore
    ├── components.json
    ├── components.jsonold
    ├── MCD actuel.txt
    ├── MCD futur.txt
    ├── next-env.d.ts
    ├── next.config.js
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── README.md
    ├── Structure.md
    ├── tailwind.config.js
    ├── TO DO.txt
    └── tsconfig.json
```
```

## Contribution

Les contributions sont les bienvenues ! Veuillez ouvrir une issue ou une pull request.

## Licence

Ce projet est sous licence MIT. 