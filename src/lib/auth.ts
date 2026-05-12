// Simple authentication helper
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export function validateCredentials(username: string, password: string): boolean {
  // Never allow login if ADMIN_PASSWORD env var is not configured
  if (!ADMIN_PASSWORD) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// Client-side state only — the real HttpOnly cookie is set server-side by /api/admin/login
export function setAuthToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('isAuthenticated', 'true');
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('isAuthenticated');
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  }
  return false;
}

/** Server-side: call inside API route to guard admin-only operations */
export function isAdminRequest(cookies: Partial<Record<string, string>>): boolean {
  return cookies['dset_admin'] === '1';
}