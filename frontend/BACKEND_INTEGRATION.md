# Guide d'Intégration Backend

Ce document détaille les modifications nécessaires pour connecter l'application à une API backend réelle.

## 📍 Fichiers à Modifier

### 1. **app/mocks/mockApi.ts** → Remplacer par API Service

**Actuellement** : Types et données mockées
**À faire** : Créer `app/services/api.ts`

```typescript
// app/services/api.ts
import type { UserInfoResponse, ActivitySession, LoginResponse } from '~/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}

export async function getUserInfo(token: string): Promise<UserInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
}

export async function getActivities(token: string): Promise<ActivitySession[]> {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
}
```

### 2. **app/routes/login.tsx** - Action de Login

**Remplacer** la validation mockée par un vrai appel API :

```typescript
// AVANT (mock)
export async function action({ request }: Route.ActionArgs) {
  // ... validation mockée avec mockCredentials
}

// APRÈS (API)
import { login } from '~/services/api';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));

  try {
    const { token, userId } = await login(username, password);
    
    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", token);
    session.set("userId", userId);

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    return { error: "Identifiants invalides" };
  }
}
```

### 3. **app/routes/dashboard.tsx** - Loader

**Charger les données** depuis l'API :

```typescript
import { getUserInfo, getActivities } from '~/services/api';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/");

  try {
    // Charger les données en parallèle
    const [user, activities] = await Promise.all([
      getUserInfo(token),
      getActivities(token),
    ]);

    return { user, activities };
  } catch (error) {
    // Token invalide ou expiré → déconnexion
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
}

export default function Dashboard() {
  const { user, activities } = useLoaderData<typeof loader>();
  const { totalDistance } = useUserStatistics(user, activities);
  
  // ... reste du composant
}
```

### 4. **app/contexts/UserContext.tsx** - Supprimer ou Adapter

**Option A** : Supprimer le Context (données viennent du loader)
```typescript
// Les données sont passées via useLoaderData() dans chaque route
// Plus besoin de UserContext
```

**Option B** : Adapter pour gérer le cache et refresh
```typescript
export function UserProvider({ children, initialData }: UserProviderProps) {
  const [user, setUser] = useState<UserInfoResponse>(initialData.user);
  const [activities, setActivities] = useState<ActivitySession[]>(initialData.activities);

  // Fonction pour rafraîchir les données
  const refresh = async (token: string) => {
    const [newUser, newActivities] = await Promise.all([
      getUserInfo(token),
      getActivities(token),
    ]);
    setUser(newUser);
    setActivities(newActivities);
  };

  return (
    <UserContext.Provider value={{ user, activities, refresh }}>
      {children}
    </UserContext.Provider>
  );
}
```

### 5. **app/routes/profile.tsx** - Loader

Même logique que dashboard.tsx :

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/");

  try {
    const [user, activities] = await Promise.all([
      getUserInfo(token),
      getActivities(token),
    ]);

    return { user, activities };
  } catch (error) {
    return redirect("/");
  }
}

export default function Profile() {
  const { user, activities } = useLoaderData<typeof loader>();
  const stats = useUserStatistics(user, activities);
  
  // ... reste du composant
}
```

## 🔄 Gestion des Erreurs

### États de Chargement

Ajouter des indicateurs pendant le fetch :

```typescript
import { useNavigation } from "react-router";

export default function Dashboard() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // ... reste du composant
}
```

### Gestion des Erreurs Réseau

Créer un composant ErrorBoundary :

```typescript
// app/routes/dashboard.tsx
export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
        <p className="text-gray-600">{error?.message || "Impossible de charger les données"}</p>
        <Link to="/" className="mt-4 inline-block text-sportsee-blue">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
```

## 🔐 Token JWT

### Vérification et Refresh

```typescript
// app/utils/auth.ts
export async function getValidToken(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return null;

  // Vérifier si le token est expiré (optionnel)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      // Token expiré
      return null;
    }
  } catch {
    return null;
  }

  return token;
}
```

## 📊 Types API

Créer un fichier de types partagé :

```typescript
// app/types/api.ts
export type LoginResponse = {
  token: string;
  userId: string;
};

export type UserInfoResponse = {
  profile: {
    firstName: string;
    lastName: string;
    createdAt: string; // ISO 8601
    age: number;
    weight: number;
    height: number;
    profilePicture: string;
    weeklyGoal: number;
  };
  statistics: {
    totalDistance: string;
    totalSessions: number;
    totalDuration: number;
  };
};

export type ActivitySession = {
  date: string; // ISO 8601
  distance: number;
  duration: number;
  heartRate: {
    min: number;
    max: number;
    average: number;
  };
  caloriesBurned: number;
};
```

## 🌐 Variables d'Environnement

Ajouter dans `.env` :

```env
VITE_API_URL=http://localhost:3000/api
NODE_ENV=production
```

## ✅ Checklist d'Intégration

- [ ] Créer `app/services/api.ts` avec les fonctions de fetch
- [ ] Déplacer les types de `mockApi.ts` vers `app/types/api.ts`
- [ ] Modifier `app/routes/login.tsx` pour utiliser l'API
- [ ] Ajouter loaders dans `dashboard.tsx` et `profile.tsx`
- [ ] Adapter ou supprimer `UserContext.tsx`
- [ ] Implémenter la gestion des états de chargement
- [ ] Ajouter ErrorBoundary dans les routes
- [ ] Gérer l'expiration et le refresh des tokens
- [ ] Configurer CORS sur le backend si nécessaire
- [ ] Tester tous les scénarios (succès, erreur, token expiré)

## 🎯 Points d'Attention

1. **Format des dates** : S'assurer que l'API retourne des dates ISO 8601 (`YYYY-MM-DD`)
2. **Pagination** : Si beaucoup d'activités, implémenter la pagination côté API
3. **Cache** : Considérer l'utilisation de React Query pour le cache et la synchronisation
4. **Sécurité** : Utiliser HTTPS en production, valider les tokens côté serveur
5. **Performance** : Optimiser les appels API (debouncing, lazy loading, etc.)

---

**Note** : Ce guide suppose une API REST classique. Adapter selon votre architecture backend (GraphQL, tRPC, etc.).
