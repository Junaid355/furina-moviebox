import React from "react";

/**
 * Magic UI Shine Border Component
 * Creates an iridescent shining hydro border that sweeps around content containers.
 */
export function ShineBorder({
  borderRadius = 16,
  borderWidth = 1.5,
  duration = 8,
  color = ["#38bdf8", "#2563eb", "#06b6d4"],
  className = "",
  children,
}) {
  const colorString = Array.isArray(color) ? color.join(",") : color;

  return (
    <div
      style={{
        "--border-radius": `${borderRadius}px`,
      }}
      className={`relative min-h-[50px] w-full p-px rounded-[var(--border-radius)] ${className}`}
    >
      <div
        style={{
          "--border-width": `${borderWidth}px`,
          "--border-radius": `${borderRadius}px`,
          "--duration": `${duration}s`,
          "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${colorString},transparent,transparent)`,
        }}
        className={`before:bg-shine-size pointer-events-none before:absolute before:inset-0 before:size-full before:rounded-[var(--border-radius)] before:p-[var(--border-width)] before:will-change-[background-position] before:content-[''] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] motion-safe:before:animate-shine`}
      />
      <div className="relative z-10 w-full h-full rounded-[calc(var(--border-radius)-1px)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
