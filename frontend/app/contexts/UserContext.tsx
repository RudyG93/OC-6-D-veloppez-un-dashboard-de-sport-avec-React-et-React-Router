import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserInfoResponse, ActivitySession } from "~/types/api";

type UserContextType = {
  user: UserInfoResponse | null;
  activities: ActivitySession[];
  isLoading: boolean;
  error: string | null;
  setUserData: (user: UserInfoResponse, activities: ActivitySession[]) => void;
  clearUserData: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
  initialUser?: UserInfoResponse | null;
  initialActivities?: ActivitySession[];
};

export function UserProvider({ 
  children, 
  initialUser = null, 
  initialActivities = [] 
}: UserProviderProps) {
  const [user, setUser] = useState<UserInfoResponse | null>(initialUser);
  const [activities, setActivities] = useState<ActivitySession[]>(initialActivities);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour les données utilisateur
  const setUserData = (newUser: UserInfoResponse, newActivities: ActivitySession[]) => {
    setUser(newUser);
    setActivities(newActivities);
    setIsLoading(false);
    setError(null);
  };

  // Effacer les données utilisateur (lors de la déconnexion)
  const clearUserData = () => {
    setUser(null);
    setActivities([]);
    setIsLoading(false);
    setError(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      activities, 
      isLoading, 
      error, 
      setUserData, 
      clearUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
