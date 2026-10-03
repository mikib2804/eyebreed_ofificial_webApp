export const PALETTE_STORAGE_KEY = "eyebreed-palette-v1";
export const PALETTE_TIMEOUT_MS = 57_000;
const paletteDefinitions = [
  {
    id: "original",
    name: "Refined Luxury Warmth",
    roles: [
      {
        role: "Primary Dark",
        name: "Espresso Black",
        hex: "#1A1110",
        use: "Main backgrounds and dark UI sections",
      },
      {
        role: "Rich Accent",
        name: "Warm Chestnut",
        hex: "#76513F",
        use: "Featured buttons, badges, navigation highlights",
      },
      {
        role: "Mid Tone",
        name: "Muted Taupe",
        hex: "#9A8072",
        use: "Secondary text, subtle borders, card backgrounds",
      },
      {
        role: "Soft Background",
        name: "Cream Silk",
        hex: "#F4F0E8",
        use: "Light section backgrounds and text contrast",
      },
      {
        role: "Logo Color",
        name: "Pure White",
        hex: "#FFFFFF",
        use: "Primary logo variant",
      },
    ],
  },
  {
    id: "blush",
    name: "Blush & Noir",
    roles: [
      {
        role: "Primary Dark",
        name: "Velvet Jet Black",
        hex: "#161618",
        use: "Deep header and hero background",
      },
      {
        role: "Accent Tone",
        name: "Rose Taupe",
        hex: "#8A6B70",
        use: "Accent buttons and active highlights",
      },
      {
        role: "Soft Highlight",
        name: "Soft Rose Dust",
        hex: "#D2B4B8",
        use: "Supporting text, badge borders, notification dots",
      },
      {
        role: "Soft Background",
        name: "Soft Porcelain",
        hex: "#F8F6F6",
        use: "Light section canvas",
      },
      {
        role: "Logo Color",
        name: "Pure White",
        hex: "#FFFFFF",
        use: "Primary logo variant",
      },
    ],
  },
  {
    id: "ocean",
    name: "High-Fashion Midnight & Cool Steel",
    roles: [
      {
        role: "Primary Dark",
        name: "Charcoal Obsidian",
        hex: "#121315",
        use: "Hero banner and footer background",
      },
      {
        role: "Accent Tone",
        name: "Slate Blue",
        hex: "#3B4856",
        use: "Primary CTAs, hover states, active menu items",
      },
      {
        role: "Highlight",
        name: "Cool Silver",
        hex: "#8C9A9E",
        use: "Secondary badges and supporting copy",
      },
      {
        role: "Soft Background",
        name: "Off-White Pearl",
        hex: "#F2F4F5",
        use: "Light sections and switch backgrounds",
      },
      {
        role: "Logo Color",
        name: "Pure White",
        hex: "#FFFFFF",
        use: "Primary logo variant",
      },
    ],
  },
  {
    id: "navy",
    name: "Deep Regal Navy & Champagne",
    roles: [
      {
        role: "Primary Dark",
        name: "Midnight Navy",
        hex: "#0B1320",
        use: "Full-site dark backdrop",
      },
      {
        role: "Accent Tone",
        name: "Deep Indigo",
        hex: "#1C2A3A",
        use: "Card containers and navigation headers",
      },
      {
        role: "Warm Highlight",
        name: "Champagne Gold",
        hex: "#D4AF37",
        use: "Badges, discount banners, price highlights",
      },
      {
        role: "Soft Background",
        name: "Sand Linen",
        hex: "#F7F5F0",
        use: "Content section backgrounds",
      },
      {
        role: "Logo Color",
        name: "Pure White",
        hex: "#FFFFFF",
        use: "Primary logo variant",
      },
    ],
  },
  {
    id: "sage",
    name: "The Banker's Sage & Slate",
    roles: [
      {
        role: "Primary Dark",
        name: "Dark Moss Graphite",
        hex: "#1E2421",
        use: "Deep base background",
      },
      {
        role: "Accent Tone",
        name: "Muted Olive Sage",
        hex: "#5B685B",
        use: "Hero banners and primary buttons",
      },
      {
        role: "Soft Highlight",
        name: "Dusty Eucalyptus",
        hex: "#A3B18A",
        use: "Interactive hover highlights and chips",
      },
      {
        role: "Soft Background",
        name: "Alabaster",
        hex: "#F3F4F1",
        use: "Light cards and page sections",
      },
      {
        role: "Logo Color",
        name: "Pure White",
        hex: "#FFFFFF",
        use: "Primary logo variant",
      },
    ],
  },
] as const;
export const palettes = paletteDefinitions.map((definition) => ({
  ...definition,
  dark: definition.roles[0].hex,
  accent: definition.roles[1].hex,
  soft: definition.roles[2].hex,
  cream: definition.roles[3].hex,
  light: definition.roles[4].hex,
}));
export type Palette = (typeof palettes)[number];
export const legacyPaletteIds: Record<string, string> = {
  lilac: "navy",
  clay: "blush",
};
export function getPalette(id: unknown): Palette {
  const resolved = typeof id === "string" ? (legacyPaletteIds[id] ?? id) : id;
  return palettes.find((palette) => palette.id === resolved) ?? palettes[0];
}
export function paletteColors(palette: Palette) {
  return palette.roles.map((role) => role.hex);
}
const rgb = (hex: string) =>
  [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16))
    .join(" ");
const luminance = (hex: string) =>
  [1, 3, 5]
    .map((offset) => {
      const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0,
    );
export function readableAccent(palette: Palette) {
  const contrast =
    (luminance(palette.cream) + 0.05) / (luminance(palette.accent) + 0.05);
  return contrast >= 4.5 ? palette.accent : palette.dark;
}
export function paletteVariables(palette: Palette): Record<string, string> {
  return {
    "--ink": palette.dark,
    "--charcoal": palette.accent,
    "--cream": palette.cream,
    "--espresso": palette.accent,
    "--color-ink": rgb(palette.dark),
    "--color-charcoal": rgb(palette.accent),
    "--color-cream": rgb(palette.cream),
    "--color-paper": rgb(palette.light),
    "--color-accent": rgb(palette.accent),
    "--color-strong": rgb(palette.accent),
    "--color-soft": rgb(palette.soft),
    "--color-accent-text": rgb(readableAccent(palette)),
  };
}
export const paletteBootstrap = `(()=>{try{const saved=JSON.parse(localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)})||'null');const themes=${JSON.stringify(Object.fromEntries(palettes.map((palette) => [palette.id, paletteVariables(palette)])))};const legacy=${JSON.stringify(legacyPaletteIds)};const selected=saved&&(legacy[saved.palette]||saved.palette);const id=Object.prototype.hasOwnProperty.call(themes,selected)?selected:'original';Object.entries(themes[id]).forEach(([key,value])=>document.documentElement.style.setProperty(key,value));document.documentElement.dataset.palette=id;}catch{}})();`;
