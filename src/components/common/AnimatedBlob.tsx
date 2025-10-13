import { Box } from "@mui/material";
import { motion } from "framer-motion";

interface AnimatedBlobProps {
  color: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
  duration?: number;
  opacity?: number;
}

export default function AnimatedBlob({
  color,
  size = 300,
  top,
  left,
  right,
  bottom,
  delay = 0,
  duration = 20,
  opacity = 0.1,
}: AnimatedBlobProps) {
  return (
    <Box
      component={motion.div}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      sx={{
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`gradient-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <stop offset="100%" stopColor={color} stopOpacity={opacity * 0.5} />
          </linearGradient>
        </defs>
        <path
          fill={`url(#gradient-${delay})`}
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.8,87.6,-7.1,87.1C-23,86.6,-37.9,82.6,-51.4,75.1C-64.9,67.6,-77,56.6,-83.8,43.1C-90.6,29.6,-92.1,13.8,-89.7,-0.9C-87.3,-15.6,-81,-31.2,-72.4,-44.2C-63.8,-57.2,-52.9,-67.6,-39.8,-75.1C-26.7,-82.6,-11.3,-87.2,3.1,-92.1C17.5,-97,30.6,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        />
      </svg>
    </Box>
  );
}
