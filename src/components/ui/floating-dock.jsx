import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

/**
 * Aceternity UI Floating Dock Component
 * Features smooth spring physics, cursor magnification, and Fontaine Hydro aesthetic.
 */
export const FloatingDock = ({
  items,
  desktopClassName = "",
  mobileClassName = "",
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({ items, className = "" }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`relative block md:hidden ${className}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2 p-2 bg-[#060e24]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.25)]"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.04 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.04 }}
              >
                <button
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#0a1533] border border-cyan-400/30 flex items-center justify-center text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition cursor-pointer"
                  title={item.title}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-[#0a1533] border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.35)] cursor-pointer"
      >
        <span className="text-xs font-black">⚓</span>
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className = "" }) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`mx-auto hidden md:flex h-14 gap-3 items-end rounded-2xl bg-[#060e24]/90 backdrop-blur-2xl px-3 pb-2.5 border border-cyan-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(56,189,248,0.2)] ${className}`}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, onClick, active }) {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 68, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 68, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 32, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 32, 20]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 160,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 160,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 160,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 160,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <motion.button
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        className={`aspect-square rounded-full flex items-center justify-center relative cursor-pointer transition-colors duration-200 ${
          active
            ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-cyan-300"
            : "bg-[#0b1633] text-cyan-300 hover:text-white hover:bg-cyan-500/20 border border-cyan-500/30"
        }`}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2.5 py-1 whitespace-pre rounded-lg bg-[#050b1d] border border-cyan-400/40 text-cyan-200 font-semibold absolute left-1/2 -top-8 w-fit text-[11px] shadow-lg pointer-events-none"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.button>
    </div>
  );
}
