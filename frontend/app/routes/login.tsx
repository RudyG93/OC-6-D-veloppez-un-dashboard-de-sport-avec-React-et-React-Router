import { Form, redirect, Link } from "react-router";
import type { Route } from "./+types/login";
import { commitSession, getSession } from "~/sessions.server";
import { login, ApiException } from "~/services/api";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("token")) return redirect("/dashboard");

  return { error: session.get("error") as string | undefined };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const form = await request.formData();

  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");

  if (!username || !password) {
    session.flash("error", "Username/password requis");
    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  try {
    const { token, userId } = await login({ username, password });

    session.set("token", token);
    session.set("userId", userId);
  } catch (error) {
    const errorMessage = error instanceof ApiException 
      ? error.message 
      : "Erreur de connexion. Vérifiez que le backend est démarré.";
    
    session.flash("error", errorMessage);
    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  return redirect("/dashboard", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Login({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen flex flex-row">
      {/* Partie gauche */}
      <main className="w-1/2 flex flex-col px-16 py-8 relative">

        {/* Logo en haut à gauche */}
        <div className="flex items-center space-x-2 mb-8">
          <img src="/icon-logo.png" alt="SportSee Icon" className="h-7" />
          <img src="/logo.png" alt="SportSee Logo" className="h-8" />
        </div>

        {/* Formulaire centré verticalement et horizontalement */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-2xl pt-10 pb-20">

            <h1 className="text-3xl font-semibold text-sportsee-blue">Transformez <br />vos stats en résultats</h1>

            {loaderData.error ? (
              <p className="border border-red-300 bg-red-50 text-red-600 p-3 rounded-xl">
                {loaderData.error}
              </p>
            ) : null}

            <Form method="post" className="space-y-4">
              <h2 className="text-2xl font-semibold">Se connecter</h2>
              <label className="block text-gray-700">
                Identifiant
                <input
                  name="username"
                  className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-sportsee-blue"
                />
              </label>

              <label className="block text-gray-700">
                Mot de passe
                <input
                  type="password"
                  name="password"
                  className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-sportsee-blue"
                />
              </label>

              <button className="w-full bg-sportsee-blue text-white rounded-xl px-4 py-3 hover:opacity-90 transition">
                Se connecter
              </button>
            </Form>
            <Link to="#" className="">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
      </main>

      {/* Partie droite - Image avec bulle */}
      <div className="w-1/2 relative overflow-hidden">
        <img
          src="/login.jpg"
          alt="Background Login"
          className="w-full h-full object-cover"
        />

        {/* Bulle de texte en bas à droite */}
        <div className="absolute bottom-8 right-8 bg-white rounded-[50px] shadow-lg p-6 max-w-md text-center">
          <p className="text-sportsee-blue">
            Analysez vos performances en un clin d’œil,
            suivez vos progrès et atteignez vos objectifs.
          </p>
        </div>
      </div>
    </div>
  );
}
