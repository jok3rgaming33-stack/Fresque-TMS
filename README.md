# Fresque TMS

Atelier coopératif de formation aux Troubles Musculo-Squelettiques.

Le groupe place des cartes sur un corps humain : **symptômes → causes → préventions**.

## Lancer

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000

- **Commencer l'atelier** : crée une salle (code + QR).
- **Rejoindre** : prénom + code, sans compte.
- **Autour de la table** : un seul appareil, plusieurs prénoms.
- **Réviser seul** : parcours individuel.

Deux onglets, même code : l'état se synchronise (poll &lt; 1 s).

## Build

```bash
npm run build
npm start
```

## PWA

Installable depuis le navigateur (manifest + service worker). Le jeu déjà chargé reste consultable hors-ligne.

## Données

45 cartes et 4 zones dans `src/data/`.
