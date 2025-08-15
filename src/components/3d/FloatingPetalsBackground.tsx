import React, { useEffect, useState, useMemo } from "react";
import { Box } from "@mui/material";

// Interface cho mỗi cánh hoa
interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  animationDuration: number;
  animationDelay: number;
  opacity: number;
  blur: number;
}

// Component cho một cánh hoa
const FloatingPetal: React.FC<{ petal: Petal }> = ({ petal }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        left: `${petal.x}%`,
        top: `${petal.y}%`,
        width: `${petal.size}px`,
        height: `${petal.size}px`,
        borderRadius: "50% 0 50% 0",
        background: petal.color,
        opacity: petal.opacity,
        filter: `blur(${petal.blur}px)`,
        animation: `floatDown ${petal.animationDuration}s linear ${petal.animationDelay}s infinite`,
        transformOrigin: "center",
        pointerEvents: "none",
        boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
      }}
    />
  );
};

// Component chính
const FloatingPetalsBackground: React.FC = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  // Tạo cánh hoa với thuộc tính ngẫu nhiên
  const generatePetals = useMemo(() => {
    const petalColors = [
      "#FFB6C1", // Light Pink - hồng nhạt
      "#E6E6FA", // Lavender - tím lavender
      "#F0F8FF", // Alice Blue - xanh nhạt
      "#FFF8DC", // Cornsilk - vàng kem
      "#F5FFFA", // Mint Cream - xanh mint
      "#FFF0F5", // Lavender Blush - hồng lavender
      "#F0FFFF", // Azure - xanh azure
      "#FFFAFA", // Snow - trắng tuyết
    ];

    return Array.from({ length: 25 }, (_, index) => ({
      id: index,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20, // Bắt đầu từ trên màn hình
      size: Math.random() * 12 + 8, // 8-20px
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      animationDuration: Math.random() * 15 + 20, // 20-35s
      animationDelay: Math.random() * 20, // 0-20s delay
      opacity: Math.random() * 0.6 + 0.5, // 0.5-1.1
      blur: Math.random() * 1, // 0-1px blur
    }));
  }, []);

  useEffect(() => {
    setPetals(generatePetals);
  }, [generatePetals]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 1,
        pointerEvents: "none",
        "@keyframes floatDown": {
          "0%": {
            transform: "translateY(-20px) translateX(0px) rotate(0deg)",
            opacity: 0,
          },
          "10%": {
            opacity: 1,
          },
          "90%": {
            opacity: 1,
          },
          "100%": {
            transform: "translateY(100vh) translateX(50px) rotate(360deg)",
            opacity: 0,
          },
        },
        "@keyframes gentleSway": {
          "0%, 100%": {
            transform: "translateX(0px)",
          },
          "25%": {
            transform: "translateX(10px)",
          },
          "75%": {
            transform: "translateX(-10px)",
          },
        },
      }}
    >
      {petals.map((petal) => (
        <FloatingPetal key={petal.id} petal={petal} />
      ))}

      {/* Hiệu ứng gradient nhẹ nhàng ở background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 182, 193, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(230, 230, 250, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(240, 248, 255, 0.04) 0%, transparent 60%)
          `,
          zIndex: -1,
        }}
      />
    </Box>
  );
};

export default FloatingPetalsBackground;
