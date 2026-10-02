import React, { useEffect, useRef } from "react";

export const BackgroundBeams = ({ className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Hydro water particles & glowing ambient rays
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.2, // gently float upward like bubbles
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI,
      hue: Math.random() > 0.4 ? 199 : 217 // Fontaine cyan & royal hydro blue
    }));

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle radiant hydro water rays
      const ray1X = width * 0.25 + Math.sin(time * 0.5) * 60;
      const ray2X = width * 0.75 + Math.cos(time * 0.4) * 80;

      const grad1 = ctx.createRadialGradient(ray1X, 0, 10, ray1X, height * 0.6, width * 0.5);
      grad1.addColorStop(0, "rgba(56, 189, 248, 0.045)");
      grad1.addColorStop(0.5, "rgba(37, 99, 235, 0.02)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(ray2X, 0, 10, ray2X, height * 0.7, width * 0.6);
      grad2.addColorStop(0, "rgba(103, 232, 249, 0.035)");
      grad2.addColorStop(0.5, "rgba(59, 130, 246, 0.015)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Render floating hydro bubbles / particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.025;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = Math.max(0.1, (Math.sin(p.pulse) * 0.3 + 0.5) * p.opacity);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${currentOpacity})`;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 65%, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70 ${className}`}
    />
  );
};
