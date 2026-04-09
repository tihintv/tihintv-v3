const ADMIN_KEY = "tihintv_admin_logged_in";
const ADMIN_PASSWORD = "peacehkb295libra";

export function getAdminPassword() {
  return ADMIN_PASSWORD;
}

export function isAdminLoggedIn() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function loginAdmin(password: string) {
  if (typeof window === "undefined") return false;

  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "true");
    return true;
  }

  return false;
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_KEY);
}