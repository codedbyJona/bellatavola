const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error ?? 'The request could not be completed.');
  }
  return result;
}
