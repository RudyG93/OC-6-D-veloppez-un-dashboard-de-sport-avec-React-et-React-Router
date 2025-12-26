import { Link, Form, useLocation } from "react-router";
import { useState } from "react";

export default function Header() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="w-full p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <img src="/icon-logo.png" alt="SportSee Icon" className="h-7" />
                    <img src="/logo.png" alt="SportSee Logo" className="h-8" />
                </div>

                {/* Menu desktop */}
                <nav className="hidden lg:block">
                    <ul className="rounded-[40px] bg-white flex items-center space-x-8 px-8 py-3">
                        <li>
                            <Link
                                to="/dashboard"
                                className={location.pathname === "/dashboard" ? "text-sportsee-blue" : "text-gray-600 hover:opacity-80"}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/profile"
                                className={location.pathname === "/profile" ? "text-sportsee-blue" : "text-gray-600 hover:opacity-80"}
                            >
                                Mon profil
                            </Link>
                        </li>
                        <li className="text-sportsee-blue opacity-30">
                            |
                        </li>
                        <li>
                            <Form method="post" action="/logout">
                                <button type="submit" className="text-sportsee-blue cursor-pointer hover:opacity-80">
                                    Se déconnecter
                                </button>
                            </Form>
                        </li>
                    </ul>
                </nav>

                {/* Bouton menu mobile */}
                <button 
                    className="lg:hidden bg-white rounded-lg p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Menu"
                >
                    <svg className="w-6 h-6 text-sportsee-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Menu mobile */}
            {mobileMenuOpen && (
                <nav className="lg:hidden mt-4">
                    <ul className="bg-white rounded-xl p-4 space-y-3">
                        <li>
                            <Link
                                to="/dashboard"
                                className={`block py-2 px-4 rounded-lg ${location.pathname === "/dashboard" ? "bg-sportsee-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/profile"
                                className={`block py-2 px-4 rounded-lg ${location.pathname === "/profile" ? "bg-sportsee-blue text-white" : "text-gray-600 hover:bg-gray-100"}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Mon profil
                            </Link>
                        </li>
                        <li className="pt-2 border-t border-gray-200">
                            <Form method="post" action="/logout">
                                <button 
                                    type="submit" 
                                    className="w-full text-left py-2 px-4 rounded-lg text-sportsee-blue hover:bg-gray-100"
                                >
                                    Se déconnecter
                                </button>
                            </Form>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
}