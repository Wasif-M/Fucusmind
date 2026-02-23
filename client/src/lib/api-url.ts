// Get the API URL for all fetch requests
export function getApiUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}${path}`;
}
