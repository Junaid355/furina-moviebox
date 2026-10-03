import React, { useState, useRef, useCallback } from "react";

export function MagicCard({
  children,
  className = "",
  gradientSize = 250,
  gradientColor = "rgba(0, 242, 254, 0.22)",
  gradientOpacity = 0.8,
  onClick,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: -gradientSize, y: -gradientSize });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setOpacity(gradientOpacity);
    },
    [gradientOpacity]
  );

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ ...style, transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#050b1d] transition-all duration-200 [transform-style:preserve-3d] ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Beam */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

export default MagicCard;
