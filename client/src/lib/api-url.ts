// Get the API URL for all fetch requests
export function getApiUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  // Remove trailing slash from base URL to avoid double slashes
  const baseUrl = apiUrl.replace(/\/$/, '');
  return `${baseUrl}${path}`;
}
