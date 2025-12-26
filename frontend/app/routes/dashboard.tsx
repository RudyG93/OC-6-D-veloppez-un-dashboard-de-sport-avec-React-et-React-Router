import { redirect, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/dashboard";
import { destroySession, getSession } from "~/sessions.server";
import { useUser } from "~/contexts/UserContext";
import { useUserStatistics } from "~/hooks/useUserStatistics";
import { formatDateLong } from "~/utils/dateFormat";
import Header from "~/components/header";
import Footer from "~/components/footer";
import WeeklyDistanceChart from "~/components/WeeklyDistanceChart";
import HeartRateChart from "~/components/HeartRateChart";
import WeeklySummary from "~/components/WeeklySummary";
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

export default function Dashboard({ loaderData }: Route.ComponentProps) {
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
  const { totalDistance } = useUserStatistics(contextUser, contextActivities);

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

      <main className="flex-1 w-full mx-auto pt-16 p-4 space-y-4">

        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between bg-white p-6 rounded-xl gap-4">
            <div className="flex flex-row justify-left items-center space-x-4">
              <img src={contextUser.profile.profilePicture} alt={`${contextUser.profile.firstName} ${contextUser.profile.lastName}`} className="object-cover w-25 h-25 rounded-xl" />
              <div>
                <h1 className="text-xl font-semibold">
                  {contextUser.profile.firstName} {contextUser.profile.lastName}
                </h1>
                <p className="text-gray-500 text-xs">Membre depuis le {formatDateLong(contextUser.profile.createdAt)}</p>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center lg:justify-right space-x-4 lg:space-x-8">
              <p className="text-gray-400 text-xs whitespace-nowrap self-center">Distance totale parcourue</p>
              <div className="bg-sportsee-blue flex items-center justify-center px-6 py-3 rounded-lg min-w-[120px]">
                <p className="font-semibold text-white text-lg">{totalDistance} km</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section des graphiques */}
        <section className="max-w-7xl mx-auto space-y-8 mt-8">
          <h2 className="text-2xl font-semibold">Vos dernières performances</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyDistanceChart activities={contextActivities} />
            <HeartRateChart activities={contextActivities} />
          </div>
        </section>

        {/* Section résumé de la semaine */}
        <section className="max-w-7xl mx-auto mt-8 mb-8">
          <WeeklySummary activities={contextActivities} />
        </section>

      </main>

      <Footer />
    </div>
  );
}
