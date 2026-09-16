const ROLE_KEY = "fresque-tms-role";
const FORMA_KEY = "fresque-tms-forma";

export const FORMATEUR_PASSWORD = "formaTMS";

export type AppRole = "formateur" | "participant";

export function setAppRole(role: AppRole) {
  sessionStorage.setItem(ROLE_KEY, role);
}

export function getAppRole(): AppRole | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(ROLE_KEY);
  return v === "formateur" || v === "participant" ? v : null;
}

export function unlockFormateur(password: string) {
  if (password !== FORMATEUR_PASSWORD) return false;
  sessionStorage.setItem(FORMA_KEY, "ok");
  setAppRole("formateur");
  return true;
}

export function isFormateurUnlocked() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(FORMA_KEY) === "ok";
}

export function isFormateur() {
  return isFormateurUnlocked();
}
