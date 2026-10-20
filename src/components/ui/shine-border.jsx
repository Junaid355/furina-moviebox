import React from 'react';

/**
 * Magic UI — ShineBorder Component
 * Renders an animated multi-tone radial shine border around cards and showcases.
 * Restricted to desktop screens (`hidden lg:block`) by default to preserve mobile performance.
 */
export function ShineBorder({
  borderRadius = 16,
  borderWidth = 1.5,
  duration = 10,
  color = ['#38bdf8', '#818cf8', '#c084fc'],
  className = '',
  desktopOnly = true,
}) {
  const colorList = Array.isArray(color) ? color.join(', ') : color;

  return (
    <div
      aria-hidden="true"
      style={{
        '--border-radius': `${borderRadius}px`,
        '--border-width': `${borderWidth}px`,
        '--shine-pulse-duration': `${duration}s`,
        '--mask-linear-gradient': `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        '--background-radial-gradient': `radial-gradient(transparent, transparent, ${colorList}, transparent, transparent)`,
        borderRadius: 'var(--border-radius)',
        padding: 'var(--border-width)',
        backgroundImage: 'var(--background-radial-gradient)',
        backgroundSize: '300% 300%',
        mask: 'var(--mask-linear-gradient)',
        WebkitMask: 'var(--mask-linear-gradient)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
      className={`pointer-events-none absolute inset-0 z-20 rounded-[inherit] will-change-[background-position] animate-shine ${
        desktopOnly ? 'hidden lg:block' : ''
      } ${className}`}
    />
  );
}

export default ShineBorder;
