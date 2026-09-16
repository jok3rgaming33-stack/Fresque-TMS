const KEY = "fresque-tms-role";

export type AppRole = "formateur" | "participant";

export function setAppRole(role: AppRole) {
  sessionStorage.setItem(KEY, role);
}

export function getAppRole(): AppRole | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(KEY);
  return v === "formateur" || v === "participant" ? v : null;
}

export function isFormateur() {
  return getAppRole() === "formateur";
}
