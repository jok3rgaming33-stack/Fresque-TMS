export type ZoneId = "cou" | "membres-superieurs" | "lombaires" | "membres-inferieurs";

export type Zone = {
  id: ZoneId;
  label: string;
  style: { top: string; left: string; width: string; height: string };
};

export const ZONES: Zone[] = [
  { id: "cou", label: "Cou / cervicales", style: { top: "11%", left: "38%", width: "24%", height: "8%" } },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "22%", left: "8%", width: "84%", height: "16%" } },
  { id: "lombaires", label: "Zone lombaire", style: { top: "38%", left: "36%", width: "28%", height: "12%" } },
  { id: "membres-inferieurs", label: "Membres inférieurs", style: { top: "58%", left: "32%", width: "36%", height: "28%" } },
];

export function zoneLabel(id: ZoneId) {
  return ZONES.find((z) => z.id === id)?.label ?? id;
}
