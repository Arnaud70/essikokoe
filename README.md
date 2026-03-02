
[![NestJS](https://nestjs.com/img/logo-small.svg)](http://nestjs.com/)

# Esikokoe Backend

Backend pour la gestion d'eau intercontinentale, développé avec [NestJS](https://nestjs.com/) et [Prisma](https://www.prisma.io/) (PostgreSQL).

---

## Sommaire
- [Description](#description)
- [Technologies](#technologies)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Base de données & Prisma](#base-de-donnees--prisma)
- [Documentation API](#documentation-api)
- [Tests](#tests)

---

## Description
Ce projet est une API RESTful pour la gestion des clients, produits, ventes, factures, stock, comptabilité et rapports. Il utilise NestJS pour la structure modulaire et Prisma pour l'accès à la base de données PostgreSQL.

## Technologies
- **Node.js** (TypeScript)
- **NestJS** (framework backend)
- **Prisma** (ORM, PostgreSQL)
- **JWT** (authentification)
- **Swagger** (documentation API)
- **ESLint, Prettier** (qualité du code)

## Structure du projet
```
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/           # Authentification JWT
│   ├── users/          # Gestion des utilisateurs
│   ├── modules/
│   │   ├── clients/    # Clients
│   │   ├── produits/   # Produits
│   │   ├── ventes/     # Ventes
│   │   ├── factures/   # Factures
│   │   ├── stock/      # Stock
│   │   ├── comptabilite/ # Comptabilité
│   │   ├── rapports/   # Rapports
│   ├── prisma/         # Service Prisma
├── prisma/
│   ├── schema.prisma   # Schéma DB
│   ├── seed.ts         # Seed de données
│   └── migrations/     # Migrations DB
├── package.json        # Dépendances & scripts
├── tsconfig.json       # Config TypeScript
├── eslint.config.mjs   # Config ESLint
```

## Installation
1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd essikokoe
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   ```
3. **Configurer la base de données**
   - Créez un fichier `.env` à la racine avec :
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/essikokoe"
    DIRECT_URL="postgresql://user:password@localhost:5432/essikokoe"
    PORT=9000
    NODE_ENV=development
    FRONTEND_URL=http://localhost:5173
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRATION="1h"
    JWT_REFRESH_SECRET=your_refresh_secret
    JWT_REFRESH_EXPIRATION="7d"
    ```
   - Adaptez les valeurs selon votre environnement.

## Démarrage
- **Développement**
  ```bash
  npm run start:dev
  ```
- **Production**
  ```bash
  npm run build
  npm run start:prod
  ```
- **Swagger (API docs)**
  Accédez à [http://localhost:9000/api/docs](http://localhost:9000/api/docs) après démarrage.

## Base de données & Prisma
- **Migration DB**
  ```bash
  npx prisma migrate dev
  ```
- **Générer le client Prisma**
  ```bash
  npx prisma generate
  ```
- **Seed de données**
  ```bash
  npx ts-node prisma/seed.ts
  ```
- **Modifier le schéma** : Editez `prisma/schema.prisma` puis relancez la migration.

## Tests
- **Unitaires**
  ```bash
  npm run test
  ```
- **End-to-end**
  ```bash
  npm run test:e2e
  ```
- **Couverture**
  ```bash
  npm run test:cov
  ```

## Lint & Formatage
- **Lint**
  ```bash
  npm run lint
  ```
- **Formatage**
  ```bash
  npm run format
  ```

## Documentation API
- Swagger UI : [http://localhost:9000/api/docs](http://localhost:9000/api/docs)

---

## Support & Ressources
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Swagger](https://swagger.io/)
- [Discord NestJS](https://discord.gg/G7Qnnhy)

---

## Auteur
- Projet réalisé par Jérôme
