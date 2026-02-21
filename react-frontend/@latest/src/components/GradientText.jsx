import React from "react";
import { motion } from "framer-motion"; // Framer Motion instead of motion/react

// Utility to combine class names (replaces cn from ShadCN)
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const GradientText = ({
  text,
  className,
  gradient = "linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)",
  neon = false,
  transition = { duration: 3, repeat: Infinity, ease: "linear" },
  ...props
}) => {
  const baseStyle = { backgroundImage: gradient };

  return (
    <span className={cn("relative inline-block", className)} {...props}>
      <motion.span
        className="m-0 text-transparent bg-clip-text bg-size-[200%_100%]"
        style={baseStyle}
        animate={{ backgroundPositionX: ["0%", "200%"] }}
        transition={transition}
      >
        {text}
      </motion.span>

      {neon && (
        <motion.span
          className="m-0 absolute top-0 left-0 text-transparent bg-clip-text blur-sm mix-blend-plus-lighter bg-size-[200%_100%]"
          style={baseStyle}
          animate={{ backgroundPositionX: ["0%", "200%"] }}
          transition={transition}
        >
          {text}
        </motion.span>
      )}
    </span>
  );
};

export default GradientText;
