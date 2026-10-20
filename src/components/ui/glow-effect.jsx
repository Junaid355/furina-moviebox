import React from 'react';
import { motion } from 'framer-motion';

export function GlowEffect({
  className = '',
  style = {},
  colors = ['#00f2fe', '#38bdf8', '#2563eb', '#7c3aed'],
  mode = 'rotate',
  blur = 'medium',
  scale = 1,
  duration = 4,
}) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration: duration,
    ease: 'linear',
  };

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(', ')})`,
      ],
      transition: BASE_TRANSITION,
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.4, 0.75, 0.4],
      transition: {
        ...BASE_TRANSITION,
        repeatType: 'mirror',
      },
    },
    breathe: {
      background: [
        ...colors.map(
          (color) =>
            `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
        ),
      ],
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        ...BASE_TRANSITION,
        repeatType: 'mirror',
      },
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`;
      }),
      transition: BASE_TRANSITION,
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(', ')})`,
    },
  };

  const getBlurClass = (b) => {
    if (typeof b === 'number') return `blur-[${b}px]`;
    const presets = {
      softest: 'blur-xs',
      soft: 'blur-sm',
      medium: 'blur-md',
      strong: 'blur-lg',
      stronger: 'blur-xl',
      none: 'blur-none',
    };
    return presets[b] || 'blur-md';
  };

  return (
    <motion.div
      style={{
        ...style,
        '--scale': scale,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      animate={animations[mode] || animations.rotate}
      className={`pointer-events-none absolute inset-0 h-full w-full scale-[var(--scale)] transform-gpu rounded-[inherit] ${getBlurClass(
        blur
      )} ${className}`}
    />
  );
}

export default GlowEffect;
