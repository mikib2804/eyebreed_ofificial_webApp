import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  ACCESSIBILITY_POSITION_STORAGE_KEY,
  ACCESSIBILITY_STORAGE_KEY,
  ACCESSIBILITY_WIDGET_GAP,
  ACCESSIBILITY_WIDGET_SIZE,
  accessibilityBootstrap,
  clampAccessibilityWidgetTop,
  defaultAccessibilityWidgetPosition,
  defaultAccessibilityPreferences,
  parseAccessibilityWidgetPosition,
} from "../lib/accessibility";

test("accessibility preferences have a safe, non-transforming default", () => {
  assert.deepEqual(defaultAccessibilityPreferences, {
    fontSize: 0,
    highContrast: false,
    monochrome: false,
    underlineLinks: false,
    reduceMotion: false,
    readableFont: false,
  });
  assert.equal(ACCESSIBILITY_STORAGE_KEY, "eyebreed-accessibility-v1");
});

test("widget positions stay on a valid edge and inside the viewport", () => {
  assert.equal(ACCESSIBILITY_POSITION_STORAGE_KEY, "eyebreed-accessibility-position-v1");
  assert.deepEqual(defaultAccessibilityWidgetPosition(600), {
    edge: "left",
    top: 20,
  });
  assert.deepEqual(parseAccessibilityWidgetPosition(
    JSON.stringify({ edge: "left", top: -100 }),
    600,
  ), { edge: "left", top: ACCESSIBILITY_WIDGET_GAP });
  assert.deepEqual(parseAccessibilityWidgetPosition(
    JSON.stringify({ edge: "right", top: 10_000 }),
    600,
  ), {
    edge: "right",
    top: 600 - ACCESSIBILITY_WIDGET_SIZE - ACCESSIBILITY_WIDGET_GAP,
  });
  assert.deepEqual(
    parseAccessibilityWidgetPosition(JSON.stringify({ edge: "middle", top: 50 }), 600),
    defaultAccessibilityWidgetPosition(600),
  );
  assert.equal(
    clampAccessibilityWidgetTop(80, 100),
    100 - ACCESSIBILITY_WIDGET_SIZE - ACCESSIBILITY_WIDGET_GAP,
  );
});

test("saved accessibility preferences initialize before hydration", () => {
  const dataset: Record<string, string> = {};
  const saved = JSON.stringify({
    fontSize: 2,
    highContrast: true,
    monochrome: false,
    underlineLinks: true,
    reduceMotion: true,
    readableFont: false,
  });

  runInNewContext(accessibilityBootstrap, {
    document: { documentElement: { dataset } },
    localStorage: { getItem: () => saved },
  });

  assert.deepEqual(dataset, {
    a11yFont: "2",
    a11yContrast: "true",
    a11yLinks: "true",
    a11yMotion: "true",
  });
});

test("invalid accessibility storage fails safely", () => {
  for (const saved of ["broken", "null", JSON.stringify({ fontSize: 9 })]) {
    const dataset: Record<string, string> = {};
    runInNewContext(accessibilityBootstrap, {
      document: { documentElement: { dataset } },
      localStorage: { getItem: () => saved },
    });
    if (saved.includes("fontSize")) assert.equal(dataset.a11yFont, "0");
    else assert.deepEqual(dataset, {});
  }
});
