"use client";

import Link from "next/link";
import {
  PersonStanding,
  Baseline,
  Contrast,
  Eye,
  Link2,
  Pause,
  RotateCcw,
  Type,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCESSIBILITY_POSITION_STORAGE_KEY,
  ACCESSIBILITY_STORAGE_KEY,
  ACCESSIBILITY_WIDGET_GAP,
  ACCESSIBILITY_WIDGET_SIZE,
  clampAccessibilityWidgetTop,
  defaultAccessibilityPreferences,
  defaultAccessibilityWidgetPosition,
  parseAccessibilityWidgetPosition,
  type AccessibilityPreferences,
  type AccessibilityWidgetPosition,
} from "@/lib/accessibility";
import { useStore } from "@/components/store-provider";

const preferenceDataset: Record<
  Exclude<keyof AccessibilityPreferences, "fontSize">,
  string
> = {
  highContrast: "a11yContrast",
  monochrome: "a11yMonochrome",
  underlineLinks: "a11yLinks",
  reduceMotion: "a11yMotion",
  readableFont: "a11yReadable",
};

export function AccessibilityMenu() {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const [open, setOpen] = useState(false);
  const [widgetPosition, setWidgetPosition] =
    useState<AccessibilityWidgetPosition | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [preferences, setPreferences] = useState(
    defaultAccessibilityPreferences,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const widgetPositionRef = useRef<AccessibilityWidgetPosition | null>(null);
  const suppressClickRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTop: number;
    moved: boolean;
  } | null>(null);

  const updateWidgetPosition = useCallback(
    (position: AccessibilityWidgetPosition) => {
      const next = {
        edge: position.edge,
        top: clampAccessibilityWidgetTop(position.top, window.innerHeight),
      } satisfies AccessibilityWidgetPosition;
      widgetPositionRef.current = next;
      setWidgetPosition(next);
    },
    [],
  );

  useEffect(() => {
    const restore = () => {
      setViewportWidth(window.innerWidth);
      const current = widgetPositionRef.current;
      updateWidgetPosition(
        current
          ? {
              ...current,
              top: clampAccessibilityWidgetTop(current.top, window.innerHeight),
            }
          : parseAccessibilityWidgetPosition(
              (() => {
                try {
                  return localStorage.getItem(
                    ACCESSIBILITY_POSITION_STORAGE_KEY,
                  );
                } catch {
                  return null;
                }
              })(),
              window.innerHeight,
            ),
      );
    };
    restore();
    window.addEventListener("resize", restore);
    return () => window.removeEventListener("resize", restore);
  }, [updateWidgetPosition]);

  useEffect(() => {
    if (!widgetPosition) return;
    localStorage.setItem(
      ACCESSIBILITY_POSITION_STORAGE_KEY,
      JSON.stringify(widgetPosition),
    );
  }, [widgetPosition]);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(ACCESSIBILITY_STORAGE_KEY) ?? "null",
      ) as Partial<AccessibilityPreferences> | null;
      if (!saved) return;
      setPreferences({
        fontSize:
          saved.fontSize === 1 || saved.fontSize === 2 ? saved.fontSize : 0,
        highContrast: saved.highContrast === true,
        monochrome: saved.monochrome === true,
        underlineLinks: saved.underlineLinks === true,
        reduceMotion: saved.reduceMotion === true,
        readableFont: saved.readableFont === true,
      });
    } catch {
      localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.a11yFont = String(preferences.fontSize);
    Object.entries(preferenceDataset).forEach(([key, dataKey]) => {
      if (preferences[key as keyof typeof preferenceDataset]) {
        root.dataset[dataKey] = "true";
      } else {
        delete root.dataset[dataKey];
      }
    });
    localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  }, [preferences]);

  useEffect(() => {
    if (!open) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : triggerRef.current;
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [open]);

  function toggle(key: Exclude<keyof AccessibilityPreferences, "fontSize">) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  const text = hebrew
    ? {
        open: "פתיחת תפריט נגישות",
        close: "סגירת תפריט נגישות",
        title: "כלי נגישות",
        intro: "בחרו התאמות תצוגה. ההעדפות נשמרות במכשיר זה.",
        font: "גודל טקסט",
        decrease: "הקטנת טקסט",
        increase: "הגדלת טקסט",
        contrast: "ניגודיות גבוהה",
        monochrome: "תצוגת גווני אפור",
        links: "הדגשת קישורים",
        motion: "הפחתת תנועה",
        readable: "גופן קריא",
        reset: "איפוס התאמות",
        statement: "להצהרת הנגישות",
        dragHint:
          "ניתן לגרור את הכפתור למעלה ולמטה או לצד השני. במקלדת השתמשו במקשי החיצים, Home ו-End.",
      }
    : {
        open: "Open accessibility menu",
        close: "Close accessibility menu",
        title: "Accessibility tools",
        intro:
          "Choose display adjustments. Preferences are saved on this device.",
        font: "Text size",
        decrease: "Decrease text size",
        increase: "Increase text size",
        contrast: "High contrast",
        monochrome: "Grayscale display",
        links: "Emphasize links",
        motion: "Reduce motion",
        readable: "Readable font",
        reset: "Reset adjustments",
        statement: "Accessibility statement",
        dragHint:
          "Drag the button up, down, or across to the other edge. With a keyboard, use the arrow, Home, and End keys.",
      };

  const resolvedPosition =
    widgetPosition ?? defaultAccessibilityWidgetPosition(800);
  const widgetLeft =
    viewportWidth > 0 && resolvedPosition.edge === "right"
      ? Math.max(
          ACCESSIBILITY_WIDGET_GAP,
          viewportWidth - ACCESSIBILITY_WIDGET_SIZE - ACCESSIBILITY_WIDGET_GAP,
        )
      : ACCESSIBILITY_WIDGET_GAP;

  function moveWidgetWithKeyboard(
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) {
    if (!widgetPosition) return;
    const step = event.shiftKey ? 48 : 16;
    let next: AccessibilityWidgetPosition | null = null;
    if (event.key === "ArrowUp")
      next = { ...widgetPosition, top: widgetPosition.top - step };
    if (event.key === "ArrowDown")
      next = { ...widgetPosition, top: widgetPosition.top + step };
    if (event.key === "ArrowLeft") next = { ...widgetPosition, edge: "left" };
    if (event.key === "ArrowRight") next = { ...widgetPosition, edge: "right" };
    if (event.key === "Home")
      next = { ...widgetPosition, top: ACCESSIBILITY_WIDGET_GAP };
    if (event.key === "End")
      next = { ...widgetPosition, top: window.innerHeight };
    if (!next) return;
    event.preventDefault();
    updateWidgetPosition(next);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={text.open}
        aria-expanded={open}
        aria-controls="accessibility-panel"
        aria-describedby="accessibility-drag-hint"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          setOpen(true);
        }}
        onKeyDown={moveWidgetWithKeyboard}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          const position =
            widgetPositionRef.current ??
            defaultAccessibilityWidgetPosition(window.innerHeight);
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startTop: position.top,
            moved: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const distance = Math.hypot(
            event.clientX - drag.startX,
            event.clientY - drag.startY,
          );
          if (distance < 6 && !drag.moved) return;
          drag.moved = true;
          event.preventDefault();
          updateWidgetPosition({
            edge: event.clientX < window.innerWidth / 2 ? "left" : "right",
            top: drag.startTop + event.clientY - drag.startY,
          });
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          suppressClickRef.current = drag.moved;
          dragRef.current = null;
          setDragging(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={(event) => {
          if (dragRef.current?.pointerId !== event.pointerId) return;
          suppressClickRef.current = dragRef.current.moved;
          dragRef.current = null;
          setDragging(false);
        }}
        style={{
          left: widgetLeft,
          top: widgetPosition ? widgetPosition.top : undefined,
          bottom: widgetPosition ? undefined : 20,
        }}
        className={`accessibility-trigger fixed z-[90] grid h-[56px] w-[56px] touch-none select-none place-items-center rounded-full border-2 border-white bg-[#151515] text-white shadow-[0_8px_30px_rgba(0,0,0,.35)] transition-[left,transform,background-color] duration-200 hover:scale-105 hover:bg-black ${dragging ? "cursor-grabbing scale-105" : "cursor-grab"}`}
      >
        <PersonStanding size={29} strokeWidth={2} aria-hidden="true" />
      </button>
      <span id="accessibility-drag-hint" className="sr-only">
        {text.dragHint}
      </span>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[101] cursor-default bg-black/55"
          />
          <div
            ref={panelRef}
            id="accessibility-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-title"
            aria-describedby="accessibility-description"
            dir={hebrew ? "rtl" : "ltr"}
            className={`fixed inset-x-3 bottom-3 z-[102] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-black/15 bg-white p-5 text-[#111] shadow-2xl sm:inset-x-auto sm:bottom-5 sm:w-[390px] sm:p-6 ${resolvedPosition.edge === "left" ? "sm:left-5 sm:right-auto" : "sm:left-auto sm:right-5"}`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/15 pb-4">
              <div>
                <h2 id="accessibility-title" className="text-xl font-semibold">
                  {text.title}
                </h2>
                <p
                  id="accessibility-description"
                  className="mt-2 text-sm leading-6 text-black/75"
                >
                  {text.intro}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label={text.close}
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/20"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-black/15 p-4">
              <div className="flex items-center gap-3">
                <Type size={20} aria-hidden="true" />
                <span className="flex-1 text-sm font-medium">{text.font}</span>
                <span
                  aria-live="polite"
                  className="min-w-12 text-center text-sm"
                >
                  {["100%", "112%", "125%"][preferences.fontSize]}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-label={text.decrease}
                  disabled={preferences.fontSize === 0}
                  onClick={() =>
                    setPreferences((current) => ({
                      ...current,
                      fontSize: Math.max(0, current.fontSize - 1) as 0 | 1 | 2,
                    }))
                  }
                  className="min-h-11 rounded-lg border border-black/25 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-35"
                >
                  A−
                </button>
                <button
                  type="button"
                  aria-label={text.increase}
                  disabled={preferences.fontSize === 2}
                  onClick={() =>
                    setPreferences((current) => ({
                      ...current,
                      fontSize: Math.min(2, current.fontSize + 1) as 0 | 1 | 2,
                    }))
                  }
                  className="min-h-11 rounded-lg border border-black/25 text-xl font-semibold disabled:cursor-not-allowed disabled:opacity-35"
                >
                  A+
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <PreferenceButton
                icon={<Contrast size={20} aria-hidden="true" />}
                label={text.contrast}
                pressed={preferences.highContrast}
                onClick={() => toggle("highContrast")}
              />
              <PreferenceButton
                icon={<Eye size={20} aria-hidden="true" />}
                label={text.monochrome}
                pressed={preferences.monochrome}
                onClick={() => toggle("monochrome")}
              />
              <PreferenceButton
                icon={<Link2 size={20} aria-hidden="true" />}
                label={text.links}
                pressed={preferences.underlineLinks}
                onClick={() => toggle("underlineLinks")}
              />
              <PreferenceButton
                icon={<Pause size={20} aria-hidden="true" />}
                label={text.motion}
                pressed={preferences.reduceMotion}
                onClick={() => toggle("reduceMotion")}
              />
              <PreferenceButton
                icon={<Baseline size={20} aria-hidden="true" />}
                label={text.readable}
                pressed={preferences.readableFont}
                onClick={() => toggle("readableFont")}
              />
              <button
                type="button"
                onClick={() => setPreferences(defaultAccessibilityPreferences)}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-black/20 px-3 py-4 text-center text-xs font-medium transition hover:bg-black/5"
              >
                <RotateCcw size={20} aria-hidden="true" />
                {text.reset}
              </button>
            </div>

            <Link
              href="/accessibility"
              onClick={() => setOpen(false)}
              className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-[#111] px-5 py-3 text-center text-sm font-semibold text-white underline underline-offset-4"
            >
              {text.statement}
            </Link>
          </div>
        </>
      )}
    </>
  );
}

function PreferenceButton({
  icon,
  label,
  pressed,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-center text-xs font-medium transition ${
        pressed
          ? "border-black bg-black text-white"
          : "border-black/20 hover:bg-black/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
