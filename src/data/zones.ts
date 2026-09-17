export type ZoneId = "cou" | "membres-superieurs" | "lombaires" | "membres-inferieurs";

export type Zone = {
  id: ZoneId;
  label: string;
  style: { top: string; left: string; width: string; height: string };
  stack?: boolean;
};

export const ZONES: Zone[] = [
  { id: "cou", label: "Cou / cervicales", style: { top: "18%", left: "42%", width: "16%", height: "7%" }, stack: true },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "26%", left: "8%", width: "26%", height: "18%" }, stack: true },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "26%", left: "66%", width: "26%", height: "18%" } },
  { id: "lombaires", label: "Zone lombaire", style: { top: "48%", left: "37%", width: "26%", height: "11%" }, stack: true },
  { id: "membres-inferieurs", label: "Membres inférieurs", style: { top: "64%", left: "31%", width: "38%", height: "24%" }, stack: true },
];

export function zoneLabel(id: ZoneId) {
  return ZONES.find((z) => z.id === id)?.label ?? id;
}
