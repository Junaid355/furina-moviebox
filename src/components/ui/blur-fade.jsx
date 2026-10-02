import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Magic UI & Motion Primitives Blur Fade Component
 * Smooth cinematic blur-in and fade-in transitions driven by Framer Motion.
 */
export function BlurFade({
  children,
  className = "",
  variant,
  duration = 0.45,
  delay = 0,
  yOffset = 10,
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
}) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;

  const defaultVariants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
  };

  const combinedVariants = variant || defaultVariants;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      exit="hidden"
      variants={combinedVariants}
      transition={{
        delay: 0.04 + delay,
        duration,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
