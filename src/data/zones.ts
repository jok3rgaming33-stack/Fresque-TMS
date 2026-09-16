export type ZoneId = "cou" | "membres-superieurs" | "lombaires" | "membres-inferieurs";

export type Zone = {
  id: ZoneId;
  label: string;
  style: { top: string; left: string; width: string; height: string };
};

export const ZONES: Zone[] = [
  { id: "cou", label: "Cou / cervicales", style: { top: "19%", left: "39%", width: "22%", height: "7%" } },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "25%", left: "11%", width: "78%", height: "23%" } },
  { id: "lombaires", label: "Zone lombaire", style: { top: "46%", left: "34%", width: "32%", height: "11%" } },
  { id: "membres-inferieurs", label: "Membres inférieurs", style: { top: "58%", left: "29%", width: "42%", height: "30%" } },
];

export function zoneLabel(id: ZoneId) {
  return ZONES.find((z) => z.id === id)?.label ?? id;
}
