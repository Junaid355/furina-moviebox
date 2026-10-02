import React, { useId, useEffect, useState } from "react";

/**
 * Aceternity UI Sparkles Core Component
 * Generates sparkling hydro crystal particles using HTML5 Canvas.
 */
export const SparklesCore = ({
  id,
  className = "",
  background = "transparent",
  minSize = 0.6,
  maxSize = 2.4,
  particleDensity = 70,
  particleColor = "#38bdf8",
}) => {
  const generatedId = useId();
  const canvasId = id || generatedId;

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = canvas.offsetHeight || 150);

    const count = Math.floor((width * height) / 10000) * (particleDensity / 30);
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.opacity += Math.sin(Date.now() * p.twinkleSpeed) * 0.02;
        const currentOpacity = Math.max(0.1, Math.min(1, p.opacity));

        ctx.fillStyle = particleColor;
        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasId, minSize, maxSize, particleDensity, particleColor]);

  return (
    <canvas
      id={canvasId}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      style={{ background }}
    />
  );
};
