import React, { useRef, useState, useEffect } from "react";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import { motion, useInView } from "framer-motion";
import {
  Build as BuildIcon,
  Code as CodeIcon,
  Psychology as AIIcon,
  Groups as CollaborationIcon,
} from "@mui/icons-material";

// Typing animation hook
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    if (displayText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [displayText, text, speed, isVisible]);

  const startTyping = () => {
    setDisplayText("");
    setIsVisible(true);
  };

  return {
    displayText,
    startTyping,
    isTyping: displayText.length < text.length,
  };
};

// Counter animation hook
const useCounter = (end: number, duration: number = 1500) => {
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

// STEM Features data
const featuresData = [
  {
    icon: <BuildIcon sx={{ fontSize: 32 }} />,
    title: "Robotics & Engineering",
    description:
      "Học lập trình và điều khiển robot thông qua các dự án thực tế và thú vị",
    color: "#22c55e",
  },
  {
    icon: <CodeIcon sx={{ fontSize: 32 }} />,
    title: "Visual Programming",
    description:
      "Lập trình trực quan với drag-and-drop, dễ hiểu cho mọi lứa tuổi",
    color: "#16a34a",
  },
  {
    icon: <AIIcon sx={{ fontSize: 32 }} />,
    title: "AI & Machine Learning",
    description:
      "Khám phá trí tuệ nhân tạo qua các bài học tương tác sinh động",
    color: "#15803d",
  },
  {
    icon: <CollaborationIcon sx={{ fontSize: 32 }} />,
    title: "Collaborative Learning",
    description:
      "Học tập theo nhóm, chia sẻ dự án và cùng nhau phát triển ý tưởng",
    color: "#166534",
  },
];

const FeatureCard: React.FC<{
  feature: (typeof featuresData)[0];
  index: number;
}> = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        component={motion.div}
        whileHover={{
          y: -4,
          transition: { duration: 0.2 },
        }}
        sx={{
          height: "100%",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            background: "rgba(255, 255, 255, 1)",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Icon */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}25)`,
              color: feature.color,
              mb: 2,
            }}
          >
            {feature.icon}
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1a1a1a",
              mb: 1,
              fontSize: "1rem",
              lineHeight: 1.3,
            }}
          >
            {feature.title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              lineHeight: 1.5,
              fontSize: "0.875rem",
            }}
          >
            {feature.description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Typing effects
  const heading1 = useTypewriter("OttoBit - Nền tảng ", 40);
  const heading2 = useTypewriter("STEM giáo dục", 40);
  const heading3 = useTypewriter("tương lai", 40);
  const description = useTypewriter(
    "Kết hợp công nghệ tiên tiến với phương pháp giáo dục hiện đại, OttoBit mang đến trải nghiệm học tập STEM tốt nhất. Chúng tôi giúp học sinh phát triển tư duy logic, khả năng sáng tạo và kỹ năng giải quyết vấn đề thông qua các dự án thực tế.",
    15
  );

  // Counter effects
  const studentCounter = useCounter(5000, 2000);
  const satisfactionCounter = useCounter(95, 2000);

  // Trigger animations when in view
  useEffect(() => {
    if (isInView) {
      // Start typing animations with staggered delays
      setTimeout(() => heading1.startTyping(), 300);
      setTimeout(() => heading2.startTyping(), 900);
      setTimeout(() => heading3.startTyping(), 1300);
      setTimeout(() => description.startTyping(), 1800);

      // Start counters
      setTimeout(() => studentCounter.setIsVisible(true), 2800);
      setTimeout(() => satisfactionCounter.setIsVisible(true), 2900);
    }
  }, [isInView]);

  return (
    <Box
      ref={sectionRef}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      sx={{
        py: { xs: 8, md: 12 },
        position: "relative",
        background:
          "linear-gradient(180deg, #f0fdf4 0%, rgba(240, 253, 244, 0.8) 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(22, 163, 74, 0.08) 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: "1440px", position: "relative", zIndex: 1 }}
      >
        {/* Two Column Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: { xs: 6, lg: 8 },
            alignItems: "center",
          }}
        >
          {/* Left Column - Content */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ pr: { lg: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#22c55e",
                  fontWeight: 600,
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
              >
                Nền tảng STEM hàng đầu
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  mb: 3,
                  fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.2rem" },
                  lineHeight: 1.2,
                  minHeight: { xs: "140px", md: "200px" },
                }}
              >
                {heading1.displayText}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {heading2.displayText}
                </Box>
                {heading2.displayText && <br />}
                {heading3.displayText}
                {(heading1.isTyping ||
                  heading2.isTyping ||
                  heading3.isTyping) && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: "3px",
                      height: "1em",
                      bgcolor: "#22c55e",
                      ml: 0.5,
                      animation: "blink 1s infinite",
                      "@keyframes blink": {
                        "0%, 50%": { opacity: 1 },
                        "51%, 100%": { opacity: 0 },
                      },
                    }}
                  />
                )}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  lineHeight: 1.7,
                  mb: 4,
                  minHeight: "120px",
                }}
              >
                {description.displayText}
                {description.isTyping && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: "2px",
                      height: "1em",
                      bgcolor: "#666",
                      ml: 0.5,
                      animation: "blink 1s infinite",
                    }}
                  />
                )}
              </Typography>

              {/* Statistics */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 3,
                  mb: 4,
                }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={
                    studentCounter.count > 0 ? { scale: 1, opacity: 1 } : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#22c55e",
                        fontSize: { xs: "1.8rem", md: "2.2rem" },
                        mb: 0.5,
                      }}
                    >
                      {studentCounter.count}+
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", fontWeight: 500 }}
                    >
                      Học sinh đã tham gia
                    </Typography>
                  </Box>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={
                    satisfactionCounter.count > 0
                      ? { scale: 1, opacity: 1 }
                      : {}
                  }
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#16a34a",
                        fontSize: { xs: "1.8rem", md: "2.2rem" },
                        mb: 0.5,
                      }}
                    >
                      {satisfactionCounter.count}%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", fontWeight: 500 }}
                    >
                      Tỷ lệ hoàn thành khóa học
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </motion.div>

          {/* Right Column - Features Grid */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 3,
              }}
            >
              {featuresData.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
