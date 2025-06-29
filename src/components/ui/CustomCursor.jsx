import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener('mousemove', updateMousePosition);
    document.querySelectorAll('a, button, span.bg-gradient-to-r').forEach(element => {
      element.addEventListener('mouseenter', handleHoverStart);
      element.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.querySelectorAll('a, button, span.bg-gradient-to-r').forEach(element => {
        element.removeEventListener('mouseenter', handleHoverStart);
        element.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - (isHovering ? 12 : 6),
          y: mousePosition.y - (isHovering ? 12 : 6),
          scale: isHovering ? 4 : 1,
        }}
        transition={{
          type: "spring",
          mass: 0.3,
          stiffness: 200,
          damping: 20,
        }}
      >
        <div className="w-3 h-3 bg-white rounded-full" />
      </motion.div>

      {/* Cursor trail */}
      <motion.div
        className="fixed pointer-events-none z-40"
        animate={{
          x: mousePosition.x - (isHovering ? 40 : 20),
          y: mousePosition.y - (isHovering ? 40 : 20),
          scale: isHovering ? 4 : 1,
          opacity: isHovering ? 0.6 : 0.3,
        }}
        transition={{
          type: "spring",
          mass: 0.7,
          stiffness: 150,
          damping: 15,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6366F1]/30 to-[#00D4AA]/30 blur-sm" />
      </motion.div>
    </>
  );
};

export default CustomCursor; 