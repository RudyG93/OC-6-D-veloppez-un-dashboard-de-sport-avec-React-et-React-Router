# SportSee - Frontend Application

Application de suivi d'activité sportive construite avec React Router v7, TypeScript et Recharts.

## 📋 Architecture du Projet

```
app/
├── components/          # Composants réutilisables
│   ├── header.tsx      # Navigation principale avec menu responsive
│   ├── footer.tsx      # Pied de page
│   ├── WeeklyDistanceChart.tsx    # Graphique distance sur 4 semaines
│   ├── HeartRateChart.tsx         # Graphique fréquence cardiaque hebdomadaire
│   └── WeeklySummary.tsx          # Résumé de la semaine en cours (donut + stats)
│
├── contexts/           # Gestion de l'état global
│   └── UserContext.tsx # Contexte utilisateur et activités
│
├── hooks/              # Hooks personnalisés
│   └── useUserStatistics.ts  # Calcul des statistiques utilisateur
│
├── routes/             # Pages de l'application
│   ├── login.tsx      # Page de connexion
│   ├── logout.tsx     # Déconnexion (action)
│   ├── dashboard.tsx  # Tableau de bord principal
│   ├── profile.tsx    # Page profil utilisateur
│   └── error.tsx      # Page d'erreur
│
├── utils/              # Fonctions utilitaires
│   ├── dateFormat.ts  # Formatage des dates en français
│   └── activityUtils.ts  # Calculs liés aux activités (semaines, agrégations, etc.)
│
├── mocks/              # Données de développement
│   └── mockApi.ts     # Types et données mockées
│
└── sessions.server.ts  # Gestion des sessions (cookies)
```

## 🔑 Fonctionnalités Principales

### Authentification
- **Système de cookies** pour la gestion des sessions
- Login avec identifiants mockés (username: `sophiemartin`, password: `password123`)
- Protection des routes authentifiées

### Dashboard
- **Carte utilisateur** : Photo, nom, date d'inscription, distance totale
- **Graphiques de performance** :
  - Distance parcourue sur 4 semaines calendaires (lundi-dimanche)
  - Fréquence cardiaque sur une semaine (BPM min/max par jour)
- **Résumé hebdomadaire** : Sessions réalisées/objectif, durée, distance
- **Navigation temporelle** : Boutons < > pour parcourir l'historique
  - Limites : pas de futur au-delà de la semaine actuelle, pas avant la date de création du compte

### Profil
- **Informations personnelles** : Âge, genre, taille, poids
- **Statistiques globales depuis la création du compte** :
  - Temps total couru
  - Calories brûlées
  - Distance totale
  - Nombre de sessions
  - Jours de repos (calculés dynamiquement)

## 🛠️ Technologies

- **React Router v7** : Routing et gestion des données
- **TypeScript** : Typage statique
- **Tailwind CSS v4** : Styling avec thème personnalisé
- **Recharts** : Graphiques (BarChart, PieChart)
- **@react-router/node** : Sessions côté serveur avec cookies

## 📊 Gestion des Données

### Semaines Calendaires
- Les semaines commencent **toujours le lundi** et se terminent le dimanche
- Les calculs utilisent `getMonday()` et `getSunday()` pour garantir la cohérence
- Les graphiques affichent des semaines complètes, même avec données partielles

### Filtrage Temporel
- Toutes les statistiques sont filtrées entre :
  - **Date de début** : Date de création du compte (`user.profile.createdAt`)
  - **Date de fin** : Aujourd'hui (`new Date()` avec heure 23:59:59.999)
- Les données futures (après aujourd'hui) sont automatiquement exclues

### Calculs Dynamiques
- **useUserStatistics** : Hook personnalisé pour calculer les stats utilisateur
  - Évite la duplication de code entre Dashboard et Profile
  - Utilise `useMemo` pour optimiser les recalculs
  - Retourne : totalDistance, totalCalories, totalSessions, restDays, time

## 🎨 Thème et Couleurs

```css
--sportsee-red: #F4320B;
--sportsee-blue: #0B23F4;
--background: #F2F3FF;
```

## 📝 Conventions de Code

### Nommage
- **Composants** : PascalCase (ex: `WeeklyDistanceChart.tsx`)
- **Hooks** : camelCase avec préfixe `use` (ex: `useUserStatistics`)
- **Utilitaires** : camelCase (ex: `formatDateLong`)
- **Types** : PascalCase (ex: `ActivitySession`)

### Documentation
- **JSDoc** pour toutes les fonctions exportées
- Commentaires en français pour la logique métier complexe
- `@param`, `@returns`, `@example` dans la documentation

### Structure des Composants
```tsx
// 1. Imports
import { ... } from '...';

// 2. Types
type ComponentProps = { ... };

// 3. Documentation JSDoc
/**
 * Description du composant
 * 
 * Fonctionnalités:
 * - Liste des features
 */

// 4. Composant
export default function Component({ props }: ComponentProps) {
  // State et hooks
  // Calculs et logique
  // Event handlers
  // JSX
}
```

## 🚀 Prochaines Étapes

### Intégration Backend
- Remplacer `mockApi.ts` par de vrais appels API
- Implémenter l'authentification JWT
- Gérer les erreurs réseau et états de chargement
- Ajouter la pagination pour les grandes listes d'activités

### Améliorations UX
- Skeleton loaders pendant le chargement
- Animations de transition entre graphiques
- Feedback visuel pour les actions utilisateur
- Mode sombre

## 📦 Scripts Disponibles

```bash
npm run dev        # Lancer le serveur de développement
npm run build      # Build pour la production
npm run typecheck  # Vérifier les types TypeScript
```

## 🔐 Variables d'Environnement

```env
NODE_ENV=production  # Active les cookies sécurisés en production
```

---

**Note** : Ce projet utilise actuellement des données mockées. L'intégration backend nécessitera des modifications dans :
- `app/mocks/mockApi.ts` → Remplacer par de vrais appels API
- `app/contexts/UserContext.tsx` → Fetch des données depuis l'API
- `app/routes/*.tsx` → Loaders pour charger les données côté serveur
