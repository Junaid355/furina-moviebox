import React, { createContext, useState, useContext, useRef, useEffect } from "react";

const MouseEnterContext = createContext([false, () => {}]);

export const CardContainer = ({
  children,
  className = "",
  containerClassName = "",
  glare = true
}) => {
  const containerRef = useRef(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 22;
    const y = (e.clientY - top - height / 2) / 22;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;

    if (glare) {
      const glX = Math.round(((e.clientX - left) / width) * 100);
      const glY = Math.round(((e.clientY - top) / height) * 100);
      setGlarePos({ x: glX, y: glY, opacity: 0.35 });
    }
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    setGlarePos((p) => ({ ...p, opacity: 0 }));
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={`flex items-center justify-center [perspective:1000px] ${containerClassName}`}
        style={{ perspective: "1000px" }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`relative transition-transform duration-200 ease-out [transform-style:preserve-3d] ${className}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}

          {/* Glare Reflection Layer */}
          {glare && (
            <div
              className="pointer-events-none absolute inset-0 z-30 rounded-inherit transition-opacity duration-300"
              style={{
                borderRadius: "inherit",
                opacity: glarePos.opacity,
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.25) 0%, rgba(56,189,248,0.15) 30%, transparent 70%)`
              }}
            />
          )}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({ children, className = "" }) => {
  return (
    <div
      className={`h-full w-full [transform-style:preserve-3d] ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Component = "div",
  children,
  className = "",
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}) => {
  const ref = useRef(null);
  const [isMouseEntered] = useContext(MouseEnterContext);

  useEffect(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform = "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
    }
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <Component
      ref={ref}
      className={`transition-transform duration-200 ease-out ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};
