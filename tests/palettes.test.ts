import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  palettes,
  paletteVariables,
  paletteBootstrap,
  getPalette,
  readableAccent,
} from "../lib/palettes";

const channels = (hex: string) =>
  [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
const luminance = (values: number[]) =>
  values
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0,
    );
const contrast = (a: number[], b: number[]) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);

for (const palette of palettes) {
  test(`${palette.name} maintains readable text, buttons, accents, and muted labels`, () => {
    for (const [foreground, background] of [
      [palette.dark, palette.cream],
      [palette.light, palette.dark],
      [palette.light, palette.accent],
      [palette.soft, palette.dark],
      [readableAccent(palette), palette.cream],
    ]) {
      assert.ok(
        contrast(channels(foreground), channels(background)) >= 4.5,
        `${foreground} on ${background} fails WCAG AA`,
      );
    }
    for (const [foreground, background] of [
      [palette.light, palette.dark],
      [palette.dark, palette.cream],
    ]) {
      const base = channels(background);
      const muted = channels(foreground).map(
        (value, index) => value * 0.75 + base[index] * 0.25,
      );
      assert.ok(contrast(muted, base) >= 4.5);
    }
  });
}

test("saved palettes initialize before hydration; unknown and corrupt values fail safely", () => {
  for (const saved of [
    JSON.stringify({ palette: "ocean", dismissed: true }),
    JSON.stringify({ palette: "unknown" }),
    "broken",
    null,
  ]) {
    const styles: Record<string, string> = {};
    const root = {
      style: {
        setProperty: (key: string, value: string) => {
          styles[key] = value;
        },
      },
      dataset: {} as Record<string, string>,
    };
    runInNewContext(paletteBootstrap, {
      document: { documentElement: root },
      localStorage: { getItem: () => saved },
    });
    if (saved === "broken") assert.deepEqual(styles, {});
    else {
      const choice = getPalette(saved ? JSON.parse(saved).palette : undefined);
      assert.equal(root.dataset.palette, choice.id);
      assert.deepEqual(styles, paletteVariables(choice));
    }
  }
  assert.equal(getPalette("invalid").id, "original");
  assert.equal(getPalette("lilac").id, "navy");
  assert.equal(getPalette("clay").id, "blush");
});

test("every named role preserves its exact five-color definition", () => {
  const expected: Record<string, string[]> = {
    original: ["#1A1110", "#76513F", "#9A8072", "#F4F0E8", "#FFFFFF"],
    ocean: ["#121315", "#3B4856", "#8C9A9E", "#F2F4F5", "#FFFFFF"],
    navy: ["#0B1320", "#1C2A3A", "#D4AF37", "#F7F5F0", "#FFFFFF"],
    sage: ["#1E2421", "#5B685B", "#A3B18A", "#F3F4F1", "#FFFFFF"],
    blush: ["#161618", "#8A6B70", "#D2B4B8", "#F8F6F6", "#FFFFFF"],
  };
  palettes.forEach((palette) =>
    assert.deepEqual(
      palette.roles.map((role) => role.hex),
      expected[palette.id],
    ),
  );
});
