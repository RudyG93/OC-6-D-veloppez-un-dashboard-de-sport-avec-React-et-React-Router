/**
 * Types pour les réponses de l'API backend
 */

export type LoginCredentials = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: string;
};

export type UserInfoResponse = {
  profile: {
    firstName: string;
    lastName: string;
    createdAt: string;
    age: number;
    weight: number;
    height: number;
    profilePicture: string;
  };
  statistics: {
    totalDistance: string;
    totalSessions: number;
    totalDuration: number;
  };
};

export type ActivitySession = {
  date: string;
  distance: number;
  duration: number;
  heartRate: {
    min: number;
    max: number;
    average: number;
  };
  caloriesBurned: number;
};

export type ApiError = {
  message: string;
  status?: number;
};
