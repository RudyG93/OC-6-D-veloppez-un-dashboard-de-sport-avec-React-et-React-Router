import type { ActivitySession } from "~/types/api";

/**
 * Obtient le lundi (début) de la semaine calendaire d'une date donnée
 * Les semaines commencent toujours le lundi à 00:00:00
 * 
 * @param date - Date de référence
 * @returns Date du lundi de cette semaine à 00:00:00
 * @example
 * getMonday(new Date('2025-12-24')) // Mercredi → retourne le lundi 2025-12-22
 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Si dimanche (0), reculer de 6 jours
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient le dimanche (fin) de la semaine calendaire d'une date donnée
 * Les semaines se terminent toujours le dimanche à 23:59:59.999
 * 
 * @param date - Date de référence
 * @returns Date du dimanche de cette semaine à 23:59:59.999
 * @example
 * getSunday(new Date('2025-12-24')) // Mercredi → retourne le dimanche 2025-12-28
 */
function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Filtre les activités sur une période de 4 semaines calendaires complètes
 * Se base sur le dimanche de la semaine de référence et remonte 4 semaines
 * 
 * @param activities - Liste complète des activités
 * @param endDate - Date de référence pour la fin de période (par défaut: aujourd'hui)
 * @returns Activités comprises dans les 4 dernières semaines calendaires
 * @example
 * // Si endDate = 2025-12-26 (vendredi), retourne activités du lundi 02/12 au dimanche 29/12
 */
export function getLastFourWeeksActivities(
  activities: ActivitySession[], 
  endDate: Date = new Date()
): ActivitySession[] {
  const sunday = getSunday(endDate);
  const monday = new Date(sunday);
  monday.setDate(sunday.getDate() - 27); // 4 semaines = 28 jours - 1
  monday.setHours(0, 0, 0, 0);
  
  return activities.filter(act => {
    const actDate = new Date(act.date);
    return actDate >= monday && actDate <= sunday;
  });
}

/**
 * Agrège les distances parcourues par semaine calendaire sur 4 semaines
 * Retourne toujours 4 semaines, même si certaines n'ont pas de données (km = 0)
 * 
 * @param activities - Liste des activités à agréger
 * @param endDate - Date de référence pour la fin de période (par défaut: aujourd'hui)
 * @returns Tableau de 4 objets {week, km, startDate, endDate}
 * @example
 * // Retourne [{week: "S1", km: 15.5, startDate: ..., endDate: ...}, ...]
 */
export function aggregateByWeek(
  activities: ActivitySession[],
  endDate: Date = new Date()
) {
  const sunday = getSunday(endDate);
  const weeks: { week: string; km: number; startDate: Date; endDate: Date }[] = [];
  
  // Créer les 4 semaines en partant de la plus ancienne
  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(sunday);
    weekEnd.setDate(sunday.getDate() - (i * 7));
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    
    // Filtrer les activités de cette semaine
    const weekActivities = activities.filter(act => {
      const actDate = new Date(act.date);
      return actDate >= weekStart && actDate <= weekEnd;
    });
    
    const totalKm = weekActivities.reduce((sum, act) => sum + act.distance, 0);
    
    weeks.push({
      week: `S${4 - i}`,
      km: Math.round(totalKm * 10) / 10,
      startDate: weekStart,
      endDate: weekEnd
    });
  }
  
  return weeks;
}

/**
 * Calcule la distance moyenne par session
 * 
 * @param activities - Liste des activités
 * @returns Distance moyenne en km (arrondie à 1 décimale), ou 0 si aucune activité
 */
export function calculateAverageDistance(activities: ActivitySession[]): number {
  if (activities.length === 0) return 0;
  
  const total = activities.reduce((sum, act) => sum + act.distance, 0);
  return Math.round((total / activities.length) * 10) / 10;
}

/**
 * Obtient les données d'activité pour les 7 jours d'une semaine calendaire
 * Retourne toujours 7 entrées (Lun-Dim), avec null pour les jours sans activité
 * 
 * @param activities - Liste complète des activités
 * @param referenceDate - Date dans la semaine à afficher (par défaut: aujourd'hui)
 * @returns Objet avec data (7 jours) + startDate/endDate de la semaine
 * @example
 * // Retourne {data: [{day: "Lun", min: 140, max: 178, ...}, ...], startDate, endDate}
 */
export function getWeekActivities(
  activities: ActivitySession[],
  referenceDate: Date = new Date()
) {
  const monday = getMonday(referenceDate);
  const sunday = getSunday(referenceDate);
  
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const result = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    
    // Chercher l'activité pour ce jour spécifique
    const activity = activities.find(act => {
      const actDate = new Date(act.date);
      return actDate.toDateString() === currentDay.toDateString();
    });
    
    result.push({
      day: weekDays[i],
      min: activity?.heartRate.min || null,
      max: activity?.heartRate.max || null,
      average: activity?.heartRate.average || null,
      date: currentDay.toISOString().split('T')[0]
    });
  }
  
  return {
    data: result,
    startDate: monday,
    endDate: sunday
  };
}

/**
 * Calcule la fréquence cardiaque moyenne sur un ensemble d'activités
 * 
 * @param activities - Liste des activités
 * @returns BPM moyen (arrondi à l'entier), ou 0 si aucune activité
 */
export function calculateAverageBPM(activities: ActivitySession[]): number {
  if (activities.length === 0) return 0;
  
  const total = activities.reduce((sum, act) => sum + act.heartRate.average, 0);
  return Math.round(total / activities.length);
}

/**
 * Formate une plage de dates en français
 * Format: "DD mois - DD mois" (même année) ou "DD mois YYYY - DD mois YYYY" (années différentes)
 * 
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Chaîne formatée (ex: "23 déc - 29 déc" ou "28 déc 2024 - 03 jan 2025")
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  const startFormat = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short'
  }).format(startDate);
  
  if (startYear === endYear) {
    const endFormat = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short'
    }).format(endDate);
    return `${startFormat} - ${endFormat}`;
  } else {
    const endFormat = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(endDate);
    return `${startFormat} ${startYear} - ${endFormat}`;
  }
}
