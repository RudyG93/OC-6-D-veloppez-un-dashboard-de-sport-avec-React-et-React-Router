import { Link } from "react-router";

export default function Error() {
  return (
    <div className="max-w-md mx-auto pt-16 p-4 space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Erreur 404</h1>
      <p>La page que vous recherchez n'existe pas.</p>
      <Link to="/" className="inline-block border rounded-xl px-4 py-2 hover:bg-gray-100">
        Revenir à l'accueil
      </Link>
    </div>
  );
}
