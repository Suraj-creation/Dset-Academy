/**
 * Browser-side admin auth state. This is a UI hint only — it decides whether to
 * render the admin shell or bounce to /auth/signin. It is NOT a security
 * boundary: the real check is the signed HttpOnly `dset_session` cookie that
 * src/lib/auth.ts verifies on the server for every admin request.
 *
 * Split out of src/lib/auth.ts so that module can stay server-only and use
 * node:crypto without pulling it into the client bundle.
 */

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
