import React from "react";

export const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = "#00f2fe",
      shimmerSize = "0.08em",
      shimmerDuration = "3s",
      borderRadius = "9999px",
      background = "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(37,99,235,0.7), rgba(3,7,18,0.95))",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={{
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        }}
        className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-cyan-400/40 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)] transform-gpu transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,242,254,0.35)] ${className}`}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible">
          <div className="absolute inset-0 aspect-square h-full rounded-none">
            <div className="absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] animate-[spin_3s_linear_infinite]" />
          </div>
        </div>
        
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>

        {/* Highlight sheen */}
        <div className="absolute inset-0 size-full rounded-[inherit] px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_rgba(255,255,255,0.12)] transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_rgba(0,242,254,0.4)] group-active:shadow-[inset_0_-10px_10px_rgba(0,242,254,0.5)]" />

        {/* Backdrop */}
        <div className="absolute inset-[1px] -z-20 [border-radius:var(--radius)] [background:var(--bg)]" />
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
export default ShimmerButton;
