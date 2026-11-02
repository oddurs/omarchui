export const SECTIONS = [
  { ws: 1, id: "thesis", name: "Thesis" },
  { ws: 2, id: "rules", name: "Rules" },
  { ws: 3, id: "color", name: "Color" },
  { ws: 4, id: "type", name: "Type" },
  { ws: 5, id: "space", name: "Space" },
  { ws: 6, id: "parts", name: "Parts" },
  { ws: 7, id: "keys", name: "Keys" },
  { ws: 8, id: "theme-file", name: "Theme file" },
] as const;

export type Section = (typeof SECTIONS)[number];
