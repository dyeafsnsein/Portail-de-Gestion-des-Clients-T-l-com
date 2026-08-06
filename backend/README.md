# Portail de Gestion des Clients Télécom

Backend API du portail de gestion des clients d'un opérateur télécom. Ce service expose une API REST sécurisée (JWT + rôles) permettant d'administrer les **utilisateurs**, les **contrats**, les **ressources** (SIM, lignes...), les **services** et les **accessoires** de la clientèle.

## Fonctionnalités

- **Authentification** : inscription, connexion, JWT, contrôle d'accès par rôle (admin / utilisateur)
- **Utilisateurs** : CRUD complet, recherche, pagination, avatar, réinitialisation de mot de passe
- **Contrats** : CRUD avec suppression logique (soft delete), recherche, filtres
- **Ressources** : CRUD avec suppression logique, recherche, filtre par contrat, iccid unique
- **Services** : CRUD, recherche par nom, filtres par type et statut d'activation
- **Accessoires** : CRUD, filtre par catégorie, téléversement d'image (jpg/png/webp, 2 Mo max)
- **Documentation API** : Swagger UI interactive

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | NestJS (Node.js, TypeScript) |
| ORM | Prisma 7 |
| Base de données | PostgreSQL 17 (Docker) |
| Authentification | Passport + JWT, bcrypt |
| Documentation | @nestjs/swagger |
| Outils | Docker Compose, ESLint, Prettier |

## Prérequis

- Node.js 20+
- Docker Desktop (pour la base de données PostgreSQL)

## Installation

1. Cloner le dépôt puis se placer dans le dossier `backend` :

```bash
git clone https://github.com/dyeafsnsein/Portail-de-Gestion-des-Clients-T-l-com.git
cd Portail-de-Gestion-des-Clients-T-l-com/backend
```

2. Configurer les variables d'environnement :

```bash
cp .env.example .env
# adapter PORT, DATABASE_URL, JWT_SECRET, SEED_ADMIN_* selon l'environnement
```

3. Démarrer la base de données et l'interface d'administration (Adminer sur `http://localhost:8080`) :

```bash
docker compose up -d
```

4. Installer les dépendances et préparer la base :

```bash
npm install
npm run prisma:migrate
npm run db:seed
```

5. Lancer l'API :

```bash
npm run start:dev
```

L'API répond par défaut sur `http://localhost:3000` (configurable via `PORT`).

## Scripts utiles

```bash
npm run build        # compilation TypeScript
npm run lint         # lint + auto-fix
npm run start:dev    # mode watch
npm run start:prod   # mode production (après build)
npm run prisma:generate
npm run db:seed      # seed (compte admin + données de démo)
```

## Documentation API

La documentation Swagger est disponible sur **`http://localhost:<PORT>/docs`** une fois l'API démarrée.

Un compte admin est créé par le seed à partir des variables `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` du fichier `.env`.

## Structure du projet

```
backend/
├── database/
│   └── schema.sql          # DDL autonome (tables + enums + contraintes)
├── prisma/
│   ├── schema.prisma       # Modèles de données
│   └── seed.ts             # Données de démo
├── src/
│   ├── auth/               # Authentification (login, register, JWT)
│   ├── users/              # Gestion des utilisateurs
│   ├── contracts/          # Gestion des contrats
│   ├── resources/          # Gestion des ressources
│   ├── services/           # Gestion des services
│   ├── accessories/        # Gestion des accessoires
│   └── common/             # Guards, filtres, DTO partagés
├── docker-compose.yml      # PostgreSQL + Adminer
└── .env.example            # Modèle de configuration
```
