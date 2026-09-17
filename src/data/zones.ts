export type ZoneId = "cou" | "membres-superieurs" | "lombaires" | "membres-inferieurs";

export type Zone = {
  id: ZoneId;
  label: string;
  style: { top: string; left: string; width: string; height: string };
};

export const ZONES: Zone[] = [
  { id: "cou", label: "Cou / cervicales", style: { top: "18%", left: "36%", width: "28%", height: "9%" } },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "26%", left: "8%", width: "84%", height: "20%" } },
  { id: "lombaires", label: "Zone lombaire", style: { top: "45%", left: "32%", width: "36%", height: "14%" } },
  { id: "membres-inferieurs", label: "Membres inférieurs", style: { top: "59%", left: "28%", width: "44%", height: "28%" } },
];

export function zoneLabel(id: ZoneId) {
  return ZONES.find((z) => z.id === id)?.label ?? id;
}
