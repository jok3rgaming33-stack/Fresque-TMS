import type { ZoneId } from "./zones";

export type Kind = "symptome" | "cause" | "prevention";

export type Card = {
  id: string;
  kind: Kind;
  family: string;
  title: string;
  description: string;
  image: string | null;
  zones: ZoneId[];
};

export const CARDS: Card[] = [
  { id: "c-duree", kind: "cause", family: "Organisation du travail", title: "Durée prolongée de l'opération", description: "L'opération dure trop longtemps, sans relâche, ce qui fatigue les muscles et articulations.", image: "/cards/c-duree.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-delais", kind: "cause", family: "Organisation du travail", title: "Pression sur les délais", description: "La contrainte de temps pousse à accélérer les gestes et à négliger les pauses.", image: "/cards/c-delais.jpg", zones: ["cou", "lombaires"] },
  { id: "c-prep", kind: "cause", family: "Organisation du travail", title: "Préparation insuffisante", description: "Le matériel n'est pas prêt, l'opérateur improvise et force sur le poste.", image: "/cards/c-prep.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-personnel", kind: "cause", family: "Organisation du travail", title: "Manque de personnel", description: "L'opérateur porte seul une charge prévue pour plusieurs personnes.", image: "/cards/c-personnel.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-com", kind: "cause", family: "Organisation du travail", title: "Mauvaise communication", description: "Les consignes ne circulent pas : cadencement imposé, gestes désynchronisés.", image: "/cards/c-com.jpg", zones: ["cou"] },
  { id: "c-repetitif", kind: "cause", family: "Organisation du travail", title: "Geste répétitif", description: "Souvent induit par le cadencement de l'organisation.", image: "/cards/c-repetitif.jpg", zones: ["membres-superieurs"] },
  { id: "c-levage", kind: "cause", family: "Technique, Matériel & Outils", title: "Absence de moyen de levage adapté", description: "La plaque ou la charge est soulevée à la main, sans outil.", image: "/cards/c-levage.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-elingue", kind: "cause", family: "Technique, Matériel & Outils", title: "Matériel mal élingué", description: "L'élingage est incorrect : la charge est instable et force le corps.", image: "/cards/c-elingue.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-outil", kind: "cause", family: "Technique, Matériel & Outils", title: "Outil ou accessoire inadapté", description: "L'outil ne correspond pas à la tâche, l'effort est décuplé.", image: "/cards/c-outil.jpg", zones: ["membres-superieurs"] },
  { id: "c-ventouse", kind: "cause", family: "Technique, Matériel & Outils", title: "L'Effet Ventouse", description: "La plaque adhère au sol : il faut arracher la charge avant de la lever.", image: "/cards/c-ventouse.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-endommage", kind: "cause", family: "Technique, Matériel & Outils", title: "Matériel endommagé", description: "Un outil usé ou cassé oblige à compenser avec le corps.", image: "/cards/c-endommage.jpg", zones: ["membres-superieurs"] },
  { id: "c-securite", kind: "cause", family: "Technique, Matériel & Outils", title: "Dispositifs de sécurité retirés", description: "Les protections enlevées exposent à un geste forcé ou accidentel.", image: "/cards/c-securite.jpg", zones: ["membres-superieurs"] },
  { id: "c-posture", kind: "cause", family: "Environnement de Travail & Milieu", title: "Posture de travail", description: "Manque d'espace, tranchée étroite : le corps se tord pour travailler.", image: "/cards/c-posture.jpg", zones: ["lombaires", "membres-inferieurs"] },
  { id: "c-climat", kind: "cause", family: "Environnement de Travail & Milieu", title: "Conditions climatiques", description: "Vent, froid, chaleur : les muscles se contractent et fatiguent plus vite.", image: "/cards/c-climat.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-fatigue", kind: "cause", family: "Facteur Humain & État de l'Opérateur", title: "Fatigue physique", description: "Le corps n'a plus les réserves pour un geste contrôlé.", image: "/cards/c-fatigue.jpg", zones: ["lombaires"] },
  { id: "c-echauffement", kind: "cause", family: "Facteur Humain & État de l'Opérateur", title: "Manque d'échauffement", description: "Corps non préparé à l'effort : les lombaires encaissent le premier choc.", image: "/cards/c-echauffement.jpg", zones: ["lombaires"] },
  { id: "c-manutention", kind: "cause", family: "Facteur Humain & État de l'Opérateur", title: "Technique de manutention inadaptée", description: "Dos rond, genoux tendus au moment du levage.", image: "/cards/c-manutention.jpg", zones: ["lombaires"] },
  { id: "c-repartition", kind: "cause", family: "Facteur Humain & État de l'Opérateur", title: "Mauvaise répartition des charges", description: "Choix individuel lors du portage : pile instable, un seul côté chargé.", image: "/cards/c-repartition.jpg", zones: ["membres-superieurs", "lombaires"] },
  { id: "c-effort", kind: "cause", family: "Facteur Humain & État de l'Opérateur", title: "Effort important lié au port de charge", description: "Réponse physiologique du corps face à une charge trop lourde.", image: "/cards/c-effort.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "c-stress", kind: "cause", family: "Facteur Humain & État de l'Opérateur", title: "Stress professionnel", description: "Pression, tension des trapèzes et du cou.", image: "/cards/c-stress.jpg", zones: ["cou"] },
  { id: "s-lumbago", kind: "symptome", family: "Symptômes", title: "Douleur aiguë subite (lumbago)", description: "Tour de rein : douleur brutale en zone lombaire.", image: null, zones: ["lombaires"] },
  { id: "s-cervicalgies", kind: "symptome", family: "Symptômes", title: "Cervicalgies", description: "Douleurs au niveau du cou.", image: null, zones: ["cou"] },
  { id: "s-tensions", kind: "symptome", family: "Symptômes", title: "Tensions musculaires vives", description: "Trapèzes et épaules contractés.", image: null, zones: ["cou", "membres-superieurs"] },
  { id: "s-fourmillement", kind: "symptome", family: "Symptômes", title: "Engourdissement / fourmillement", description: "Signes de compression nerveuse, type canal carpien.", image: null, zones: ["membres-superieurs"] },
  { id: "s-douleurs", kind: "symptome", family: "Symptômes", title: "Douleurs aiguës", description: "Douleur vive, souvent aux genoux ou à la charge.", image: null, zones: ["membres-inferieurs", "lombaires"] },
  { id: "s-craquement", kind: "symptome", family: "Symptômes", title: "Craquement", description: "Souffrance articulaire / cartilage.", image: null, zones: ["membres-inferieurs", "membres-superieurs"] },
  { id: "s-gonflement", kind: "symptome", family: "Symptômes", title: "Gonflement", description: "Inflammation / épanchement.", image: null, zones: ["membres-inferieurs", "membres-superieurs"] },
  { id: "p-decollement", kind: "prevention", family: "Prévention Technique", title: "Outils de décollement", description: "Marteau à plaque ou outils de décollement pour briser l'effet ventouse.", image: "/cards/p-decollement.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-treuil", kind: "prevention", family: "Prévention Technique", title: "Utilisation d'un treuil", description: "Mécaniser la traction pour supprimer l'effort manuel.", image: "/cards/p-treuil.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-mecanique", kind: "prevention", family: "Prévention Technique", title: "Levage mécanisé", description: "Nacelle, grue ou système de levage à la place du portage.", image: "/cards/p-mecanique.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-corde", kind: "prevention", family: "Prévention Technique", title: "Corde de guidage", description: "Guider la charge sans la retenir à bout de bras.", image: "/cards/p-corde.jpg", zones: ["membres-superieurs"] },
  { id: "p-equipements", kind: "prevention", family: "Prévention Technique", title: "Équipements adaptés", description: "Utiliser l'outil prévu pour la tâche.", image: "/cards/p-equipements.jpg", zones: ["membres-superieurs"] },
  { id: "p-verification", kind: "prevention", family: "Prévention Technique", title: "Vérification des accessoires", description: "Contrôler élingues et crochets avant le levage.", image: "/cards/p-verification.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-binome", kind: "prevention", family: "Prévention Organisationnelle", title: "Travail en binôme", description: "Favoriser le levage à deux pour toutes les plaques lourdes.", image: "/cards/p-binome.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-meteo", kind: "prevention", family: "Prévention Organisationnelle", title: "Planification météo", description: "Adapter l'opération aux conditions climatiques.", image: "/cards/p-meteo.jpg", zones: ["lombaires"] },
  { id: "p-poids", kind: "prevention", family: "Prévention Organisationnelle", title: "Réduction du poids", description: "Alléger les charges lorsque c'est possible.", image: "/cards/p-poids.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-analyse", kind: "prevention", family: "Prévention Organisationnelle", title: "Analyse préalable", description: "Préparer l'opération avant d'agir.", image: "/cards/p-analyse.jpg", zones: ["cou", "lombaires"] },
  { id: "p-plan", kind: "prevention", family: "Prévention Organisationnelle", title: "Plan de levage", description: "Définir qui fait quoi, avec quel moyen.", image: "/cards/p-plan.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-nombre", kind: "prevention", family: "Prévention Organisationnelle", title: "Nombre suffisant d'intervenants", description: "Assez de monde pour la charge à déplacer.", image: "/cards/p-nombre.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-gestes", kind: "prevention", family: "Prévention Humaine", title: "Gestes et postures", description: "Fléchir les genoux, dos droit, bras tendus, poussée des cuisses.", image: "/cards/p-gestes.jpg", zones: ["lombaires"] },
  { id: "p-echauffement", kind: "prevention", family: "Prévention Humaine", title: "Échauffement", description: "Préparer son corps à l'effort physique avant l'intervention.", image: "/cards/p-echauffement.jpg", zones: ["lombaires"] },
  { id: "p-manutention", kind: "prevention", family: "Prévention Humaine", title: "Formation manutention", description: "Former aux gestes adaptés de portage.", image: "/cards/p-manutention.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-levage", kind: "prevention", family: "Prévention Humaine", title: "Formation levage", description: "Savoir utiliser les moyens de levage en sécurité.", image: "/cards/p-levage.jpg", zones: ["lombaires", "membres-superieurs"] },
  { id: "p-briefing", kind: "prevention", family: "Prévention Humaine", title: "Briefing avant opération", description: "Partager le plan d'action avant de commencer.", image: "/cards/p-briefing.jpg", zones: ["cou"] },
  { id: "p-com", kind: "prevention", family: "Prévention Humaine", title: "Communication permanente", description: "Rester coordonnés pendant toute l'intervention.", image: "/cards/p-com.jpg", zones: ["cou"] },
];

export function cardById(id: string) {
  return CARDS.find((c) => c.id === id);
}

export function cardsOf(kind: Kind) {
  return CARDS.filter((c) => c.kind === kind);
}

export const KIND_LABEL: Record<Kind | "done", string> = {
  symptome: "1 / 3 — Placez les symptômes",
  cause: "2 / 3 — Placez les causes",
  prevention: "3 / 3 — Placez les moyens de prévention",
  done: "Fresque collective",
};

export const MESSAGES = {
  start: "Placez d'abord tous les symptômes aux bons endroits du corps.",
  afterSymptoms: "Symptômes validés. Les causes sont déverrouillées.",
  afterCauses: "Causes validées. Les moyens de prévention sont déverrouillés.",
  done: "Parcours terminé : symptômes, causes et préventions sont en place.",
  error: "Mauvais emplacement : la carte revient dans le jeu.",
  help: "Touchez d'abord la carte, puis la zone du corps.",
};
