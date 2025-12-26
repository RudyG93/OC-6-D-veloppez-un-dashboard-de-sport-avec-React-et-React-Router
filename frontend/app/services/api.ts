/**
 * Service API pour les appels au backend
 * Gère l'authentification, les requêtes utilisateur et la gestion des erreurs
 */

import type {
  LoginCredentials,
  LoginResponse,
  UserInfoResponse,
  ActivitySession,
  ApiError,
} from "~/types/api";

const API_BASE_URL = "http://localhost:8000";

/**
 * Classe personnalisée pour les erreurs API
 */
export class ApiException extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ApiException";
    this.status = status;
  }
}

/**
 * Authentifie un utilisateur et retourne un token JWT
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiException(
        errorData.message || "Identifiants invalides",
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException(
      "Impossible de se connecter au serveur. Vérifiez que le backend est démarré.",
      503
    );
  }
}

/**
 * Récupère les informations du profil utilisateur
 */
export async function getUserInfo(token: string): Promise<UserInfoResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new ApiException("Session expirée. Veuillez vous reconnecter.", response.status);
      }
      throw new ApiException("Erreur lors de la récupération des données utilisateur", response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException(
      "Impossible de récupérer les informations utilisateur",
      503
    );
  }
}

/**
 * Récupère les sessions d'activité pour une période donnée
 */
export async function getActivities(
  token: string,
  startWeek: string,
  endWeek: string
): Promise<ActivitySession[]> {
  try {
    const params = new URLSearchParams({
      startWeek,
      endWeek,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/user-activity?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new ApiException("Session expirée. Veuillez vous reconnecter.", response.status);
      }
      throw new ApiException("Erreur lors de la récupération des activités", response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException("Impossible de récupérer les activités", 503);
  }
}

/**
 * Récupère toutes les activités depuis la date de création du compte
 */
export async function getAllActivitiesSinceCreation(
  token: string,
  createdAt: string
): Promise<ActivitySession[]> {
  const startWeek = createdAt;
  const endWeek = new Date().toISOString().split("T")[0]; // Aujourd'hui
  
  return getActivities(token, startWeek, endWeek);
}
