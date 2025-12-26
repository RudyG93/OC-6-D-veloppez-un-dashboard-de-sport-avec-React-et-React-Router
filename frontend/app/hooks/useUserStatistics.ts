import { useMemo } from "react";
import type { ActivitySession, UserInfoResponse } from "~/types/api";

/**
 * Hook personnalisé pour calculer les statistiques utilisateur
 * Filtre automatiquement les activités entre la date de création du compte et aujourd'hui
 * 
 * @param user - Informations utilisateur avec la date de création du compte
 * @param activities - Liste de toutes les activités
 * @returns Statistiques calculées et activités filtrées
 */
export function useUserStatistics(user: UserInfoResponse | null, activities: ActivitySession[]) {
  return useMemo(() => {
    // Si pas d'utilisateur, retourner des valeurs par défaut
    if (!user) {
      return {
        activitiesSinceCreation: [],
        totalDistance: 0,
        totalCalories: 0,
        totalMinutes: 0,
        totalSessions: 0,
        restDays: 0,
        time: {
          hours: 0,
          minutes: 0,
          formatted: "0h 0min"
        }
      };
    }

    // Dates de référence
    const accountCreatedDate = new Date(user.profile.createdAt);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Inclure toute la journée d'aujourd'hui
    
    // Filtrer les activités entre la création du compte et aujourd'hui
    const activitiesSinceCreation = activities.filter(act => {
      const actDate = new Date(act.date);
      return actDate >= accountCreatedDate && actDate <= today;
    });
    
    // Calculer les statistiques agrégées
    const totalDistance = activitiesSinceCreation.reduce((sum, act) => sum + act.distance, 0);
    const totalCalories = activitiesSinceCreation.reduce((sum, act) => sum + act.caloriesBurned, 0);
    const totalMinutes = activitiesSinceCreation.reduce((sum, act) => sum + act.duration, 0);
    const totalSessions = activitiesSinceCreation.length;
    
    // Calculer le temps en heures et minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Calculer les jours de repos
    const daysSinceCreation = Math.floor((today.getTime() - accountCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysWithSessions = new Set(
      activitiesSinceCreation.map(act => new Date(act.date).toDateString())
    );
    const restDays = Math.max(0, daysSinceCreation - daysWithSessions.size);
    
    return {
      // Activités filtrées
      activitiesSinceCreation,
      
      // Statistiques calculées
      totalDistance: Math.round(totalDistance * 10) / 10, // Arrondi à 1 décimale
      totalCalories,
      totalMinutes,
      totalSessions,
      restDays,
      
      // Temps formaté
      time: {
        hours,
        minutes,
        formatted: `${hours}h ${minutes}min`
      }
    };
  }, [user, activities]);
}
