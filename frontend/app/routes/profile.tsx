import { redirect, useNavigation } from "react-router";
import type { Route } from "./+types/dashboard";
import { destroySession, getSession } from "~/sessions.server";
import { useUser } from "~/contexts/UserContext";
import { useUserStatistics } from "~/hooks/useUserStatistics";
import { formatDateLong } from "~/utils/dateFormat";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { getUserInfo, getAllActivitiesSinceCreation, ApiException } from "~/services/api";
import { useEffect } from "react";

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    if (!token) return redirect("/");

    try {
        // Charger les données utilisateur
        const user = await getUserInfo(token);
        
        // Charger toutes les activités depuis la création du compte
        const activities = await getAllActivitiesSinceCreation(token, user.profile.createdAt);

        return { user, activities };
    } catch (error) {
        // En cas d'erreur (token invalide, session expirée, etc.)
        if (error instanceof ApiException && (error.status === 401 || error.status === 403)) {
            // Détruire la session et rediriger vers login
            return redirect("/", {
                headers: {
                    "Set-Cookie": await destroySession(session),
                },
            });
        }
        
        // Pour les autres erreurs, on les laisse remonter au ErrorBoundary
        throw error;
    }
}

export default function Profile({ loaderData }: Route.ComponentProps) {
    const { user: contextUser, activities: contextActivities, setUserData } = useUser();
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    // Mettre à jour le Context avec les données du loader
    useEffect(() => {
        if (loaderData?.user && loaderData?.activities) {
            setUserData(loaderData.user, loaderData.activities);
        }
    }, [loaderData, setUserData]);

    // IMPORTANT: Appeler tous les hooks AVANT tout return anticipé
    const { totalDistance, totalCalories, totalSessions, restDays, time } = useUserStatistics(contextUser, contextActivities);

    // Afficher un état de chargement pendant la navigation
    if (isLoading || !contextUser) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 w-full mx-auto pt-16 p-4 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sportsee-blue"></div>
                        <p className="mt-4 text-gray-600">Chargement de vos données...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 w-full mx-auto pt-16 p-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Colonne gauche */}
                    <div className="space-y-6">
                        {/* Carte utilisateur */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={contextUser.profile.profilePicture} 
                                    alt={`${contextUser.profile.firstName} ${contextUser.profile.lastName}`} 
                                    className="w-32 h-32 object-cover rounded-xl"
                                />
                                <div>
                                    <h1 className="text-2xl font-semibold mb-1">
                                        {contextUser.profile.firstName} {contextUser.profile.lastName}
                                    </h1>
                                    <p className="text-gray-500 text-sm">
                                        Membre depuis le {formatDateLong(contextUser.profile.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Votre profil */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-semibold mt-6 mb-6">Votre profil</h2>
                            <hr className="mb-6 opacity-30" />
                            <div className="space-y-4 text-gray-700 mb-6 text-lg">
                                <p>Âge : {contextUser.profile.age}</p>
                                <p>Genre : Femme</p>
                                <p>Taille : {Math.floor(contextUser.profile.height / 100)}m{contextUser.profile.height % 100}</p>
                                <p>Poids : {contextUser.profile.weight}kg</p>
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite - Statistiques */}
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-1">Vos statistiques</h2>
                            <p className="text-gray-500 text-sm">
                                depuis le {formatDateLong(contextUser.profile.createdAt)}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Temps total couru */}
                            <div className="bg-sportsee-blue rounded-xl p-6 text-white">
                                <p className="text-sm mb-2 opacity-90 mb-4">Temps total couru</p>
                                <p className="text-3xl">
                                    {time.hours}h <span className="text-xl font-normal opacity-70">{time.minutes}min</span>
                                </p>
                            </div>

                            {/* Calories brûlées */}
                            <div className="bg-sportsee-blue rounded-xl p-6 text-white">
                                <p className="text-sm mb-2 opacity-90 mb-4">Calories brûlées</p>
                                <p className="text-3xl">
                                    {totalCalories.toLocaleString()} <span className="text-xl font-normal opacity-70">cal</span>
                                </p>
                            </div>

                            {/* Distance totale parcourue */}
                            <div className="bg-sportsee-blue rounded-xl p-6 text-white">
                                <p className="text-sm mb-2 opacity-90 mb-4">Distance totale parcourue</p>
                                <p className="text-3xl">
                                    {totalDistance} <span className="text-xl font-normal opacity-70">km</span>
                                </p>
                            </div>

                            {/* Nombre de jours de repos */}
                            <div className="bg-sportsee-blue rounded-xl p-6 text-white">
                                <p className="text-sm mb-2 opacity-90 mb-4">Nombre de jours de repos</p>
                                <p className="text-3xl">
                                    {restDays} <span className="text-xl font-normal opacity-70">jours</span>
                                </p>
                            </div>

                            {/* Nombre de sessions */}
                            <div className="bg-sportsee-blue rounded-xl p-6 text-white col-span-1 sm:col-span-2 lg:col-span-1">
                                <p className="text-sm mb-2 opacity-90 mb-4">Nombre de sessions</p>
                                <p className="text-3xl">
                                    {totalSessions} <span className="text-xl font-normal opacity-70">sessions</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}