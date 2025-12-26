import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-white mt-auto flex items-center justify-between p-4 text-sm text-gray-500">
        <div className="flex space-x-4 items-center">
            <p>©SportSee</p>
            <p>Tous droits réservés</p>
        </div>
        <ul className="flex space-x-4 items-center">
            <li><Link to="#">Conditions générales</Link></li>
            <li><Link to="#">Contact</Link></li>
            <li><img src="/icon-logo.png" alt="SportSee Icon" className="h-6" /></li>
        </ul>
    </footer>
  );
}
