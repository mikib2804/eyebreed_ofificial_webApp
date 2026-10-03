"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import {
  getPalette,
  palettes,
  paletteColors,
  paletteVariables,
  PALETTE_STORAGE_KEY,
  PALETTE_TIMEOUT_MS,
  type Palette,
} from "@/lib/palettes";

type PaletteState = {
  palette: Palette;
  open: boolean;
  show: (anchor: HTMLButtonElement) => void;
};
const PaletteContext = createContext<PaletteState | null>(null);
const POPOVER_ID = "website-palette-popover";

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [palette, setPalette] = useState<Palette>(palettes[0]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const dismissed = useRef(false);
  const paletteRef = useRef<Palette>(palettes[0]);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef(pathname);

  const save = useCallback((choice: Palette, wasDismissed: boolean) => {
    try {
      localStorage.setItem(
        PALETTE_STORAGE_KEY,
        JSON.stringify({ palette: choice.id, dismissed: wasDismissed }),
      );
    } catch {
      /* Continue in memory when storage is unavailable. */
    }
  }, []);
  const close = useCallback(
    (restoreFocus = false) => {
      dismissed.current = true;
      save(paletteRef.current, true);
      setOpen(false);
      if (restoreFocus || popoverRef.current?.contains(document.activeElement))
        anchorRef.current?.focus();
    },
    [save],
  );
  const show = useCallback(
    (anchor: HTMLButtonElement) => {
      if (open) {
        close(true);
        return;
      }
      anchorRef.current = anchor;
      setOpen(true);
    },
    [open, close],
  );

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(PALETTE_STORAGE_KEY) ?? "null",
      );
      const restored = getPalette(saved?.palette);
      paletteRef.current = restored;
      setPalette(restored);
      dismissed.current = saved?.dismissed === true;
    } catch {
      /* Invalid preferences use the default palette. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    Object.entries(paletteVariables(palette)).forEach(([key, value]) =>
      document.documentElement.style.setProperty(key, value),
    );
    document.documentElement.dataset.palette = palette.id;
  }, [palette, ready]);

  useEffect(() => {
    if (!ready) return;
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      setOpen(false);
    }
    if (pathname === "/" && !dismissed.current) {
      anchorRef.current = document.querySelector<HTMLButtonElement>(
        "[data-palette-trigger]",
      );
      if (anchorRef.current) setOpen(true);
    }
  }, [pathname, ready]);

  useEffect(() => {
    if (!open) return;
    const popover = popoverRef.current;
    const anchor = anchorRef.current;
    if (!popover || !anchor) return;
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        close();
        return;
      }
      const width = Math.min(360, window.innerWidth - 32);
      const left = Math.max(
        16,
        Math.min(rect.right - width, window.innerWidth - width - 16),
      );
      const top = Math.max(
        16,
        Math.min(rect.bottom + 14, window.innerHeight - 100),
      );
      popover.style.width = width + "px";
      popover.style.left = left + "px";
      popover.style.top = top + "px";
      const availableHeight = Math.max(80, window.innerHeight - top - 16);
      popover.style.maxHeight = availableHeight + "px";
      popover.style.setProperty("--palette-options-height", Math.max(28, availableHeight - 56) + "px");
      popover.style.setProperty(
        "--pointer-x",
        Math.max(18, Math.min(rect.left + rect.width / 2 - left, width - 18)) +
          "px",
      );
    };
    place();
    popover.showPopover();
    popover
      .querySelector<HTMLButtonElement>('[aria-checked="true"]')
      ?.focus({ preventScroll: true });
    // This effect depends only on open and the stable close callback, not palette renders.
    const timer = window.setTimeout(() => close(), PALETTE_TIMEOUT_MS);
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !popover.contains(event.target) &&
        !anchor.contains(event.target)
      )
        close();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    const focusOutside = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        !popover.contains(event.target) &&
        !anchor.contains(event.target)
      )
        close();
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("focusin", focusOutside);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("focusin", focusOutside);
      if (popover.matches(":popover-open")) popover.hidePopover();
    };
  }, [open, close]);

  const choose = (choice: Palette) => {
    paletteRef.current = choice;
    setPalette(choice);
    dismissed.current = true;
    save(choice, true);
    setOpen(false);
    anchorRef.current?.focus();
  };

  return (
    <PaletteContext.Provider value={{ palette, open, show }}>
      {children}
      <div
        ref={popoverRef}
        id={POPOVER_ID}
        popover="manual"
        role="dialog"
        aria-modal="false"
        aria-labelledby="palette-title"
        className="palette-popover"
      >
        <svg
          className="palette-pointer"
          width="30"
          height="24"
          viewBox="0 0 30 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 22C3 10 15 14 22 3M15 4L23 2L26 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <h2
            id="palette-title"
            className="text-[10px] uppercase tracking-[.18em]"
          >
            Select your color palette
          </h2>
          <button
            type="button"
            onClick={() => close(true)}
            aria-label="Close palette selector"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-ink/10"
          >
            <X size={16} />
          </button>
        </div>
        <div
          className="palette-options"
          role="radiogroup"
          aria-label="Website color palette"
          onKeyDown={(event) => {
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="radio"]',
              ),
            );
            const current = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const direction =
              event.key === "ArrowRight" || event.key === "ArrowDown"
                ? 1
                : event.key === "ArrowLeft" || event.key === "ArrowUp"
                  ? -1
                  : 0;
            if (!direction && event.key !== "Home" && event.key !== "End")
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? buttons.length - 1
                  : (current + direction + buttons.length) % buttons.length;
            buttons[next]?.focus();
          }}
        >
          {palettes.map((choice) => (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={choice.id === palette.id}
              tabIndex={choice.id === palette.id ? 0 : -1}
              onClick={() => choose(choice)}
              className="palette-option"
              title={choice.roles
                .map((role) => role.name + " " + role.hex + " — " + role.use)
                .join("\n")}
            >
              <span
                className="flex h-9 w-20 shrink-0 overflow-hidden rounded border border-ink/20"
                aria-hidden="true"
              >
                {paletteColors(choice).map((color) => (
                  <span
                    key={color}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1 text-start text-[11px] leading-4">
                {choice.name}
              </span>
              <span className="grid w-5 shrink-0 place-items-center">
                {choice.id === palette.id && <Check size={16} />}
              </span>
              {choice.id === palette.id && (
                <span className="sr-only">Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">
        {palette.name} palette selected
      </span>
    </PaletteContext.Provider>
  );
}

export function PaletteSwatch({ hero = false }: { hero?: boolean }) {
  const context = useContext(PaletteContext);
  if (!context) throw new Error("PaletteSwatch requires PaletteProvider");
  const { palette, open, show } = context;
  return (
    <button
      type="button"
      data-palette-trigger
      onClick={(event) => show(event.currentTarget)}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={POPOVER_ID}
      aria-label={"Your Palette. Current palette: " + palette.name}
      className={
        hero
          ? "absolute end-5 top-5 z-20 flex min-h-11 items-center gap-3 rounded-full border border-white/40 bg-ink/95 px-3 py-2 text-[10px] text-white sm:end-10"
          : "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/40"
      }
    >
      <span
        className="flex h-5 w-5 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        {paletteColors(palette).map((color) => (
          <span
            key={color}
            className="flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      {hero && <span className="tracking-wider">Your Palette</span>}
    </button>
  );
}
