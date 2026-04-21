# AssurDevis — Application de devis d'assurance en ligne

Application web fullstack permettant à un client de remplir un formulaire multi-étapes pour demander un devis d'assurance auto ou moto, avec interface d'administration.

---

## Stack technique

| Couche       | Technologie                         |
|--------------|-------------------------------------|
| Backend      | Symfony 7 (PHP 8.2+)                |
| Frontend     | React 18 + TypeScript + Vite        |
| Base de données | MySQL 8.0                        |
| ORM          | Doctrine 3                          |
| API          | REST JSON                           |
| Styles       | CSS personnalisé (sans dépendance)  |

---

## Structure du projet

```
devis-assurance/
├── backend/                          # API Symfony
│   ├── src/
│   │   ├── Controller/
│   │   │   ├── QuoteController.php   # CRUD devis
│   │   │   └── ReferentialController.php # Villes & marques
│   │   ├── DTO/
│   │   │   └── QuoteDTO.php          # Validation des données entrantes
│   │   ├── Entity/
│   │   │   ├── Quote.php             # Entité principale
│   │   │   ├── City.php              # Villes
│   │   │   └── VehicleBrand.php      # Marques de véhicules
│   │   ├── Repository/
│   │   │   └── QuoteRepository.php
│   │   ├── Service/
│   │   │   └── QuoteService.php      # Logique métier
│   │   └── DataFixtures/
│   │       └── AppFixtures.php       # Données de test
│   ├── migrations/
│   │   └── Version20240101000000.php
│   ├── config/packages/
│   │   └── nelmio_cors.yaml
│   ├── composer.json
│   └── .env
│
└── frontend/                         # Application React
    ├── src/
    │   ├── components/
    │   │   ├── UI.tsx                # Composants partagés (ProgressBar, FormField…)
    │   │   └── steps/
    │   │       ├── StepPersonal.tsx  # Étape 1 : Informations personnelles
    │   │       ├── StepDriver.tsx    # Étape 2 : Informations conducteur
    │   │       ├── StepInsurance.tsx # Étape 3 : Type d'assurance
    │   │       ├── StepVehicle.tsx   # Étape 4 : Véhicule (conditionnel Auto/Moto)
    │   │       └── StepSummary.tsx   # Étape 5 : Récapitulatif + confirmation
    │   ├── hooks/
    │   │   ├── useQuoteForm.ts       # État central du formulaire multi-step
    │   │   └── useReferential.ts     # useCities + useVehicleBrands
    │   ├── pages/
    │   │   ├── QuoteFormPage.tsx     # Page principale avec formulaire
    │   │   └── AdminDashboard.tsx    # Interface admin (/#/admin)
    │   ├── services/
    │   │   └── api.ts                # Client HTTP (quoteApi + referentialApi)
    │   ├── types/
    │   │   └── quote.ts              # Types TypeScript partagés
    │   ├── utils/
    │   │   └── validators.ts         # Validations frontend par étape
    │   ├── styles/
    │   │   └── global.css            # Système de design complet
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── .env
```

---

## Prérequis

- **PHP** >= 8.2
- **Composer** >= 2.6
- **Node.js** >= 18
- **MySQL** >= 8.0
- **Symfony CLI** (recommandé, optionnel)

---

## Installation — Backend Symfony

### 1. Cloner et installer les dépendances

```bash
cd backend
composer install
```

### 2. Configurer la base de données

Copiez le fichier `.env` et adaptez l'URL de connexion :

```bash
cp .env .env.local
```

Éditez `.env.local` :

```dotenv
DATABASE_URL="mysql://VOTRE_USER:VOTRE_PASSWORD@127.0.0.1:3306/devis_assurance?serverVersion=8.0&charset=utf8mb4"
APP_SECRET=votre_secret_32_caracteres_aleatoires
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

### 3. Créer la base de données et appliquer les migrations

```bash
# Créer la base de données
php bin/console doctrine:database:create

# Appliquer les migrations
php bin/console doctrine:migrations:migrate

