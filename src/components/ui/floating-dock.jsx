import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import soundFx from "../../services/soundFx";

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
            className="absolute bottom-full mb-1.5 inset-x-0 flex flex-col gap-1.5 p-1.5 bg-[#040d28]/95 backdrop-blur-xl border border-cyan-400/40 rounded-xl shadow-[0_0_20px_rgba(0,242,254,0.35)]"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 8,
                  transition: { delay: idx * 0.03 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.03 }}
              >
                <button
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#061233] border border-cyan-400/40 flex items-center justify-center text-cyan-300 hover:text-white hover:bg-cyan-500/25 transition cursor-pointer"
                  title={item.title}
                >
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
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
        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#061233]/90 backdrop-blur-md border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_14px_rgba(0,242,254,0.4)] active:scale-90 transition-transform cursor-pointer"
      >
        <span className="text-[10px] font-black">⚓</span>
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
      className={`mx-auto hidden md:flex h-15 gap-3.5 items-end rounded-2xl bg-[#040d28]/92 backdrop-blur-2xl px-4 pb-2.5 pt-2 border-2 border-cyan-400/50 shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_30px_rgba(0,242,254,0.3)] ring-1 ring-amber-400/25 ${className}`}
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
        onMouseEnter={() => {
          setHovered(true);
          soundFx.playHover?.();
        }}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        className={`aspect-square rounded-full flex items-center justify-center relative cursor-pointer transition-colors duration-200 ${
          active
            ? "bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 text-gray-950 font-black shadow-[0_0_20px_rgba(0,242,254,0.8)] border-2 border-cyan-200"
            : "bg-[#08153d] text-cyan-300 hover:text-white hover:bg-cyan-500/25 border border-cyan-500/40"
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
