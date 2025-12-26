import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getWeekActivities, formatDateRange } from '~/utils/activityUtils';
import { useUser } from '~/contexts/UserContext';
import type { ActivitySession } from '~/types/api';

type WeeklySummaryProps = {
  activities: ActivitySession[];
};

export default function WeeklySummary({ activities }: WeeklySummaryProps) {
  const { user } = useUser();
  const currentDate = new Date();
  
  // Obtenir les activités de la semaine en cours
  const { data: weekData, startDate, endDate } = getWeekActivities(activities, currentDate);
  
  // Filtrer les activités réelles de la semaine
  const weekActivities = activities.filter(act => {
    const actDate = new Date(act.date);
    return actDate >= startDate && actDate <= endDate;
  });
  
  // Calculer les statistiques
  const sessionsCompleted = weekActivities.length;
  const weeklyGoal = user.profile.weeklyGoal;
  const sessionsRemaining = Math.max(0, weeklyGoal - sessionsCompleted);
  
  const totalDuration = weekActivities.reduce((sum, act) => sum + act.duration, 0);
  const totalDistance = weekActivities.reduce((sum, act) => sum + act.distance, 0);
  
  // Données pour le graphique en donut
  const chartData = [
    { name: 'Réalisées', value: sessionsCompleted },
    { name: 'Restantes', value: sessionsRemaining }
  ];
  
  const COLORS = ['#0B23F4', '#C4CAF9']; // Bleu foncé pour réalisées, bleu clair pour restantes

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Cette semaine</h2>
        <p className="text-gray-500 text-sm">
          Du {startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} au {endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des sessions */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="flex flex-row items-center text-4xl font-bold text-sportsee-blue mb-1">
              x <span className='ml-1'>{sessionsCompleted}</span> <span className="ml-2 text-lg text-sportsee-blue opacity-50 font-normal">sur objectif de {weeklyGoal}</span>
            </h3>
            <p className="text-gray-600 text-sm">Courses hebdomadaire réalisées</p>
          </div>

          <div className="flex items-center justify-center">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  startAngle={120}
                  endAngle={360 + 120}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col space-y-2 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-sportsee-blue mr-2"></div>
              <span className="text-sm text-gray-600">{sessionsCompleted} réalisés</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#C4CAF9] mr-2"></div>
              <span className="text-sm text-gray-600">{sessionsRemaining} restants</span>
            </div>
          </div>
        </div>

        {/* Statistiques de la semaine */}
        <div className="flex flex-col space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-600 text-sm mb-2">Durée d'activité</p>
            <p className="text-4xl text-sportsee-blue">
              {totalDuration} <span className="text-lg text-sportsee-blue opacity-50">minutes</span>
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-600 text-sm mb-2">Distance</p>
            <p className="text-4xl text-sportsee-red">
              {Math.round(totalDistance * 10) / 10} <span className="text-lg text-sportsee-red opacity-50">kilomètres</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