# (Optionnel) Charger les données de démonstration
php bin/console doctrine:fixtures:load
```

### 4. Lancer le serveur de développement

```bash
# Avec la Symfony CLI (recommandé)
symfony serve --port=8000

# Ou avec le serveur PHP intégré
php -S localhost:8000 -t public/
```

L'API sera accessible à `http://localhost:8000/api`.

---

## Installation — Frontend React

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Configurer l'URL de l'API

Copiez le fichier `.env` :

```bash
cp .env .env.local
```

Éditez `.env.local` si le backend tourne sur un port différent :

```dotenv
VITE_API_URL=http://localhost:8000/api
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible à `http://localhost:3000`.

### 4. Build de production

```bash
npm run build
# Les fichiers sont générés dans frontend/dist/
```

---

## Endpoints API

### Devis

| Méthode | URL                  | Description                        |
|---------|----------------------|------------------------------------|
| GET     | `/api/quotes`        | Liste paginée des devis            |
| POST    | `/api/quotes`        | Créer un nouveau devis             |
| GET     | `/api/quotes/{id}`   | Récupérer un devis                 |
| PUT     | `/api/quotes/{id}`   | Mettre à jour un devis             |
| DELETE  | `/api/quotes/{id}`   | Supprimer un devis                 |

### Référentiels

| Méthode | URL                       | Description                        |
|---------|---------------------------|------------------------------------|
| GET     | `/api/cities`             | Liste des villes                   |
| GET     | `/api/cities?q=casa`      | Recherche de villes                |
| GET     | `/api/brands?type=auto`   | Marques automobiles                |
| GET     | `/api/brands?type=moto`   | Marques motos                      |

### Exemple de payload POST `/api/quotes`

```json
{
  "nom": "Benali",
  "prenom": "Mohammed",
  "cityId": 1,
  "telephone": "0612345678",
  "dateNaissance": "1990-05-15",
  "datePermis": "2010-06-01",
  "typeAssurance": "auto",
  "marqueVehicule": "Renault",
  "typeCarburant": "diesel",
  "dateMiseEnCirculation": "2018-03-01",
  "nombrePlaces": 5,
  "valeurNeuf": 180000,
  "valeurVenale": 120000,
  "immatriculation": "12345A",
  "puissanceFiscale": 8,
  "statut": "submitted"
}
```

### Exemple de réponse succès

```json
{
  "message": "Devis créé avec succès.",
  "data": {
    "id": 1,
    "nom": "Benali",
    "prenom": "Mohammed",
    "cityId": 1,
    "cityNom": "Casablanca",
    "telephone": "0612345678",
    "dateNaissance": "1990-05-15",
    "datePermis": "2010-06-01",
    "typeAssurance": "auto",
    "marqueVehicule": "Renault",
    "typeCarburant": "diesel",
    "dateMiseEnCirculation": "2018-03-01",
    "nombrePlaces": 5,
    "valeurNeuf": "180000.00",
    "valeurVenale": "120000.00",
    "immatriculation": "12345A",
    "puissanceFiscale": 8,
    "cylindree": null,
    "statut": "submitted",
    "createdAt": "2024-01-15 14:32:00",
    "updatedAt": "2024-01-15 14:32:00"
  }
}
```

### Exemple de réponse erreur de validation (422)

```json
{
  "error": "Validation échouée.",
  "details": {
    "telephone": "Format de téléphone invalide (ex: 0612345678 ou +212612345678).",
    "valeurVenale": "La valeur vénale ne peut pas dépasser la valeur à neuf."
  }
}
```

---

## Fonctionnalités

### Formulaire multi-étapes (5 étapes)

1. **Informations personnelles** — Nom, prénom, ville (liste dynamique), téléphone
2. **Informations conducteur** — Date de naissance, date d'obtention du permis
3. **Type d'assurance** — Sélection visuelle Auto / Moto avec cartes interactives
4. **Informations véhicule** — Marque (liste dynamique), carburant, dates, valeurs, immatriculation + champs conditionnels (puissance fiscale pour Auto, cylindrée pour Moto)
5. **Récapitulatif** — Fiche complète avec liens de modification par étape

