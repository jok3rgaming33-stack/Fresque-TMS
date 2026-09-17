import type { Member } from "@/lib/room";

export function normalizeMember(m: Member): Member {
  const firstName = (m.firstName || m.name || "").trim().split(/\s+/)[0] || "Anonyme";
  const lastName = (m.lastName ?? (m.name || "").trim().split(/\s+/).slice(1).join(" ")).trim();
  return {
    ...m,
    firstName,
    lastName,
    name: m.name || [firstName, lastName].filter(Boolean).join(" "),
    attendance: m.attendance ?? { matin: false, "apres-midi": false },
  };
}

export function playLabel(member: Member, all: Member[]): string {
  const me = normalizeMember(member);
  const first = me.firstName || member.name || "Anonyme";
  const key = first.toLowerCase();
  const same = all.map(normalizeMember).filter((x) => (x.firstName || "").toLowerCase() === key);
  if (same.length > 1 && me.lastName) return `${first} ${me.lastName.charAt(0).toUpperCase()}.`;
  return first;
}
