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

    // Fontaine Hydro Water Bubbles & Twinkling Crystalline Sparkles
    const bubbleCount = 65;
    const bubbles = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3.5 + 1.2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -Math.random() * 0.8 - 0.35, // Float upwards
      opacity: Math.random() * 0.6 + 0.3,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      isSparkle: Math.random() > 0.65
    }));

    let time = 0;
    const render = () => {
      if (typeof document !== 'undefined' && (document.hidden || document.body.classList.contains('furina-player-active'))) {
        // Sleep animation while modal/player is active to keep CPU/GPU at 0% and eliminate lag
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // 1. Radiant Fontaine Aurora & Theatrical Hydro Light Rays
      const ray1X = width * 0.28 + Math.sin(time * 0.4) * 120;
      const ray2X = width * 0.72 + Math.cos(time * 0.35) * 140;
      const ray3X = width * 0.50 + Math.sin(time * 0.25) * 90;

      // Primary Cyan Hydro Ray
      const grad1 = ctx.createRadialGradient(ray1X, -20, 20, ray1X, height * 0.75, width * 0.55);
      grad1.addColorStop(0, "rgba(0, 242, 254, 0.16)");
      grad1.addColorStop(0.35, "rgba(56, 189, 248, 0.09)");
      grad1.addColorStop(0.7, "rgba(37, 99, 235, 0.04)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Deep Sapphire / Royal Hydro Ray
      const grad2 = ctx.createRadialGradient(ray2X, -40, 30, ray2X, height * 0.85, width * 0.6);
      grad2.addColorStop(0, "rgba(56, 189, 248, 0.14)");
      grad2.addColorStop(0.4, "rgba(30, 64, 175, 0.08)");
      grad2.addColorStop(0.8, "rgba(147, 51, 234, 0.03)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Center Stage Hydro Glow
      const grad3 = ctx.createRadialGradient(ray3X, 80, 10, ray3X, height * 0.5, width * 0.4);
      grad3.addColorStop(0, "rgba(103, 232, 249, 0.11)");
      grad3.addColorStop(0.5, "rgba(37, 99, 235, 0.05)");
      grad3.addColorStop(1, "transparent");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 2. Caustic Water Shimmer Waves at Upper Header
      const causticPoints = 5;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 0; i <= causticPoints; i++) {
        const x = (width / causticPoints) * i;
        const y = Math.sin(time + i * 1.2) * 25 + 35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, 0);
      ctx.closePath();
      const waveGrad = ctx.createLinearGradient(0, 0, 0, 70);
      waveGrad.addColorStop(0, "rgba(0, 242, 254, 0.08)");
      waveGrad.addColorStop(1, "transparent");
      ctx.fillStyle = waveGrad;
      ctx.fill();
      ctx.restore();

      // 3. Render Floating Hydro Bubbles & Crystalline Sparkles
      bubbles.forEach((b) => {
        b.x += b.speedX + Math.sin(time + b.pulse) * 0.25;
        b.y += b.speedY;
        b.pulse += b.pulseSpeed;

        // Wrap around smoothly
        if (b.y < -20) {
          b.y = height + 15;
          b.x = Math.random() * width;
        }
        if (b.x < -20) b.x = width + 20;
        if (b.x > width + 20) b.x = -20;

        const currentOpacity = Math.max(0.15, (Math.sin(b.pulse) * 0.4 + 0.6) * b.opacity);

        ctx.save();
        if (b.isSparkle) {
          // 4-pointed Fontaine Crystalline Star
          const size = b.radius * 1.8;
          ctx.translate(b.x, b.y);
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.quadraticCurveTo(0, 0, size, 0);
          ctx.quadraticCurveTo(0, 0, 0, size);
          ctx.quadraticCurveTo(0, 0, -size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -size);
          ctx.fillStyle = `rgba(186, 230, 253, ${currentOpacity})`;
          ctx.shadowColor = "rgba(0, 242, 254, 0.85)";
          ctx.shadowBlur = 10;
          ctx.fill();
        } else {
          // Translucent Hydro Bubble with Specular Highlight
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${currentOpacity * 0.35})`;
          ctx.strokeStyle = `rgba(186, 230, 253, ${currentOpacity * 0.85})`;
          ctx.lineWidth = 0.8;
          ctx.shadowColor = "rgba(0, 242, 254, 0.9)";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.stroke();

          // White specular dot on bubble top-left
          ctx.beginPath();
          ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.95})`;
          ctx.shadowBlur = 0;
          ctx.fill();
        }
        ctx.restore();
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
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90 ${className}`}
    />
  );
};
