export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5056';

/** White-label tenant id — "tbs" default; future licensees get their own. */
export const STORE_TENANT: string = import.meta.env.VITE_STORE_TENANT ?? 'tbs';
