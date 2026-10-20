import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

/**
 * Motion Primitives — 3D Interactive Tilt Component
 * Applies spring-physics 3D perspective tilt + dynamic glare on mouse-over.
 * Automatically disables on mobile/tablet touch screens (< 1024px or non-hover)
 * to guarantee 60fps scrolling and battery efficiency.
 */
export function Tilt({
  children,
  className = '',
  style = {},
  rotationFactor = 11,
  isRevese = false,
  springOptions = { stiffness: 260, damping: 22, mass: 0.6 },
  enableGlare = true,
  desktopOnly = true,
  ...rest
}) {
  const ref = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const update = () => setIsDesktop(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, springOptions);
  const ySpring = useSpring(y, springOptions);

  const rotateX = useTransform(
    ySpring,
    [-0.5, 0.5],
    isRevese
      ? [rotationFactor, -rotationFactor]
      : [-rotationFactor, rotationFactor]
  );
  const rotateY = useTransform(
    xSpring,
    [-0.5, 0.5],
    isRevese
      ? [-rotationFactor, rotationFactor]
      : [rotationFactor, -rotationFactor]
  );

  const glareX = useTransform(xSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(ySpring, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(103, 232, 249, 0.24) 0%, rgba(56, 189, 248, 0.08) 40%, transparent 75%)`;

  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${
    isHovered ? 1.03 : 1
  }, ${isHovered ? 1.03 : 1}, 1)`;

  const handleMouseMove = (e) => {
    if ((desktopOnly && !isDesktop) || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPos = mouseX / width - 0.5;
    const yPos = mouseY / height - 0.5;

    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseEnter = () => {
    if (desktopOnly && !isDesktop) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // On mobile/touch screens, render a zero-overhead div for native performance
  if (desktopOnly && !isDesktop) {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        ...style,
        transform,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
      {enableGlare && isHovered && (
        <motion.div
          aria-hidden="true"
          style={{
            background: glareBackground,
            transform: 'translateZ(24px)',
          }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-30 transition-opacity duration-300 hidden lg:block"
        />
      )}
    </motion.div>
  );
}

export default Tilt;
