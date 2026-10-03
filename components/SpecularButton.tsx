"use client";

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type PointerEvent } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
};

const sizeClasses = { sm: "min-h-9 px-3 py-2", md: "min-h-11 px-5 py-3", lg: "min-h-14 px-7 py-4" };

const SpecularButton = forwardRef<HTMLButtonElement, Props>(function SpecularButton({
  size = "md", radius = 0, tint = "rgb(var(--color-paper))", tintOpacity = 0, blur = 0,
  textColor = "rgb(var(--color-paper))", lineColor = "rgb(var(--color-paper))", baseColor = "var(--charcoal)",
  intensity = 1, shineSize = 10, shineFade = 40, thickness = 1, speed = 0.35,
  followMouse = true, proximity = 250, autoAnimate = false, className = "",
  children, onPointerMove, onPointerLeave, style, ...props
}, ref) {
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (followMouse) {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--specular-x", `${event.clientX - bounds.left}px`);
      event.currentTarget.style.setProperty("--specular-y", `${event.clientY - bounds.top}px`);
    }
    onPointerMove?.(event);
  };
  const leave = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.removeProperty("--specular-x");
    event.currentTarget.style.removeProperty("--specular-y");
    onPointerLeave?.(event);
  };
  const variables = {
    "--specular-radius": `${radius}px`, "--specular-tint": tint,
    "--specular-tint-opacity": tintOpacity, "--specular-blur": `${blur}px`,
    "--specular-text": textColor, "--specular-line": lineColor,
    "--specular-base": baseColor, "--specular-intensity": intensity,
    "--specular-size": `${shineSize}px`, "--specular-fade": `${shineFade}px`,
    "--specular-thickness": `${thickness}px`, "--specular-speed": `${speed}s`,
    "--specular-proximity": `${proximity}px`
  } as CSSProperties;

  return (
    <button ref={ref} {...props} onPointerMove={move} onPointerLeave={leave}
      data-auto-animate={autoAnimate || undefined}
      className={`specular-button ${sizeClasses[size]} ${className}`}
      style={{ ...variables, ...style }}>
      <span className="specular-button__tint" aria-hidden="true" />
      <span className="specular-button__shine" aria-hidden="true" />
      <span className="specular-button__content">{children}</span>
    </button>
  );
});

export default SpecularButton;
