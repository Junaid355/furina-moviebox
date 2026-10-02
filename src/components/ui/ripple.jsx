import React from "react";

/**
 * Magic UI Ripple Component
 * Renders pulsing concentric water ripples perfectly suited for the Fontaine Hydro theme.
 */
export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 6,
  className = "",
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none [mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(0.04, mainCircleOpacity - i * 0.03);
        const animationDelay = `${i * 0.3}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 10 + i * 5;

        return (
          <div
            key={i}
            className={`absolute animate-ripple rounded-full border border-cyan-400/40 bg-cyan-400/5 shadow-[0_0_20px_rgba(56,189,248,0.15)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle,
              borderWidth: "1px",
            }}
          />
        );
      })}
    </div>
  );
});
