export const ACCESSIBILITY_STORAGE_KEY = "eyebreed-accessibility-v1";
export const ACCESSIBILITY_POSITION_STORAGE_KEY =
  "eyebreed-accessibility-position-v1";
export const ACCESSIBILITY_WIDGET_SIZE = 56;
export const ACCESSIBILITY_WIDGET_GAP = 12;

export type AccessibilityWidgetEdge = "left" | "right";

export type AccessibilityWidgetPosition = {
  edge: AccessibilityWidgetEdge;
  top: number;
};

export function clampAccessibilityWidgetTop(top: number, viewportHeight: number) {
  const maximum = Math.max(
    ACCESSIBILITY_WIDGET_GAP,
    viewportHeight - ACCESSIBILITY_WIDGET_SIZE - ACCESSIBILITY_WIDGET_GAP,
  );
  return Math.min(Math.max(top, ACCESSIBILITY_WIDGET_GAP), maximum);
}

export function defaultAccessibilityWidgetPosition(
  viewportHeight: number,
): AccessibilityWidgetPosition {
  return {
    edge: "left",
    top: clampAccessibilityWidgetTop(20, viewportHeight),
  };
}

export function parseAccessibilityWidgetPosition(
  value: string | null,
  viewportHeight: number,
): AccessibilityWidgetPosition {
  try {
    const parsed = JSON.parse(value ?? "null") as Partial<AccessibilityWidgetPosition> | null;
    if (
      parsed &&
      (parsed.edge === "left" || parsed.edge === "right") &&
      typeof parsed.top === "number" &&
      Number.isFinite(parsed.top)
    ) {
      return {
        edge: parsed.edge,
        top: clampAccessibilityWidgetTop(parsed.top, viewportHeight),
      };
    }
  } catch {}
  return defaultAccessibilityWidgetPosition(viewportHeight);
}

export type AccessibilityPreferences = {
  fontSize: 0 | 1 | 2;
  highContrast: boolean;
  monochrome: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
  readableFont: boolean;
};

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  fontSize: 0,
  highContrast: false,
  monochrome: false,
  underlineLinks: false,
  reduceMotion: false,
  readableFont: false,
};

export const accessibilityBootstrap = `(()=>{try{const value=JSON.parse(localStorage.getItem(${JSON.stringify(ACCESSIBILITY_STORAGE_KEY)})||'null');if(!value||typeof value!=='object')return;const root=document.documentElement;const font=value.fontSize===1||value.fontSize===2?String(value.fontSize):'0';root.dataset.a11yFont=font;for(const [key,dataKey] of [['highContrast','a11yContrast'],['monochrome','a11yMonochrome'],['underlineLinks','a11yLinks'],['reduceMotion','a11yMotion'],['readableFont','a11yReadable']]){if(value[key]===true)root.dataset[dataKey]='true';else delete root.dataset[dataKey];}}catch{}})();`;
