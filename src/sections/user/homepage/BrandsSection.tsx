import React, { useState, useRef, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";

// Brand assets sẽ thay thế sau

// STEM Education Partners data
const brandsData = [
  {
    name: "STEM Academy",
    category: "Education",
    icon: "�",
  },
  {
    name: "Robotics Lab",
    category: "Technology",
    icon: "🤖",
  },
  {
    name: "Coding Institute",
    category: "Programming",
    icon: "�",
  },
  {
    name: "Innovation Hub",
    category: "Research",
    icon: "�",
  },
];

// Duplicate brands for seamless loop
const brands = [...brandsData, ...brandsData];

// Statistics data for STEM education
const statsData = [
  { number: 5000, suffix: "+", label: "Học sinh tham gia" },
  { number: 95, suffix: "%", label: "Tỷ lệ hoàn thành" },
  { number: 100, suffix: "+", label: "Dự án STEM" },
  { number: 50, suffix: "+", label: "Giáo viên hướng dẫn" },
];

// Counter animation hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const startCount = 0;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = Math.floor(
        progress * (end - startCount) + startCount
      );
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [end, duration, isVisible]);

  return { count, setIsVisible };
};

const StatCard: React.FC<{ stat: (typeof statsData)[0]; delay: number }> = ({
  stat,
  delay,
}) => {
  const { count, setIsVisible } = useCounter(stat.number);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setIsVisible(true), delay);
    }
  }, [isInView, delay, setIsVisible]);

  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000 }}
    >
      <Box
        sx={{
          textAlign: "center",
          p: 3,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            background: "rgba(255, 255, 255, 0.15)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            fontSize: { xs: "2rem", md: "2.5rem" },
            mb: 1,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {count}
          {stat.suffix}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: 500,
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          {stat.label}
        </Typography>
      </Box>
    </motion.div>
  );
};

const BrandsSection: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Xử lý khi di chuột vào và ra
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <Box
      ref={sectionRef}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      sx={{
        py: { xs: 6, md: 8 },
        px: { xs: 2, md: 4 },
        background:
          "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
        position: "relative",
        overflow: "hidden",
        mb: 4,
        borderRadius: { xs: 0, md: "24px" },
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * 600,
            opacity: 0,
          }}
          animate={{
            y: [null, -20, 20, -20],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            zIndex: 1,
          }}
        />
      ))}

      <Container
        maxWidth={false}
        sx={{ maxWidth: "1440px", position: "relative", zIndex: 2 }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: 500,
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: 2,
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              Đối tác giáo dục STEM
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#ffffff",
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: "2rem", md: "3rem" },
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              Hợp tác với các tổ chức giáo dục hàng đầu
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: { xs: "1rem", md: "1.2rem" },
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Cùng đồng hành với những tổ chức giáo dục uy tín trong việc phát
              triển chương trình STEM hiện đại và hiệu quả
            </Typography>
          </Box>
        </motion.div>

        {/* Statistics Grid */}
        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {statsData.map((stat, index) => (
              <StatCard key={index} stat={stat} delay={index * 200} />
            ))}
          </Box>
        </Box>

        {/* Brands Carousel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              position: "relative",
              p: 3,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: "25px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                top: 0,
                width: "80px",
                height: "100%",
                zIndex: 2,
                pointerEvents: "none",
              },
              "&::before": {
                left: 0,
                background:
                  "linear-gradient(to right, rgba(77, 208, 225, 0.8), transparent)",
              },
              "&::after": {
                right: 0,
                background:
                  "linear-gradient(to left, rgba(0, 172, 193, 0.8), transparent)",
              },
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Box
              ref={marqueeRef}
              sx={{
                display: "flex",
                animation: isPaused ? "none" : "marquee 25s linear infinite",
                "@keyframes marquee": {
                  "0%": {
                    transform: "translateX(0)",
                  },
                  "100%": {
                    transform: `translateX(-${220 * brandsData.length}px)`,
                  },
                },
                width: "fit-content",
              }}
            >
              {brands.map((brand, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 10,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      mx: 2,
                      borderRadius: "20px",
                      p: 3,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255, 255, 255, 0.6)",
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                        transform: "translateY(-8px)",
                        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
                      },
                      width: "220px",
                      height: "120px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "3rem",
                        mb: 1,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {brand.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(0, 0, 0, 0.8)",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        textAlign: "center",
                        mb: 0.5,
                      }}
                    >
                      {brand.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(0, 0, 0, 0.6)",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        textAlign: "center",
                      }}
                    >
                      {brand.category}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default BrandsSection;
