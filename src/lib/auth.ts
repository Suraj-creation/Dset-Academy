// Simple authentication helper
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export type Role = 'creator' | 'pmo' | 'leadership' | 'publisher' | 'admin';

interface AdminUser {
  username: string;
  password: string;
  role: Role;
  displayName: string;
}

// Additional role-based users for the blog approval workflow, defined via env so no DB
// migration/user-management UI is needed yet:
//   ADMIN_USERS="soubhagya:pass123:leadership:Soubhagya,manas:pass456:pmo:Manas"
// Each entry is username:password:role:displayName, comma-separated (displayName is optional —
// falls back to the username if omitted, e.g. for older ADMIN_USERS entries with only 3 parts).
// The role controls what stage a login can act on (see reviewPostServer); displayName is purely
// so review history/comments show a real person's name ("Approved by Soubhagya") instead of a
// generic role label — this is how named reviewers like Soubhagya/Manas work without needing a
// separate role per person. The legacy ADMIN_USERNAME/ADMIN_PASSWORD pair keeps working
// unchanged and is treated as role 'admin' (full access, same as today) so every existing login
// and every other admin module is unaffected.
function loadAdminUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  if (ADMIN_PASSWORD) {
    users.push({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD, role: 'admin', displayName: ADMIN_USERNAME });
  }
  const raw = process.env.ADMIN_USERS ?? '';
  for (const entry of raw.split(',')) {
    const [username, password, role, displayName] = entry.split(':').map(s => s?.trim());
    if (!username || !password || !role) continue;
    if (!['creator', 'pmo', 'leadership', 'publisher', 'admin'].includes(role)) continue;
    users.push({ username, password, role: role as Role, displayName: displayName || username });
  }
  return users;
}

export function validateCredentials(username: string, password: string): AdminUser | null {
  const users = loadAdminUsers();
  const match = users.find(u => u.username === username && u.password === password);
  return match ?? null;
}

// Client-side state only — the real HttpOnly cookies are set server-side by /api/admin/login
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

/** Server-side: call inside API route to guard admin-only operations (unchanged — any logged-in role passes) */
export function isAdminRequest(cookies: Partial<Record<string, string>>): boolean {
  return cookies['dset_admin'] === '1';
}

/** Server-side: the logged-in user's role, or null if not logged in. Used only by the blog approval workflow. */
export function getRequestRole(cookies: Partial<Record<string, string>>): Role | null {
  if (cookies['dset_admin'] !== '1') return null;
  const role = cookies['dset_role'];
  if (role === 'creator' || role === 'pmo' || role === 'leadership' || role === 'publisher' || role === 'admin') {
    return role;
  }
  // Legacy sessions logged in before this change carry no role cookie — treat as full admin,
  // matching their previous (pre-roles) unrestricted access.
  return 'admin';
}

/** Server-side: the logged-in user's real name (e.g. "Soubhagya"), or null if not logged in. */
export function getRequestDisplayName(cookies: Partial<Record<string, string>>): string | null {
  if (cookies['dset_admin'] !== '1') return null;
  const name = cookies['dset_name'];
  if (!name) return null;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}
