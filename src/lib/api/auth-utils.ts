/**
 * Utility to extract current authenticated user ID, tenant ID, and role safely across SSR and Client.
 */
export function getAuthUserId(): number {
  if (typeof window !== 'undefined') {
    const storedAuth = localStorage.getItem('isp-auth-storage');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        const id = parsed?.state?.user?.id || parsed?.state?.user?.tenantId;
        if (id !== undefined && id !== null) {
          const numId = Number(id);
          if (!isNaN(numId) && numId > 0) {
            return numId;
          }
        }
      } catch {
        // ignore parse error
      }
    }
  }
  return 369; // Default fallback admin ID
}

export function getAuthUser() {
  if (typeof window !== 'undefined') {
    const storedAuth = localStorage.getItem('isp-auth-storage');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        return parsed?.state?.user || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}
