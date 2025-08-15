import React, { useRef, useState, useEffect } from "react";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import { motion, useInView } from "framer-motion";
import {
  VideoCall as VideoCallIcon,
  Psychology as PsychologyIcon,
  SupportAgent as SupportIcon,
  Verified as VerifiedIcon,
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

// Features data
const featuresData = [
  {
    icon: <VideoCallIcon sx={{ fontSize: 32 }} />,
    title: "Tư vấn Video Call",
    description:
      "Kết nối trực tiếp với chuyên gia tâm lý qua video call chất lượng cao",
    color: "#4dd0e1",
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
    title: "Bài kiểm tra chuyên nghiệp",
    description:
      "Hệ thống bài test tâm lý được thiết kế bởi các chuyên gia hàng đầu",
    color: "#26c6da",
  },
  {
    icon: <SupportIcon sx={{ fontSize: 32 }} />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi",
    color: "#00acc1",
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 32 }} />,
    title: "Chuyên gia chứng nhận",
    description:
      "100+ chuyên gia tâm lý có bằng cấp và kinh nghiệm được kiểm định",
    color: "#0097a7",
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
  const heading1 = useTypewriter("Tell Me - Giải pháp ", 40);
  const heading2 = useTypewriter("toàn diện", 40);
  const heading3 = useTypewriter("cho sức khỏe tâm thần", 40);
  const description = useTypewriter(
    "Kết hợp công nghệ hiện đại với chuyên môn y tế, mang đến trải nghiệm chăm sóc sức khỏe tâm thần tốt nhất cho bạn. Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng đồng hành cùng bạn trong mọi hoàn cảnh.",
    15
  );

  // Counter effects
  const customerCounter = useCounter(1000, 2000);
  const satisfactionCounter = useCounter(98, 2000);

  // Trigger animations when in view
  useEffect(() => {
    if (isInView) {
      // Start typing animations with staggered delays
      setTimeout(() => heading1.startTyping(), 300);
      setTimeout(() => heading2.startTyping(), 900);
      setTimeout(() => heading3.startTyping(), 1300);
      setTimeout(() => description.startTyping(), 1800);

      // Start counters
      setTimeout(() => customerCounter.setIsVisible(true), 2800);
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
          "linear-gradient(180deg, #f8fbff 0%, rgba(245, 249, 250, 0.8) 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(77, 208, 225, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(38, 198, 218, 0.05) 0%, transparent 50%)",
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
                  color: "#4dd0e1",
                  fontWeight: 600,
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
              >
                Vì sao chọn chúng tôi
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
                    background: "linear-gradient(135deg, #4dd0e1, #00acc1)",
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
                      bgcolor: "#4dd0e1",
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
                    customerCounter.count > 0 ? { scale: 1, opacity: 1 } : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#4dd0e1",
                        fontSize: { xs: "1.8rem", md: "2.2rem" },
                        mb: 0.5,
                      }}
                    >
                      {customerCounter.count}+
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", fontWeight: 500 }}
                    >
                      Khách hàng tin tưởng
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
                        color: "#26c6da",
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
                      Tỷ lệ hài lòng
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