### Validations

Toutes les validations sont effectuées **côté frontend** (retour immédiat) et **côté backend** (sécurité) :

- Nom / Prénom : obligatoire, minimum 2 caractères
- Téléphone : format marocain `0XXXXXXXXX` ou `+212XXXXXXXXX`
- Âge minimum : 18 ans
- Date de permis : postérieure à 16 ans, pas dans le futur
- Valeur vénale ≤ valeur à neuf
- Immatriculation : format alphanumérique 2–10 caractères
- Champs numériques : valeurs positives

### Interface admin

Accessible via `http://localhost:3000/#/admin` :

- Tableau paginé de tous les devis
- Statuts colorés (brouillon, soumis, confirmé)
- Panneau de détail au clic sur une ligne
- Tri par date décroissante

### Sauvegarde brouillon

Un bouton discret sur chaque étape permet de sauvegarder l'état actuel en tant que brouillon sans validation complète.

---

## Règles métier appliquées

| Règle | Implémentation |
|-------|---------------|
| Conducteur ≥ 18 ans | Validation frontend + Assert\LessThan('-18 years') |
| Permis obtenu après 16 ans | Service QuoteService::validate() |
| Valeur vénale ≤ valeur à neuf | Service QuoteService::validate() |
| Champs conditionnels Auto/Moto | Entity nullable + validation conditionnelle |
| Format téléphone marocain | Regex frontend + Assert\Regex backend |

---

## Variables d'environnement

### Backend `.env.local`

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion MySQL | `mysql://root:pass@127.0.0.1:3306/devis_assurance` |
| `APP_SECRET` | Clé secrète Symfony (32 chars) | `a8f3k2j...` |
| `CORS_ALLOW_ORIGIN` | Origines autorisées (regex) | `^https?://localhost(:[0-9]+)?$` |
| `APP_ENV` | Environnement | `dev` ou `prod` |

### Frontend `.env.local`

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de base de l'API | `http://localhost:8000/api` |

---

## Commandes utiles

```bash
# ── Backend ──────────────────────────────────────────────────────────────
# Créer une nouvelle migration après modification des entités
php bin/console doctrine:migrations:diff

# Appliquer les migrations
php bin/console doctrine:migrations:migrate

# Recharger les fixtures (⚠️ supprime les données existantes)
php bin/console doctrine:fixtures:load --purge-with-truncate

# Vider le cache
php bin/console cache:clear

# Valider le mapping Doctrine
php bin/console doctrine:schema:validate

# ── Frontend ─────────────────────────────────────────────────────────────
# Développement
npm run dev

# Build production
npm run build

# Prévisualisation du build
npm run preview

# Lint
npm run lint
```

---

## Évolutions possibles

L'architecture est conçue pour être extensible :

- **Nouveaux produits d'assurance** : ajouter un type dans `typeAssurance` et créer de nouvelles étapes de formulaire
- **Calcul de prime** : ajouter un `PriceCalculationService` dans `src/Service/`
- **Authentification** : intégrer `symfony/security-bundle` avec JWT
- **Notifications e-mail** : utiliser `symfony/mailer` + `symfony/notifier`
- **Interface admin complète** : gestion des statuts, assignation d'agents
- **Export PDF** : générer des fiches devis avec `dompdf` ou `wkhtmltopdf`
- **Tests** : ajouter `PHPUnit` côté backend, `Vitest` côté frontend

---

## Données de test incluses (fixtures)

Les fixtures chargent automatiquement :

- **15 villes marocaines** (Casablanca, Rabat, Marrakech, Fès, Tanger…)
- **15 marques automobiles** (Renault, Peugeot, Toyota, BMW…)
- **10 marques moto** (Yamaha, Honda, Kawasaki, Ducati…)
- **2 devis de démonstration** (1 Auto confirmé, 1 Moto soumis)

---

## Licence

Propriétaire — Tous droits réservés.
