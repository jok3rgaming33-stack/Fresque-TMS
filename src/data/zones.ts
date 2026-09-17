export type ZoneId = "cou" | "membres-superieurs" | "lombaires" | "membres-inferieurs";

export type Zone = {
  id: ZoneId;
  label: string;
  style: { top: string; left: string; width: string; height: string };
  stack?: boolean;
};

export const ZONES: Zone[] = [
  { id: "cou", label: "Cou / cervicales", style: { top: "17%", left: "41%", width: "18%", height: "7%" }, stack: true },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "24%", left: "5%", width: "28%", height: "20%" }, stack: true },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "24%", left: "67%", width: "28%", height: "20%" } },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "24%", left: "36%", width: "28%", height: "8%" } },
  { id: "lombaires", label: "Zone lombaire", style: { top: "46%", left: "36%", width: "28%", height: "12%" }, stack: true },
  { id: "membres-inferieurs", label: "Membres inférieurs", style: { top: "63%", left: "30%", width: "40%", height: "26%" }, stack: true },
];

export function zoneLabel(id: ZoneId) {
  return ZONES.find((z) => z.id === id)?.label ?? id;
}
