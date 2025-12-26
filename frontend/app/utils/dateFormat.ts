/**
 * Formate une date YYYY-MM-DD en format lisible "DD mois YYYY"
 * Exemple: "2025-01-01" → "01 janvier 2025"
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Formate une date YYYY-MM-DD en format court "DD/MM/YYYY"
 * Exemple: "2025-01-01" → "01/01/2025"
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
