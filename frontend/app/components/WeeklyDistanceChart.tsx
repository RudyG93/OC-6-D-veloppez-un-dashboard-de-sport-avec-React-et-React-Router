import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aggregateByWeek, calculateAverageDistance, getLastFourWeeksActivities, formatDateRange } from '~/utils/activityUtils';
import { useUser } from '~/contexts/UserContext';
import type { ActivitySession } from '~/types/api';

type WeeklyDistanceChartProps = {
    activities: ActivitySession[];
};

/**
 * Graphique en barres affichant la distance parcourue sur 4 semaines calendaires
 * 
 * Fonctionnalités:
 * - Affiche 4 barres représentant 4 semaines consécutives (lundi-dimanche)
 * - Navigation temporelle avec boutons < > (par pas de 4 semaines)
 * - Limites: ne peut pas aller au-delà de la semaine actuelle ni avant la date de création du compte
 * - Affiche la moyenne km/session sur la période
 */
export default function WeeklyDistanceChart({ activities }: WeeklyDistanceChartProps) {
    const { user } = useUser();
    
    // Offset de navigation: 0 = période actuelle, -4 = 4 semaines en arrière, +4 = 4 semaines en avant
    const [weekOffset, setWeekOffset] = useState(0);

    // Calculer la date de référence basée sur l'offset de navigation
    const referenceDate = new Date();
    referenceDate.setDate(referenceDate.getDate() + (weekOffset * 7));

    // Filtrer et agréger les données pour les 4 semaines
    const fourWeeksActivities = getLastFourWeeksActivities(activities, referenceDate);
    const weeklyData = aggregateByWeek(fourWeeksActivities, referenceDate);
    const average = calculateAverageDistance(fourWeeksActivities);

    // Période affichée (du premier lundi au dernier dimanche)
    const startDate = weeklyData[0]?.startDate || new Date();
    const endDate = weeklyData[3]?.endDate || new Date();
    const dateRange = formatDateRange(startDate, endDate);

    // Vérifier les limites de navigation
    const accountCreatedDate = new Date(user.profile.createdAt);
    const canGoForward = weekOffset < 0; // Pas au-delà de la semaine actuelle
    const canGoBackward = startDate > accountCreatedDate; // Pas avant la création du compte

    const handlePrevious = () => {
        if (canGoBackward) {
            setWeekOffset(prev => prev - 4); // Reculer de 4 semaines
        }
    };

    const handleNext = () => {
        if (canGoForward) {
            setWeekOffset(prev => prev + 4); // Avancer de 4 semaines
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-3xl font-semibold text-sportsee-blue">{average}km en moyenne</h2>
                    <p className="text-gray-500 text-sm">Total des kilomètres 4 dernières semaines</p>
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
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" />
                    <YAxis width="auto" tickCount={4} type="number" domain={[0, 30]} />
                    <Tooltip />
                    <Bar dataKey="km" fill="#0B23F4" barSize={20} radius={[10, 10, 10, 10]} className='opacity-60' />
                </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center mt-4">
                <div className="w-3 h-3 rounded-full bg-sportsee-blue opacity-60 mr-2"></div>
                <span className="text-sm text-gray-600">Km</span>
            </div>
        </div>
    );
}
