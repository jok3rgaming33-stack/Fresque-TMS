export type ZoneId = "cou" | "membres-superieurs" | "lombaires" | "membres-inferieurs" | "organisation";

export type Zone = {
  id: ZoneId;
  label: string;
  style: { top: string; left: string; width: string; height: string };
  stack?: boolean;
  external?: boolean;
};

export const ZONES: Zone[] = [
  { id: "cou", label: "Cou / cervicales", style: { top: "17%", left: "33%", width: "34%", height: "12%" }, stack: true },
  { id: "membres-superieurs", label: "Membres supérieurs", style: { top: "31%", left: "5%", width: "90%", height: "17%" }, stack: true },
  { id: "lombaires", label: "Zone lombaire", style: { top: "51%", left: "34%", width: "32%", height: "11%" }, stack: true },
  { id: "membres-inferieurs", label: "Membres inférieurs", style: { top: "65%", left: "30%", width: "40%", height: "24%" }, stack: true },
  { id: "organisation", label: "Organisation & contexte", style: { top: "0", left: "0", width: "0", height: "0" }, stack: true, external: true },
];

export function zoneLabel(id: ZoneId) {
  return ZONES.find((z) => z.id === id)?.label ?? id;
}
