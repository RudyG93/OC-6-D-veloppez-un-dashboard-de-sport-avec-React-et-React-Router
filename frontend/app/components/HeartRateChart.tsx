import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWeekActivities, calculateAverageBPM, formatDateRange } from '~/utils/activityUtils';
import { useUser } from '~/contexts/UserContext';
import type { ActivitySession } from '~/types/api';

type HeartRateChartProps = {
  activities: ActivitySession[];
};

/**
 * Graphique en barres affichant la fréquence cardiaque (min/max) sur une semaine calendaire
 * 
 * Fonctionnalités:
 * - Affiche 7 barres (Lun-Dim) avec BPM min (rose) et max (rouge) empilées
 * - Jours sans activité affichent l'axe mais pas de barres
 * - Navigation temporelle avec boutons < > (par semaine)
 * - Limites: ne peut pas aller au-delà de la semaine actuelle ni avant la date de création du compte
 * - Affiche le BPM moyen sur les jours avec activités
 */
export default function HeartRateChart({ activities }: HeartRateChartProps) {
  const { user } = useUser();
  
  // Offset de navigation: 0 = semaine actuelle, -1 = semaine dernière, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Calculer la date de référence basée sur l'offset de navigation
  const referenceDate = new Date();
  referenceDate.setDate(referenceDate.getDate() + (weekOffset * 7));
  
  // Obtenir les 7 jours de la semaine avec leurs données de fréquence cardiaque
  const { data: heartRateData, startDate, endDate } = getWeekActivities(activities, referenceDate);
  
  // Calculer le BPM moyen uniquement sur les jours ayant des activités
  const activitiesWithData = activities.filter(act => {
    const actDate = new Date(act.date);
    return actDate >= startDate && actDate <= endDate;
  });
  const averageBPM = calculateAverageBPM(activitiesWithData);
  
  const dateRange = formatDateRange(startDate, endDate);
  
  // Vérifier les limites de navigation
  const accountCreatedDate = new Date(user.profile.createdAt);
  const canGoForward = weekOffset < 0; // Pas au-delà de la semaine actuelle
  const canGoBackward = startDate > accountCreatedDate; // Pas avant la création du compte
  
  const handlePrevious = () => {
    if (canGoBackward) {
      setWeekOffset(prev => prev - 1); // Reculer d'1 semaine
    }
  };
  
  const handleNext = () => {
    if (canGoForward) {
      setWeekOffset(prev => prev + 1); // Avancer d'1 semaine
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-sportsee-red">{averageBPM} BPM</h2>
          <p className="text-gray-500 text-sm">Fréquence cardiaque moyenne</p>
        </div>
        <div className="flex space-x-2 items-center">
          <button 
            onClick={handlePrevious}
            disabled={!canGoBackward}
            className="px-2 rounded-xl border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            <span>&lt;</span>
          </button>
          <span className="text-sm text-gray-500 px-2 py-2">{dateRange}</span>
          <button 
            onClick={handleNext}
            disabled={!canGoForward}
            className="px-2 rounded-xl border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            <span>&gt;</span>
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={heartRateData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" />
          <YAxis tickCount={4} domain={[130, 190]} />
          <Tooltip />
          {/* Barres min (rose clair) */}
          <Bar dataKey="min" fill="#ffb3b3" barSize={20} radius={[10, 10, 10, 10]} />
          {/* Barres max (rouge) */}
          <Bar dataKey="max" fill="#ff4444" barSize={20} radius={[10, 10, 10, 10]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#ffb3b3] mr-2"></div>
          <span className="text-sm text-gray-600">Min</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#ff4444] mr-2"></div>
          <span className="text-sm text-gray-600">Max BPM</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-sportsee-blue mr-2"></div>
          <span className="text-sm text-gray-600">Moy. BPM</span>
        </div>
      </div>
    </div>
  );
}
